import React from "react";

interface StrataProps {
  primary: string;
  secondary?: string[];
}

export const Strata: React.FC<StrataProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <filter id="strata-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
      </defs>
      
      <g filter="url(#strata-blur)">
        <rect x="0" y="550" width="1000" height="50" fill={primary} opacity="0.55" />
        <rect x="0" y="500" width="1000" height="60" fill={color1} opacity="0.4" />
        <rect x="0" y="460" width="1000" height="70" fill={primary} opacity="0.25" />
      </g>
    </svg>
  );
};
