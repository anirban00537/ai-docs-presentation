import React from "react";

interface PulseProps {
  primary: string;
  secondary?: string[];
}

export const Pulse: React.FC<PulseProps> = ({ primary, secondary = [] }) => {
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
      <g fill="none" strokeWidth="1.5" opacity="0.8">
        <circle cx="0" cy="600" r="150" stroke={primary} />
        <circle cx="0" cy="600" r="300" stroke={color1} strokeDasharray="10 5" />
        <circle cx="0" cy="600" r="500" stroke={color2} />
        <circle cx="0" cy="600" r="750" stroke={color3} strokeDasharray="20 10" />
        <circle cx="0" cy="600" r="1050" stroke={color4} />
        <circle cx="1000" cy="0" r="200" stroke={color5} strokeDasharray="5 5" />
      </g>
    </svg>
  );
};
