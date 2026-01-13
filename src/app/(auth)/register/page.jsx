"use client";
import Link from "next/link";
import React from "react";
import { FaUserPen } from "react-icons/fa6";
import { FaGoogle, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status, router]);

  const handleCredentialsRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!emailPattern.test(e.target.email.value)) {
        setError("Invalid email address");
        return;
      }
      if (e.target.password.value !== e.target.confirmPassword.value) {
        setError("Passwords don't match");
        return;
      }
      if (e.target.password.value.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Logging you in...");

      // Auto login after registration
      const result = await signIn("credentials", {
        email: e.target.email.value,
        password: e.target.password.value,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login failed. Please try logging in manually.");
        router.push("/login");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
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
    <div className="flex items-center justify-center h-[85vh]">
      <div className="card bg-base-100 w-fit max-w-4xl shadow-xl flex flex-row items-center">
        <div className="flex flex-row justify-center items-center card bg-base-100 w-full shadow-xl">
          <div
            className={`hidden md:flex ${
              error ? "text-error" : "text-accent"
            } pl-4`}
          >
            <FaUserPen size={200} />
          </div>
          <div className="max-w-md shrink-0">
            <form className="card-body" onSubmit={handleCredentialsRegister}>
              <h2 className="text-center">Register</h2>
              {error && (
                <div className="alert alert-error shadow-lg flex items-center mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
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
                <label className="label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  placeholder="Name"
                />
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  placeholder="Email"
                />

                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  name="password"
                  placeholder="Password"
                />
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  className="input"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                />
                <button className="btn btn-accent mt-2" disabled={isLoading}>
                  <FaUserPlus size={20} />{" "}
                  {isLoading ? "Registering..." : "Register"}
                </button>
                <div className="divider m-0.5 font-semibold">OR</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="btn btn-soft"
                    disabled={isLoading}
                    onClick={handleGoogleRegister}
                  >
                    <FaGoogle size={20} />
                    Register
                  </button>
                  <Link className="btn btn-soft" href="/login">
                    <FaSignInAlt size={20} />
                    Login
                  </Link>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
