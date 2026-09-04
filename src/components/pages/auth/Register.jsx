"use client";
import Link from "next/link";
import React from "react";
import { FaGoogle, FaUserPen } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormPanel from "@/components/ui/FormPanel";

const RegisterPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const photoURLPattern =
    /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|avif|svg))$/i;

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status, router]);
  // upload photo to imgbb
  const uploadPhotoToImgbb = async (file) => {
    // Create form data
    const formData = new FormData();
    // Append image file
    formData.append("image", file);

    // Make API request to imgbb
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.data.url;
  };

  const handleCredentialsRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const name = e.target.name.value.trim();
      const email = e.target.email.value.trim();
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;
      const photoFile = e.target.photo.files[0];

      if (!name || name.length < 2) {
        throw new Error("Name is required");
      }

      if (!emailPattern.test(email)) {
        throw new Error("Invalid email address");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      let photoUrl = "";

      if (photoFile) {
        setIsUploading(true);
        photoUrl = await uploadPhotoToImgbb(photoFile);
        setIsUploading(false);
      }

      if (photoUrl && !photoURLPattern.test(photoUrl)) {
        throw new Error("Invalid photo URL");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          photo: photoUrl,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success("Account created! Logging you in...");

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/profile");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/profile" });
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google");
      setIsLoading(false);
    }
  };

  // Show loading spinner while session status is loading
  if (status === "loading") {
    return (
      <div className="hero min-h-[75vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  return (
    <FormPanel
      title="Create an account"
      description="Keeps your progress, notes and resume position across devices."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
        <form className="card-body" onSubmit={handleCredentialsRegister}>
          {error && (
            <div className="alert alert-error flex items-center mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <fieldset className="fieldset">
            <label className="eyebrow">Name</label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Name"
            />
            <label className="eyebrow">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Email"
            />
            <label className="eyebrow">Profile Picture</label>
            <input type="file" className="file-input" name="photo" />
            <label className="eyebrow">Password</label>
            <input
              type="password"
              className="input"
              name="password"
              placeholder="Password"
            />
            <label className="eyebrow">Confirm Password</label>
            <input
              type="password"
              className="input"
              name="confirmPassword"
              placeholder="Confirm Password"
            />
            <button
              className="btn btn-primary mt-2 w-full"
              disabled={isLoading || isUploading}
            >
              <FaUserPlus size={14} />
              {isLoading || isUploading
                ? isLoading
                  ? "Creating account…"
                  : "Uploading…"
                : "Create account"}
            </button>

            <div className="divider my-1 text-xs text-base-content/50">or</div>

            <button
              className="btn btn-soft w-full"
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading || isUploading}
            >
              <FaGoogle size={14} />
              Continue with Google
            </button>
          </fieldset>
      </form>
    </FormPanel>
  );
};

export default RegisterPage;
