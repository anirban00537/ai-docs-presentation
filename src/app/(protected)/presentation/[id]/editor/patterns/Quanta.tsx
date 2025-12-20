import React from "react";

export const Quanta: React.FC<{ color: string }> = ({ color }) => (
  <svg 
    viewBox="0 0 1000 600" 
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full opacity-[0.3] pointer-events-none"
  >
    <defs>
      <filter id="quanta-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>
    
    <g filter="url(#quanta-blur)" opacity="0.4">
      {[...Array(40)].map((_, i) => (
        <circle 
          key={i}
          cx={Math.sin(i * 123.456) * 500 + 500}
          cy={Math.cos(i * 789.012) * 300 + 300}
          r={Math.abs(Math.sin(i)) * 2 + 0.5}
          fill={color}
          opacity={Math.abs(Math.cos(i)) * 0.5 + 0.1}
        />
      ))}
    </g>
  </svg>
);
