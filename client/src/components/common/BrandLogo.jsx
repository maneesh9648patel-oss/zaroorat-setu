import React from 'react';

export default function BrandLogo({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative shrink-0 ${dim} ${className}`} aria-label="ZarooratSetu Official Logo">
      <svg 
        viewBox="0 0 512 512" 
        className="w-full h-full drop-shadow-[2px_3px_0px_rgba(20,16,31,0.9)]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hard Shadow */}
        <rect x="44" y="44" width="424" height="424" rx="88" fill="#14101F" />

        {/* Lime Neon Container (Exact match to uploaded icon) */}
        <rect x="28" y="28" width="424" height="424" rx="88" fill="#C6F432" stroke="#14101F" strokeWidth="22" />

        {/* Bridge Foundations (Violet #6C3BFF) */}
        <rect x="80" y="270" width="48" height="110" rx="14" fill="#6C3BFF" stroke="#14101F" strokeWidth="16" />
        <rect x="352" y="270" width="48" height="110" rx="14" fill="#6C3BFF" stroke="#14101F" strokeWidth="16" />

        {/* Bridge Arch (Setu) Violet #6C3BFF with bold black outline */}
        <path 
          d="M 80 320 C 110 160, 370 160, 400 320 C 350 200, 130 200, 80 320 Z" 
          fill="#6C3BFF" 
          stroke="#14101F" 
          strokeWidth="18" 
          strokeLinejoin="round" 
        />

        {/* Bridge Deck Beam (Coral Pink #FF5C7A) with bold black outline */}
        <rect x="65" y="280" width="350" height="46" rx="16" fill="#FF5C7A" stroke="#14101F" strokeWidth="18" />

        {/* Central White Heart Under Arch */}
        <g transform="translate(0, -10)">
          {/* Heart drop shadow */}
          <path 
            d="M 240 250 C 240 250, 168 190, 168 138 C 168 108, 192 90, 218 90 C 232 90, 240 98, 240 98 C 240 98, 248 90, 262 90 C 288 90, 312 108, 312 138 C 312 190, 240 250, 240 250 Z" 
            fill="#14101F" 
            transform="translate(8, 8)" 
          />
          {/* White Heart with dark border */}
          <path 
            d="M 240 250 C 240 250, 168 190, 168 138 C 168 108, 192 90, 218 90 C 232 90, 240 98, 240 98 C 240 98, 248 90, 262 90 C 288 90, 312 108, 312 138 C 312 190, 240 250, 240 250 Z" 
            fill="#FFFFFF" 
            stroke="#14101F" 
            strokeWidth="16" 
            strokeLinejoin="round" 
          />
        </g>
      </svg>
    </div>
  );
}
