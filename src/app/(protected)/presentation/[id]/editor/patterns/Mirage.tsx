import React from "react";

export const Mirage: React.FC<{ color: string }> = ({ color }) => (
  <svg 
    viewBox="0 0 1000 600" 
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full opacity-[0.45] pointer-events-none"
  >
    <defs>
      <filter id="mirage-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
      </filter>
    </defs>
    
    <g filter="url(#mirage-blur)" opacity="0.65">
      <path 
        d="M 200 0 Q 300 300, 200 600" 
        fill="none" 
        stroke={color} 
        strokeWidth="60" 
        opacity="0.35" 
      />
      <path 
        d="M 500 0 Q 400 300, 500 600" 
        fill="none" 
        stroke={color} 
        strokeWidth="40" 
        opacity="0.3" 
      />
      <path 
        d="M 800 0 Q 900 300, 800 600" 
        fill="none" 
        stroke={color} 
        strokeWidth="80" 
        opacity="0.2" 
      />
    </g>
  </svg>
);
