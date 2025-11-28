"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { googleSignIn, profile, signOut } from "@/services/auth";
import Cookie from "js-cookie";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await googleSignIn(idToken);
      return response;
    },
    onSuccess: (response: any) => {
      // Check if response is successful
      if (response.success && response.data) {
        // Store accessToken as "token" in cookie
        if (response.data.accessToken) {
          Cookie.set("token", response.data.accessToken, { expires: 7 });
        }
        
        // Store refreshToken in cookie
        if (response.data.refreshToken) {
          Cookie.set("refreshToken", response.data.refreshToken, { expires: 30 });
        }

        // Store user data in Redux
        if (response.data.user) {
          dispatch(setUser(response.data.user));
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        console.error("Login response missing data:", response);
      }
    },
    onError: (error: unknown) => {
      console.error("Google sign in error:", error);
    },
  });

  const handleGoogleLogin = useCallback(
    async (credentialResponse: CredentialResponse) => {
      try {
        if (!credentialResponse.credential) {
          throw new Error("No credential received from Google");
        }

        // credentialResponse.credential is the id_token
        signInMutation.mutate(credentialResponse.credential);
      } catch (error: unknown) {
        console.error("Google login error:", error);
        throw error;
      }
    },
    [signInMutation]
  );

  return {
    handleGoogleLogin,
    isLoading: signInMutation.isPending,
    error: signInMutation.error,
  };
};

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const token = typeof window !== "undefined" ? Cookie.get("token") : null;

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await profile();
      if (response.data) {
        dispatch(setUser(response.data));
      }
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = Cookie.get("refreshToken");
      if (refreshToken) {
        await signOut(refreshToken);
      }
    },
    onSuccess: () => {
      // Clear cookies
      Cookie.remove("token");
      Cookie.remove("refreshToken");
      
      // Clear Redux state
      dispatch(clearUser());
      
      // Clear query cache
      queryClient.clear();
      
      // Redirect to login
      router.push("/login");
    },
    onError: (error: unknown) => {
      // Even if sign out fails, clear local state
      console.error("Sign out error:", error);
      Cookie.remove("token");
      Cookie.remove("refreshToken");
      dispatch(clearUser());
      queryClient.clear();
      router.push("/login");
    },
  });
};

