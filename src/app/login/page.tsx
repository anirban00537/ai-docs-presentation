"use client";

import { useCallback } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { handleGoogleLogin } = useAuth();

  const onLoginSuccess = useCallback(
    (credentialResponse: CredentialResponse) => {
      handleGoogleLogin(credentialResponse).catch((error) => {
        console.error("Login failed:", error);
      });
    },
    [handleGoogleLogin]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => console.error("Google Login Failed")}
            shape="rectangular"
            width={280}
            theme="filled_blue"
            text="signin_with"
            size="large"
            useOneTap
          />
        </div>
      </div>
    </div>
  );
}
