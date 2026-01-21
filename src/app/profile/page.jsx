"use client";
import Loading from "@/components/ui/Loading";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
    router.push("/");
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="max-w-md mx-auto bg-primary rounded-xl shadow-md p-8">
      <h2 className="text-center">Profile</h2>
      <Image
        src={session.user?.image}
        alt="Profile Image"
        width={0}
        height={0}
        sizes="100vw"
        className="mx-auto mb-4 rounded-full w-28"
      />
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">Email</p>
        <p className="text-lg font-semibold text-gray-900">
          {session.user?.email}
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/profile/courses"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
        >
          View Courses
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
