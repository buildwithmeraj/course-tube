"use client";
import React from "react";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle, FaSignInAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormPanel from "@/components/ui/FormPanel";

const LoginPage = () => {
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

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!emailPattern.test(e.target.email.value)) {
        setError("Invalid email address");
        return;
      }
      if (e.target.password.value.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const result = await signIn("credentials", {
        email: e.target.email.value,
        password: e.target.password.value,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        toast.success("Login successful!");
        router.push("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }
  return (
    <FormPanel
      title="Sign in"
      description="Pick up where you left off."
      footer={
        <>
          No account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-3" onSubmit={handleCredentialsLogin}>
        {error && (
          <div className="alert alert-error alert-soft py-2 text-sm">
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="eyebrow" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="input mt-1 w-full"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="eyebrow" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="input mt-1 w-full"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <button
          className="btn btn-primary w-full"
          disabled={isLoading}
          type="submit"
        >
          <FaSignInAlt size={14} />
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

        <div className="divider my-1 text-xs text-base-content/50">or</div>

        <button
          className="btn btn-soft w-full"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <FaGoogle size={14} />
          Continue with Google
        </button>
      </form>
    </FormPanel>
  );
};

export default LoginPage;
