"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/use-auth";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/userSlice";

type AuthCheckProviderProps = {
  children: React.ReactNode;
};

export const AuthCheckProvider: React.FC<AuthCheckProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const { isLoading, data: user } = useProfile();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }

    if (!isLoading && user && pathname === "/login") {
      router.push("/home");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};
