"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/use-auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser, selectIsAuthenticated } from "@/store/slices/userSlice";
import {
  fetchSubscriptionInfo,
  clearSubscriptionInfo,
} from "@/store/slices/subscriptionSlice";
import { IconLoader2 } from "@tabler/icons-react";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

// Check if path is a docs route (may be public if shareEnabled)
const isDocsPath = (pathname: string) => {
  return pathname.startsWith("/docs/");
};

// Check if path is an embed route (always public - used for export screenshots)
const isEmbedPath = (pathname: string) => {
  return pathname.startsWith("/embed/");
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { isLoading, data: user } = useProfile();

  useEffect(() => {
    // If we're on a public path, don't redirect to login
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    // Docs paths may be public if shareEnabled (checked in the page component)
    const isDocsPublicPath = isDocsPath(pathname);
    // Embed paths are always public (used for export screenshots)
    const isEmbedPublicPath = isEmbedPath(pathname);

    if (!isLoading) {
      if (!user && !isPublicPath && !isDocsPublicPath && !isEmbedPublicPath) {
        dispatch(clearUser());
        dispatch(clearSubscriptionInfo());
        router.push("/login");
      } else if (user && isPublicPath) {
        router.push("/home");
      }
      // Don't redirect away from docs pages or embed pages - let the page component handle read-only mode
    }
  }, [user, isLoading, pathname, router, dispatch]);

  // Handle subscription fetching when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptionInfo());
    }
  }, [isAuthenticated, dispatch]);

  // For embed routes, skip the loading state entirely - they don't need auth
  if (isLoading && !isEmbedPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <IconLoader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
