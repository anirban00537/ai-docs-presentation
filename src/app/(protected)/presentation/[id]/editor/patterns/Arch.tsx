import React from "react";

interface ArchProps {
  primary: string;
  secondary?: string[];
}

export const Arch: React.FC<ArchProps> = ({ primary, secondary = [] }) => {
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
      <g fill="none" strokeWidth="2" opacity="0.8">
        {/* Concentric Arches from Bottom Right */}
        <path d="M 1000 450 Q 850 450 850 600" stroke={primary} />
        <path d="M 1000 300 Q 700 300 700 600" stroke={color1} strokeDasharray="10 5" />
        <path d="M 1000 150 Q 550 150 550 600" stroke={color2} />
        <path d="M 1000 0 Q 400 0 400 600" stroke={color3} opacity="0.6" />
        
        {/* Wider fainter arches */}
        <path d="M 1000 -150 Q 250 -150 250 600" stroke={color4} opacity="0.4" />
        <path d="M 1000 -300 Q 100 -300 100 600" stroke={color5} strokeDasharray="5 5" opacity="0.2" />
      </g>
    </svg>
  );
};
