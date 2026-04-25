"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card bg-base-200 p-8 shadow-md text-center space-y-3">
        <h2 className="title-accent">Signing you out</h2>
        <p className="text-base-content/70">
          Please wait a moment while we redirect you to the login page.
        </p>
        <span className="loading loading-spinner loading-md mx-auto" />
      </div>
    </div>
  );
}
