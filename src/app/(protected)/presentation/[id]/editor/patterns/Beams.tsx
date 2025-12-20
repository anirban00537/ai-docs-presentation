import React from "react";

interface BeamsProps {
  primary: string;
  secondary?: string[];
}

export const Beams: React.FC<BeamsProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.7] pointer-events-none"
    >
      <defs>
        <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="rotate(-15, 1000, 0)">
        <rect x="700" y="-100" width="40" height="1000" fill="url(#beam-grad-1)" opacity="0.8" />
        <rect x="800" y="-100" width="20" height="1000" fill="url(#beam-grad-2)" opacity="0.6" />
        <rect x="900" y="-100" width="60" height="1000" fill={color2} opacity="0.5" />
        <rect x="600" y="-100" width="10" height="1000" fill={color3} opacity="0.4" />
        <rect x="500" y="-100" width="30" height="1000" fill={color4} opacity="0.3" />
        <rect x="400" y="-100" width="15" height="1000" fill={color5} opacity="0.2" />
      </g>
    </svg>
  );
};
