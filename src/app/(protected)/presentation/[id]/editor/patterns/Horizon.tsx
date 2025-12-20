import React from "react";

interface HorizonProps {
  primary: string;
  secondary?: string[];
}

export const Horizon: React.FC<HorizonProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <filter id="horizon-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
        <linearGradient id="horizon-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.6" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <g filter="url(#horizon-blur)">
        {/* Layered mountain-like haze */}
        <path d="M 0 600 L 0 450 Q 250 350, 500 450 T 1000 450 L 1000 600 Z" fill="url(#horizon-grad)" opacity="0.75" />
        <path d="M 0 600 L 0 500 Q 300 450, 600 500 T 1000 500 L 1000 600 Z" fill={color1} opacity="0.45" />
        <path d="M 0 600 L 0 550 Q 400 520, 800 550 T 1000 580 L 1000 600 Z" fill={color2} opacity="0.35" />
        <circle cx="900" cy="50" r="150" fill={color3} opacity="0.15" />
      </g>
      
      {/* Top soft fade */}
      <rect width="1000" height="200" fill={color4} opacity="0.1" filter="url(#horizon-blur)" />
      <line x1="0" y1="400" x2="1000" y2="400" stroke={color5} strokeWidth="1" opacity="0.2" filter="url(#horizon-blur)" />
    </svg>
  );
};
