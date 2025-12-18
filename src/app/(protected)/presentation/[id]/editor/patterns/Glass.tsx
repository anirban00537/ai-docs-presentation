import React from 'react';

export const Glass = ({ color }: { color: string }) => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.4]" 
    style={{ 
      background: `linear-gradient(135deg, ${color}10 0%, transparent 40%, transparent 60%, ${color}05 100%)`,
    }} 
  />
);
