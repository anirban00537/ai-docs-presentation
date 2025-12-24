import React from "react";
import { AppSidebar } from "@/components/app-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="relative flex min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >

      {/* App Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default layout;
