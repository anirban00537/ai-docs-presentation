import React from "react";

interface EchoProps {
  primary: string;
  secondary?: string[];
}

export const Echo: React.FC<EchoProps> = ({ primary, secondary = [] }) => {
  const color1 = secondary[0] || primary;
  const color2 = secondary[1] || primary;
  const color3 = secondary[2] || primary;
  const color4 = secondary[3] || primary;
  const color5 = secondary[4] || primary;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none"
    >
      <defs>
        <filter id="echo-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <g fill="none" strokeWidth="2" opacity="0.8">
        <rect x="450" y="250" width="100" height="100" rx="20" stroke={primary} />
        <rect x="400" y="200" width="200" height="200" rx="30" stroke={color1} strokeDasharray="10 5" />
        <rect x="350" y="150" width="300" height="300" rx="40" stroke={color2} />
        <rect x="250" y="50" width="500" height="500" rx="60" stroke={color3} opacity="0.6" />
        <rect x="150" y="-50" width="700" height="700" rx="80" stroke={color4} strokeDasharray="20 10" opacity="0.4" />
        <rect x="50" y="-150" width="900" height="900" rx="100" stroke={color5} opacity="0.2" filter="url(#echo-blur)" />
      </g>
    </svg>
  );
};
