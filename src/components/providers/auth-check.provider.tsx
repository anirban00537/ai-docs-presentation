"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/use-auth";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUserLoading } from "@/store/slices/userSlice";
import Cookie from "js-cookie";

type AuthCheckProviderProps = {
  children: React.ReactNode;
};

export const AuthCheckProvider: React.FC<AuthCheckProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const token = typeof window !== "undefined" ? Cookie.get("token") : null;
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectUserLoading);
  
  const { isLoading: isProfileLoading, isError } = useProfile();

  useEffect(() => {
    // If no token exists, redirect to login
    if (!token && pathname !== "/login") {
      router.push("/login");
      return;
    }

    // If token exists but profile fetch failed (unauthorized), redirect to login
    if (token && isError && pathname !== "/login") {
      Cookie.remove("token");
      Cookie.remove("refreshToken");
      router.push("/login");
      return;
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && pathname === "/login") {
      router.push("/my-presentations");
      return;
    }
  }, [token, isAuthenticated, isError, pathname, router]);

  // Show loading state while checking authentication
  if ((isProfileLoading || isLoading) && token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!token && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};

