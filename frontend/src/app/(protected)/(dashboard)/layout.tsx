import React from "react";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div 
      className="relative flex min-h-screen w-full overflow-hidden"
    >

      {/* App Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <Image
            src="/hero-background-image.png"
            alt="Background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        <div className="container relative z-10 mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default layout;
