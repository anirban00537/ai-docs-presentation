"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect } from "react";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleLogin = useCallback(
    async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "http://localhost:3000/home",
        });
      } catch (error: unknown) {
        console.error("Google login error:", error);
        throw error;
      }
    },
    []
  );

  return {
    handleGoogleLogin,
    isLoading: false,
    error: null,
  };
};

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser(session.user as any));
    } else if (!isPending && !session) {
      dispatch(clearUser());
    }
  }, [session, isPending, dispatch]);

  return {
    data: session?.user,
    isLoading: isPending,
    error
  };
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            dispatch(clearUser());
            router.push("/login");
          }
        }
      });
    } catch (error: unknown) {
      console.error("Sign out error:", error);
      // Even if sign out fails, clear local state
      dispatch(clearUser());
      router.push("/login");
    }
  }, [dispatch, router]);

  return {
    mutate: signOut,
    isPending: false,
  };
};
