import React from "react";

interface VortexProps {
  primary: string;
  secondary?: string[];
}

export const Vortex: React.FC<VortexProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

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
        <circle cx="500" cy="300" r="100" fill={color2} opacity="0.35" />
        <ellipse cx="200" cy="100" rx="100" ry="50" fill={color3} opacity="0.2" transform="rotate(-30, 200, 100)" />
        <ellipse cx="800" cy="500" rx="120" ry="60" fill={color4} opacity="0.15" transform="rotate(30, 800, 500)" />
        <path d="M 0 0 Q 500 300 1000 0" stroke={color5} strokeWidth="2" fill="none" opacity="0.2" />
      </g>
    </svg>
  );
};
