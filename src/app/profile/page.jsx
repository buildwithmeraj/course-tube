"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
export default function Profile() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Link href="/profile/courses">View Courses</Link>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
