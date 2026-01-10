import React from "react";
import { AppSidebar } from "@/components/app-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="relative flex min-h-screen w-full overflow-hidden"
    >

      {/* App Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="relative bg-slate-100  z-10 flex-1 flex flex-col overflow-hidden">
        <div className="container  mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default layout;
