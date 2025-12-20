import React from "react";

interface AuroraProps {
  primary: string;
  secondary?: string[];
}

export const Aurora: React.FC<AuroraProps> = ({ primary, secondary = [] }) => {
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
        <filter id="aurora-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
        </filter>
      </defs>
      
      <g filter="url(#aurora-blur)">
        <ellipse cx="200" cy="600" rx="400" ry="200" fill={primary} opacity="0.5" />
        <ellipse cx="800" cy="0" rx="500" ry="300" fill={color1} opacity="0.4" />
        <ellipse cx="500" cy="300" rx="300" ry="150" fill={color2} opacity="0.3" />
        <ellipse cx="100" cy="100" rx="200" ry="100" fill={color3} opacity="0.2" />
        <ellipse cx="900" cy="500" rx="250" ry="150" fill={color4} opacity="0.25" />
      </g>
      
      {/* Moving line effect */}
      <path 
        d="M -100 500 Q 250 400 500 500 T 1100 500" 
        stroke={color5} 
        strokeWidth="2" 
        fill="none" 
        opacity="0.4" 
      />
    </svg>
  );
};
