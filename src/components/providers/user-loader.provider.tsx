"use client";

import { useEffect } from "react";
import { useProfile } from "@/hooks/use-auth";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import Cookie from "js-cookie";

type UserLoaderProviderProps = {
  children: React.ReactNode;
};

/**
 * Component that fetches user profile on app load if token exists
 * This ensures user info is always fresh and not persisted
 */
export const UserLoaderProvider: React.FC<UserLoaderProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const token = typeof window !== "undefined" ? Cookie.get("token") : null;
  
  // This will automatically fetch user profile if token exists
  useProfile();

  useEffect(() => {
    // Clear user state if no token exists (in case of stale state)
    if (!token) {
      dispatch(clearUser());
    }
  }, [token, dispatch]);

  return <>{children}</>;
};

