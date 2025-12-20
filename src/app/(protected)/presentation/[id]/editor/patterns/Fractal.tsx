import React from "react";

interface FractalProps {
  primary: string;
  secondary?: string[];
}

export const Fractal: React.FC<FractalProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.45] pointer-events-none"
    >
      {/* Overlapping geometric planes - subtle filling */}
      <path 
        d="M 0 350 L 450 600 L 0 600 Z" 
        fill={primary} 
        opacity="0.35" 
      />
      <path 
        d="M 1000 0 L 550 0 L 1000 350 Z" 
        fill={color1} 
        opacity="0.3" 
      />
      <path 
        d="M 300 600 L 900 600 L 600 400 Z" 
        fill={color2} 
        opacity="0.25" 
      />
      
      {/* Structural highlight lines - refined thickness */}
      <line x1="0" y1="350" x2="450" y2="600" stroke={primary} strokeWidth="1.8" opacity="0.6" />
      <line x1="550" y1="0" x2="1000" y2="350" stroke={color1} strokeWidth="1.8" opacity="0.6" />
      <line x1="600" y1="400" x2="900" y2="600" stroke={color2} strokeWidth="1.8" opacity="0.6" />
    </svg>
  );
};
