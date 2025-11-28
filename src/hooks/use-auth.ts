"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { googleSignIn, profile, signOut } from "@/services/auth";
import Cookie from "js-cookie";

export const useGoogleSignIn = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await googleSignIn(idToken);
      return response;
    },
    onSuccess: (response: any) => {
      // Store tokens if provided in response
      if (response.data?.token) {
        Cookie.set("token", response.data.token, { expires: 7 });
      }
      if (response.data?.refreshToken) {
        Cookie.set("refreshToken", response.data.refreshToken, { expires: 30 });
      }

      // Fetch user profile and update Redux
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      console.error("Google sign in error:", error);
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        // The library returns access_token by default
        // For Google Sign-In with backend, we typically need id_token
        // Try to get id_token from response, or use access_token
        const idToken = (tokenResponse as any).id_token || tokenResponse.access_token;
        
        if (idToken) {
          signInMutation.mutate(idToken);
        } else {
          throw new Error("No token available from Google");
        }
      } catch (error: unknown) {
        console.error("Google sign in error:", error);
        signInMutation.reset();
      }
    },
    onError: (error: unknown) => {
      console.error("Google OAuth error:", error);
      signInMutation.reset();
    },
  });

  return {
    googleLogin,
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

