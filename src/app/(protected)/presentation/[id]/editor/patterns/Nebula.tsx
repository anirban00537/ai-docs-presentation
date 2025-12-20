import React from "react";

interface NebulaProps {
  primary: string;
  secondary?: string[];
}

export const Nebula: React.FC<NebulaProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.35] pointer-events-none"
    >
      <defs>
        <filter id="nebula-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>
      </defs>
      
      <g filter="url(#nebula-blur)">
        <circle cx="500" cy="300" r="400" fill={primary} opacity="0.3" />
        <circle cx="900" cy="100" r="300" fill={color1} opacity="0.4" />
        <circle cx="100" cy="500" r="250" fill={color1} opacity="0.2" />
      </g>
    </svg>
  );
};
