import React from "react";
import { AppSidebar } from "@/components/app-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* === FIXED PASTEL GRADIENT BACKGROUND === */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 15%, var(--background)) 50%, var(--secondary) 100%)",
          zIndex: 0,
        }}
      >
        {/* Soft primary blob - Top Left */}
        <div
          className="absolute"
          style={{
            width: "70vw",
            height: "60vh",
            top: "-20%",
            left: "-20%",
            background: "radial-gradient(circle at center, color-mix(in srgb, var(--primary) 15%, transparent) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        
        {/* Soft secondary blob - Top Right */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "55vh",
            top: "-15%",
            right: "-15%",
            background: "radial-gradient(circle at center, color-mix(in srgb, var(--secondary) 20%, transparent) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft accent blob - Left */}
        <div
          className="absolute"
          style={{
            width: "50vw",
            height: "60vh",
            top: "20%",
            left: "-15%",
            background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft chart-1 blob - Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "55vh",
            top: "30%",
            right: "-10%",
            background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--chart-1) 10%, transparent) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft chart-2 blob - Bottom Left */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "50vh",
            bottom: "-15%",
            left: "-10%",
            background: "radial-gradient(circle at center, color-mix(in srgb, var(--chart-2) 10%, transparent) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft chart-3 blob - Bottom Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "50vh",
            bottom: "-20%",
            right: "-15%",
            background: "radial-gradient(circle at center, color-mix(in srgb, var(--chart-3) 10%, transparent) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Center soft glow */}
        <div
          className="absolute"
          style={{
            width: "50vw",
            height: "50vh",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at center, var(--background) 0%, transparent 70%)",
            opacity: 0.5,
            filter: "blur(60px)",
          }}
        />
      </div>

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
