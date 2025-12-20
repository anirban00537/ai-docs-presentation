import React from "react";

export const Beams: React.FC<{ color: string }> = ({ color }) => (
  <svg 
    viewBox="0 0 1000 600" 
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none"
  >
    <defs>
      <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.8" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <g transform="rotate(-15, 1000, 0)">
      <rect x="700" y="-100" width="40" height="1000" fill="url(#beam-grad)" opacity="0.6" />
      <rect x="800" y="-100" width="20" height="1000" fill="url(#beam-grad)" opacity="0.45" />
      <rect x="900" y="-100" width="60" height="1000" fill="url(#beam-grad)" opacity="0.3" />
    </g>
  </svg>
);
