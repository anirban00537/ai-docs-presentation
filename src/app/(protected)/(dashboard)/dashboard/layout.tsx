import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="relative flex flex-col">
        <div className="flex flex-1 flex-row overflow-hidden">
          <div className="flex-1 flex h-full items-center justify-center">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
