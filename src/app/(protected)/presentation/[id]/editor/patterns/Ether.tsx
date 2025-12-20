import React from "react";

interface EtherProps {
  primary: string;
  secondary?: string[];
}

export const Ether: React.FC<EtherProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none"
    >
      <defs>
        <linearGradient id="ether-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color1} stopOpacity="0.3" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <rect width="1000" height="600" fill="url(#ether-grad)" />
      
      {/* Soft light shafts */}
      <path d="M 0 0 L 200 0 L 0 400 Z" fill={primary} opacity="0.25" />
      <path d="M 1000 600 L 800 600 L 1000 200 Z" fill={color1} opacity="0.25" />
    </svg>
  );
};
