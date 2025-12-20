import React from "react";

interface GaussianProps {
  primary: string;
  secondary?: string[];
}

export const Gaussian: React.FC<GaussianProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none"
    >
      <defs>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
        </filter>
      </defs>
      
      {/* Soft overlapping orbs - refined opacities */}
      <circle cx="950" cy="50" r="250" fill={primary} filter="url(#blur)" opacity="0.4" />
      <circle cx="50" cy="550" r="300" fill={color1} filter="url(#blur)" opacity="0.35" />
      <circle cx="800" cy="500" r="200" fill={color2} filter="url(#blur)" opacity="0.25" />
      
      {/* Light sweep sweep */}
      <rect 
        x="-200" y="250" width="1400" height="60" 
        fill={primary} 
        filter="url(#blur)" 
        transform="rotate(-12, 500, 300)" 
        opacity="0.2"
      />
    </svg>
  );
};
