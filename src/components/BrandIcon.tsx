import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number;
}

export function BrandIcon({ className = 'w-10 h-10', size = 40 }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="12"
        fill="#0F2342"
        stroke="#2176C7"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <rect x="44" y="10" width="8" height="5" rx="1.5" fill="#00897B" />
      <rect x="14" y="18" width="36" height="4.5" rx="1" fill="#2176C7" />
      <rect x="19" y="29" width="26" height="3.5" fill="#145DA0" />
      <rect x="30" y="22.5" width="4" height="19.5" fill="#145DA0" />
      <rect x="14" y="18" width="5" height="26" rx="1" fill="#FFFFFF" />
      <rect x="45" y="18" width="5" height="26" rx="1" fill="#FFFFFF" />
      <rect x="12" y="42" width="40" height="5" rx="1" fill="#FFFFFF" />
      <rect x="14" y="47" width="8" height="5" rx="1" fill="#2176C7" />
      <rect x="42" y="47" width="8" height="5" rx="1" fill="#2176C7" />
    </svg>
  );
}
