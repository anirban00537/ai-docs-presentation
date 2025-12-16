import React from "react";
import { AppSidebar } from "@/components/app-sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* === FIXED PASTEL GRADIENT BACKGROUND === */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #fdfbfb 0%, #f8f9ff 50%, #f5f7ff 100%)",
          zIndex: 0,
        }}
      >
        {/* Soft lavender blob - Top Left */}
        <div
          className="absolute"
          style={{
            width: "70vw",
            height: "60vh",
            top: "-20%",
            left: "-20%",
            background: "radial-gradient(circle at center, rgba(196, 181, 253, 0.6) 0%, rgba(196, 181, 253, 0.25) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        
        {/* Soft sky blue blob - Top Right */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "55vh",
            top: "-15%",
            right: "-15%",
            background: "radial-gradient(circle at center, rgba(147, 197, 253, 0.55) 0%, rgba(147, 197, 253, 0.2) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft rose blob - Left */}
        <div
          className="absolute"
          style={{
            width: "50vw",
            height: "60vh",
            top: "20%",
            left: "-15%",
            background: "radial-gradient(ellipse at center, rgba(251, 207, 232, 0.6) 0%, rgba(251, 207, 232, 0.2) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft mint blob - Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "55vh",
            top: "30%",
            right: "-10%",
            background: "radial-gradient(ellipse at center, rgba(167, 243, 208, 0.5) 0%, rgba(167, 243, 208, 0.15) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft peach blob - Bottom Left */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "50vh",
            bottom: "-15%",
            left: "-10%",
            background: "radial-gradient(circle at center, rgba(254, 215, 170, 0.55) 0%, rgba(254, 215, 170, 0.15) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft lilac blob - Bottom Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "50vh",
            bottom: "-20%",
            right: "-15%",
            background: "radial-gradient(circle at center, rgba(221, 214, 254, 0.6) 0%, rgba(196, 181, 253, 0.2) 50%, transparent 70%)",
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
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%)",
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
