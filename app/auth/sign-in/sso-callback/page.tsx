"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SSOSuccessPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Wait until auth is initialized
    if (isSignedIn === undefined) return;

    if (isSignedIn) {
      // Redirect to dashboard
      router.replace("/dashboard");
    } else {
      // If something failed, go back to sign-in
      router.replace("/auth/sign-up");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Completing sign-in...</h1>
    </div>
  );
}
