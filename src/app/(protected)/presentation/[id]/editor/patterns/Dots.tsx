import React from 'react';

export const Dots = ({ color, id }: { color: string, id?: string }) => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.12]">
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`dots-pattern-${id || 'default'}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dots-pattern-${id || 'default'})`} />
    </svg>
  </div>
);
