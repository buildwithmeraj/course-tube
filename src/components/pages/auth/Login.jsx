"use client";
import React from "react";
import { signIn, useSession } from "next-auth/react";
import { BiLogInCircle } from "react-icons/bi";
import { FaGoogle, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
        setInterval(location.reload(), 2000);
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
            className={`hidden md:flex ${error ? "text-error" : "text-accent"}`}
          >
            <BiLogInCircle size={200} />
          </div>
          <div className="max-w-md shrink-0">
            <form className="card-body" onSubmit={handleCredentialsLogin}>
              <h2 className="text-center">Login</h2>
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
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  name="email"
                  placeholder="Email"
                />
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  name="password"
                  placeholder="Password"
                />

                <button
                  className="btn btn-accent mt-2"
                  disabled={isLoading}
                  type="submit"
                >
                  <FaSignInAlt size={20} />
                  {isLoading ? "Logging in..." : "Login"}
                </button>
                <div className="divider m-0.5 font-semibold">OR</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="btn btn-soft"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <FaGoogle size={20} />
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                  <Link className="btn btn-soft" href="/register">
                    <FaUserPlus size={20} />
                    Register
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

export default LoginPage;
