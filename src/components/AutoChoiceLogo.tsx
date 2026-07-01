import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function AutoChoiceLogo({ className = '', showText = true }: LogoProps) {
  const [imgSrc, setImgSrc] = useState('/auto_choice_logo_1781509565476.png');
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (imgSrc === '/auto_choice_logo_1781509565476.png') {
      setImgSrc('/auto_choice_logo_1781509565476.jpg');
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} id="auto-choice-logo">
      {/* Luxury Gold & Deep Blue Crest */}
      <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {/* Soft Golden Pulsing Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 opacity-20 animate-pulse blur-[1px]" />
        
        {/* Logo Image or Vector Wrapper */}
        <div className="relative w-11 h-11 rounded-xl bg-[#0b0f19] flex items-center justify-center border border-amber-500/50 shadow-lg overflow-hidden p-0.5">
          {!hasError ? (
            <img 
              src={imgSrc} 
              alt="Auto Choice Flagship" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            /* Custom Sleek Luxury Sedan Profile Line Art Vector */
            <svg viewBox="0 0 100 45" className="w-full h-full text-white p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main aerodynamic car contour */}
              <path 
                d="M 5,28 C 15,25 22,24 28,18 C 34,12 45,10 52,10 C 60,10 70,12 78,18 C 84,23 88,25 95,28 C 96,30 94,34 91,34 C 88,34 85,34 84,34 C 81,30 75,30 72,34 C 45,34 40,34 32,34 C 29,30 23,30 20,34 C 15,34 8,34 6,34 C 4,32 4,29 5,28 Z" 
                stroke="currentColor" 
                strokeWidth="1.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Side window contour lines */}
              <path 
                d="M 32,19 C 38,13 45,13 49,13 C 55,13 63,14 68,19" 
                stroke="currentColor" 
                strokeWidth="1.1" 
                strokeLinecap="round" 
              />
              {/* Window divider pillar */}
              <line x1="50" y1="13" x2="50" y2="21" stroke="currentColor" strokeWidth="0.8" />
              
              {/* Elegant Amber/Gold underglow line */}
              <line x1="12" y1="39" x2="88" y2="39" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
              
              {/* Wheel Arch Accent Highlights */}
              <circle cx="26" cy="34" r="5" stroke="currentColor" strokeWidth="1.5" fill="#0b0f19" />
              <circle cx="26" cy="34" r="1.5" fill="#f59e0b" />
              
              <circle cx="78" cy="34" r="5" stroke="currentColor" strokeWidth="1.5" fill="#0b0f19" />
              <circle cx="78" cy="34" r="1.5" fill="#f59e0b" />
            </svg>
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left font-sans">
          <span className="text-[14px] font-black text-[var(--color-text-main)] uppercase tracking-wider leading-none">
            Auto <span className="text-amber-500 font-black">Choice</span>
          </span>
          <span className="text-[7.5px] font-black text-orange-500 tracking-widest uppercase mt-1 leading-none">
            FLAGSHIP SHOWROOM
          </span>
        </div>
      )}
    </div>
  );
}
