import React from "react";

interface FluidProps {
  primary: string;
  secondary?: string[];
}

export const Fluid: React.FC<FluidProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <linearGradient id="fluid-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Smooth, organic liquid shapes */}
      <path 
        d="M -100 300 C 150 150, 350 450, 600 300 S 850 150, 1100 300 V 600 H -100 Z" 
        fill="url(#fluid-grad-1)" 
        opacity="0.6"
      />
      <path 
        d="M -100 400 C 200 250, 400 550, 700 400 S 900 250, 1100 400 V 600 H -100 Z" 
        fill={color2} 
        opacity="0.25"
      />
      
      {/* Subtle highlight edge */}
      <path 
        d="M -100 300 C 150 150, 350 450, 600 300 S 850 150, 1100 300" 
        fill="none" 
        stroke={primary} 
        strokeWidth="1.5" 
        opacity="0.5" 
      />
    </svg>
  );
};
