import React from "react";

interface LuminaProps {
  primary: string;
  secondary?: string[];
}

export const Lumina: React.FC<LuminaProps> = ({ primary, secondary = [] }) => {
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
        <filter id="lumina-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
        </filter>
        <radialGradient id="lumina-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <g filter="url(#lumina-blur)">
        {/* Soft focal glows */}
        <circle cx="200" cy="150" r="150" fill="url(#lumina-grad)" opacity="0.6" />
        <circle cx="800" cy="450" r="180" fill={color1} opacity="0.45" />
        <circle cx="500" cy="100" r="120" fill={color2} opacity="0.3" />
        <circle cx="100" cy="500" r="100" fill={color3} opacity="0.25" />
        
        {/* Subtle light streaks */}
        <rect x="0" y="280" width="1000" height="40" fill={color4} opacity="0.25" transform="rotate(-5, 500, 300)" />
        <rect x="0" y="100" width="1000" height="20" fill={color5} opacity="0.15" transform="rotate(10, 500, 100)" />
      </g>
    </svg>
  );
};
