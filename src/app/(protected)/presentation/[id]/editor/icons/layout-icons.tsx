import React from "react";

export const TwoColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="16" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="22" y="2" width="16" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ThreeColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="15" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="28" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const FourColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="12" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="22" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="32" y="2" width="6" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const SmartLayoutIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const NumberCardIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="12" r="6" fill="#90EE90" stroke="currentColor" strokeWidth="1.5" />
    <text x="20" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">1</text>
    <rect x="8" y="22" width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="28" width="20" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
    <rect x="8" y="32" width="18" height="2" rx="1" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

