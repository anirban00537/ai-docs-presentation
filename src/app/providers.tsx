"use client";

import React from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { queryClient } from "@/lib/query-client";
import { UserLoaderProvider } from "@/components/providers/user-loader.provider";
import { SubscriptionLoaderProvider } from "@/components/providers/subscription-loader.provider";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // NEXT_PUBLIC_ prefix is required for client-side environment variables in Next.js
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google authentication will not work."
    );
  }

  const content = (
    <Provider store={store}>
      <UserLoaderProvider>
        <SubscriptionLoaderProvider>
          <div className="h-full">{children}</div>
        </SubscriptionLoaderProvider>
      </UserLoaderProvider>
    </Provider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
};

export default Providers;
