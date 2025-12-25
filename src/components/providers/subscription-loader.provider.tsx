"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionInfo, clearSubscriptionInfo } from "@/store/slices/subscriptionSlice";
import { selectIsAuthenticated } from "@/store/slices/userSlice";
import Cookie from "js-cookie";

type SubscriptionLoaderProviderProps = {
  children: React.ReactNode;
};

/**
 * Component that fetches subscription and credit info on app load if user is authenticated
 */
export const SubscriptionLoaderProvider: React.FC<SubscriptionLoaderProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = typeof window !== "undefined" ? Cookie.get("token") : null;

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchSubscriptionInfo());
    } else if (!token) {
      dispatch(clearSubscriptionInfo());
    }
  }, [isAuthenticated, token, dispatch]);

  return <>{children}</>;
};
