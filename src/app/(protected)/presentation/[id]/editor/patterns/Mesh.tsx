import React from 'react';

export const Mesh = ({ primary, color1, color2 }: { primary: string, color1: string, color2: string }) => (
  <div 
    className="absolute inset-0 pointer-events-none" 
    style={{ 
      backgroundImage: `
        radial-gradient(at 0% 0%, ${primary}15 0px, transparent 50%),
        radial-gradient(at 100% 0%, ${color1}15 0px, transparent 50%),
        radial-gradient(at 100% 100%, ${color2}15 0px, transparent 50%),
        radial-gradient(at 0% 100%, ${primary}15 0px, transparent 50%)
      `
    }} 
  />
);
