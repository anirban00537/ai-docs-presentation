"use client";

import React from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { CONFIG } from "@/lib/config";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const content = (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          <div className="h-full">{children}</div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {CONFIG.GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={CONFIG.GOOGLE_CLIENT_ID}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
};

export default Providers;

