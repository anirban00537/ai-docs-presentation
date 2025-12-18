import React from 'react';

export const Grid = ({ color, id }: { color: string, id?: string }) => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`grid-pattern-${id || 'default'}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={color} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-pattern-${id || 'default'})`} />
    </svg>
  </div>
);
