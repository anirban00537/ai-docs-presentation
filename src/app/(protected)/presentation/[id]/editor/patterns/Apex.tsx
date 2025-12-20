import React from "react";

interface ApexProps {
  primary: string;
  secondary?: string[];
}

export const Apex: React.FC<ApexProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none"
    >
      <g strokeWidth="2" opacity="0.8">
        {/* Rising Triangles from Bottom Center */}
        <path d="M 500 450 L 600 600 L 400 600 Z" fill="none" stroke={primary} />
        <path d="M 500 300 L 700 600 L 300 600 Z" fill="none" stroke={color1} strokeDasharray="10 5" />
        <path d="M 500 150 L 800 600 L 200 600 Z" fill="none" stroke={color2} />
        <path d="M 500 0 L 900 600 L 100 600 Z" fill="none" stroke={color3} opacity="0.6" />
        
        {/* Backdrop faint triangles */}
        <path d="M 200 600 L 500 100 L 800 600" fill="none" stroke={color4} strokeWidth="1" opacity="0.2" />
        <path d="M 0 600 L 500 -100 L 1000 600" fill="none" stroke={color5} strokeWidth="1" opacity="0.1" />
      </g>
    </svg>
  );
};
