import React from "react";

interface NebulaProps {
  primary: string;
  secondary?: string[];
}

export const Nebula: React.FC<NebulaProps> = ({ primary, secondary = [] }) => {
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
        <filter id="nebula-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>
      </defs>
      
      <g filter="url(#nebula-blur)">
        <circle cx="500" cy="300" r="400" fill={primary} opacity="0.45" />
        <circle cx="900" cy="100" r="300" fill={color1} opacity="0.55" />
        <circle cx="100" cy="500" r="250" fill={color2} opacity="0.35" />
        <circle cx="300" cy="100" r="150" fill={color3} opacity="0.25" />
        <circle cx="800" cy="500" r="200" fill={color4} opacity="0.3" />
        <circle cx="100" cy="50" r="100" fill={color5} opacity="0.2" />
      </g>
    </svg>
  );
};
