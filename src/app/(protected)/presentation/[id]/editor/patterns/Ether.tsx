import React from "react";

interface EtherProps {
  primary: string;
  secondary?: string[];
}

export const Ether: React.FC<EtherProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none"
    >
      <defs>
        <linearGradient id="ether-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="25%" stopColor={color1} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color2} stopOpacity="0.25" />
          <stop offset="75%" stopColor={color3} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color4} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <rect width="1000" height="600" fill="url(#ether-grad)" />
      
      {/* Soft light shafts */}
      <path d="M 0 0 L 200 0 L 0 400 Z" fill={color1} opacity="0.25" />
      <path d="M 1000 600 L 800 600 L 1000 200 Z" fill={color5} opacity="0.25" />
      <path d="M 400 0 L 600 0 L 1000 600 L 800 600 Z" fill={color2} opacity="0.15" />
    </svg>
  );
};
