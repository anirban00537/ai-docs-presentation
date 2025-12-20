import React from "react";

export const Pulse: React.FC<{ color: string }> = ({ color }) => (
  <svg 
    viewBox="0 0 1000 600" 
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full opacity-[0.2] pointer-events-none"
  >
    <g fill="none" stroke={color} strokeWidth="1" opacity="0.3">
      <circle cx="0" cy="600" r="150" />
      <circle cx="0" cy="600" r="300" strokeDasharray="10 5" />
      <circle cx="0" cy="600" r="500" />
      <circle cx="0" cy="600" r="750" strokeDasharray="20 10" />
      <circle cx="0" cy="600" r="1050" />
    </g>
  </svg>
);
