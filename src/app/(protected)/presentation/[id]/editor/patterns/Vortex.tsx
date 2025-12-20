import React from "react";

interface VortexProps {
  primary: string;
  secondary?: string[];
}

export const Vortex: React.FC<VortexProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.55] pointer-events-none"
    >
      <defs>
        <filter id="vortex-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="70" />
        </filter>
        <radialGradient id="vortex-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <g filter="url(#vortex-blur)">
        <path 
          d="M 500 300 m -200, 0 a 200,200 0 1,0 400,0 a 200,200 0 1,0 -400,0" 
          fill="url(#vortex-grad)" 
          transform="rotate(45, 500, 300) scale(1.5, 0.8)"
          opacity="0.75"
        />
        <circle cx="500" cy="300" r="100" fill={color1} opacity="0.35" />
      </g>
    </svg>
  );
};
