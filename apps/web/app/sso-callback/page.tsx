"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({ redirectUrl: window.location.href });
  }, [handleRedirectCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}
