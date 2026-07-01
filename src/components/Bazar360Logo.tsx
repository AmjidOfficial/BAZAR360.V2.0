import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
}

export function Bazar360Logo({ className = '', showText = true, showTagline = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="bazar360-logo">
      {/* High-Fidelity Official Bazar360 Shopping Bag & Orbit Swoosh Emblem */}
      <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-blue-600/15 to-orange-500/15 blur-sm animate-pulse" />
        
        {/* High-fidelity Vector representation of the brand emblem */}
        <svg className="w-11 h-11 select-none overflow-visible" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="bagGrad" x1="10" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0B2545" />
            </linearGradient>
            <linearGradient id="swooshGrad" x1="10" y1="80" x2="90" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
          </defs>

          {/* Bag Handles (Tilted slightly to the left -6 degrees) */}
          <g transform="rotate(-6, 50, 50)">
            {/* Left Handle attachment point */}
            <path d="M41 33 C41 21, 51 21, 51 33" stroke="#8A9FBF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Right Handle attachment point */}
            <path d="M49 33 C49 21, 59 21, 59 33" stroke="#8A9FBF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Tilted Main Shopping Bag Silhouette */}
            <path 
              d="M36 34 L64 34 L69 68 C69 73, 65 77, 60 77 L40 77 C35 77, 31 73, 31 68 Z" 
              fill="url(#bagGrad)" 
              filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" 
            />

            {/* "360" text embedded in white inside the bag */}
            <text x="50" y="55" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="-0.5">360</text>
            
            {/* Three dots below "360" */}
            <circle cx="44" cy="62" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="50" cy="62" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="56" cy="62" r="1.5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Orbit Sweeping Orange Arrow (wraps around the bottom with 3D feel) */}
          <path 
            d="M24 64 C22 75, 34 83, 50 83 C66 83, 79 74, 83 62" 
            stroke="url(#swooshGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Arrowhead pointing upwards-right */}
          <path 
            d="M83 61 L87 68 L79 66 Z" 
            fill="#FF6B00" 
            stroke="#FF6B00" 
            strokeWidth="1" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left font-sans select-none justify-center leading-none">
          {/* Row 1: BAZAR360 */}
          <div className="flex items-baseline leading-none">
            <span className="text-[17px] font-black tracking-tight text-[var(--color-text-main)] uppercase">
              BAZAR<span className="text-[#FF6B00] font-black">360</span>
            </span>
            <span className="text-[12px] font-black text-[#2563EB] dark:text-[#38BDF8] lowercase ml-1 sm:hidden">
              .online
            </span>
          </div>

          {showTagline && (
            <div className="hidden sm:flex flex-col mt-1 space-y-1">
              {/* Row 2: —— [icons] —— .online */}
              <div className="flex items-center gap-1.5 text-[8px] text-[var(--color-text-muted)] font-bold leading-none">
                <div className="h-[1px] w-4 bg-slate-500/50"></div>
                <div className="flex items-center gap-0.5">
                  <span>🛒</span>
                  <span className="text-[4px] text-[#FF6B00] opacity-80">•</span>
                  <span>🏠</span>
                  <span className="text-[4px] text-[#FF6B00] opacity-80">•</span>
                  <span>📱</span>
                  <span className="text-[4px] text-[#FF6B00] opacity-80">•</span>
                  <span>🚗</span>
                  <span className="text-[4px] text-[#FF6B00] opacity-80">•</span>
                  <span>💼</span>
                  <span className="text-[4px] text-[#FF6B00] opacity-80">•</span>
                  <span>👥</span>
                </div>
                <div className="h-[1px] w-4 bg-slate-500/50"></div>
                <span className="text-[9.5px] font-black text-[#2563EB] dark:text-[#38BDF8] lowercase -mt-0.5">
                  .online
                </span>
              </div>
              
              {/* Row 3: BUY | SELL | CONNECT */}
              <span className="text-[7.5px] font-black text-[var(--color-text-muted)] tracking-[0.16em] uppercase flex items-center justify-between leading-none">
                <span>BUY</span>
                <span className="text-[#FF6B00] font-black text-[6px] mx-1">|</span>
                <span>SELL</span>
                <span className="text-[#FF6B00] font-black text-[6px] mx-1">|</span>
                <span>CONNECT</span>
              </span>

              {/* Row 4: —— EVERYTHING YOU NEED —— */}
              <div className="flex items-center gap-1 text-[5px] font-extrabold text-[var(--color-text-muted)] tracking-widest uppercase leading-none">
                <div className="h-[0.5px] flex-1 bg-slate-600/40"></div>
                <span className="text-[5.5px] text-slate-500/90 tracking-[0.1em]">EVERYTHING YOU NEED</span>
                <div className="h-[0.5px] flex-1 bg-slate-600/40"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
