import React from "react";

interface PrismProps {
  primary: string;
  secondary?: string[];
}

export const Prism: React.FC<PrismProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.45] pointer-events-none"
    >
      <defs>
        <clipPath id="prism-clip">
          <rect width="1000" height="600" />
        </clipPath>
      </defs>
      
      {/* Intersecting angular planes */}
      <g clipPath="url(#prism-clip)">
        <path d="M 0 0 L 1000 200 L 1000 0 Z" fill={primary} opacity="0.25" />
        <path d="M 0 600 L 400 600 L 0 200 Z" fill={color1} opacity="0.3" />
        <path d="M 600 600 L 1000 400 L 1000 600 Z" fill={color2} opacity="0.25" />
        <path d="M 200 0 L 600 0 L 400 200 Z" fill={color3} opacity="0.15" />
        <path d="M 800 600 L 1000 600 L 1000 400 Z" fill={color4} opacity="0.2" />
        
        {/* Sharp refraction lines */}
        <line x1="0" y1="0" x2="1000" y2="200" stroke={primary} strokeWidth="1.2" opacity="0.5" />
        <line x1="400" y1="600" x2="0" y2="200" stroke={color1} strokeWidth="1.2" opacity="0.5" />
        <line x1="600" y1="600" x2="1000" y2="400" stroke={color2} strokeWidth="1.2" opacity="0.5" />
        <line x1="500" y1="0" x2="500" y2="600" stroke={color5} strokeWidth="0.8" opacity="0.3" strokeDasharray="5 5" />
      </g>
    </svg>
  );
};
