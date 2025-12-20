import React from "react";

interface ConstellationProps {
  primary: string;
  secondary?: string[];
}

export const Constellation: React.FC<ConstellationProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.22] pointer-events-none"
    >
      {/* Scattered Dots - refined sizing */}
      <g fill={primary}>
        <circle cx="150" cy="120" r="3" />
        <circle cx="210" cy="190" r="2" />
        <circle cx="180" cy="80" r="1.5" />
      </g>
      
      <g fill={color1}>
        <circle cx="850" cy="450" r="3" />
        <circle cx="910" cy="530" r="2" />
        <circle cx="820" cy="500" r="1.5" />
      </g>

      {/* Connection lines - balanced opacity */}
      <g stroke={primary} strokeWidth="0.8" opacity="0.4" fill="none">
        <path d="M 150 120 L 210 190 L 180 80 Z" />
        <line x1="210" y1="190" x2="320" y2="210" strokeDasharray="4 4" />
      </g>
      
      <g stroke={color1} strokeWidth="0.8" opacity="0.4" fill="none">
        <path d="M 850 450 L 910 530 L 820 500 Z" />
        <line x1="820" y1="500" x2="700" y2="480" strokeDasharray="4 4" />
      </g>

      {/* Technical Sector Grid (Top-Left) - subtle lines */}
      <g opacity="0.25">
        {[...Array(8)].map((_, i) => (
          <line key={`h-${i}`} x1="30" y1={30 + i * 15} x2="135" y2={30 + i * 15} stroke={primary} strokeWidth="0.6" />
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={`v-${i}`} x1={30 + i * 15} y1="30" x2={30 + i * 15} y2="135" stroke={primary} strokeWidth="0.6" />
        ))}
      </g>
    </svg>
  );
};
