import { useState, useEffect } from 'react';

// Live average PKR to USD Exchange Rate
const USD_TO_PKR_RATE = 278;

export function convertPkrToUsd(pkr: number): number {
  return Math.round(pkr / USD_TO_PKR_RATE);
}

export function formatPkrPrice(pkr: number): string {
  if (pkr >= 10000000) {
    const crores = pkr / 10000000;
    return `Rs. ${parseFloat(crores.toFixed(2))} Crore`;
  } else if (pkr >= 1000000) {
    const lakhs = pkr / 100000;
    return `Rs. ${parseFloat(lakhs.toFixed(2))} Lakh`;
  }
  return `Rs. ${pkr.toLocaleString()}`;
}

export function formatUsdPrice(pkr: number): string {
  const usd = convertPkrToUsd(pkr);
  return `$${usd.toLocaleString()}`;
}

/**
 * Returns formatted dual price string like "Rs. 2.50 Crore ($ 89,928)"
 */
export function formatDualPrice(pkr: number, includeUsd = true): string {
  const pkrFormatted = formatPkrPrice(pkr);
  if (!includeUsd) return pkrFormatted;
  const usdFormatted = formatUsdPrice(pkr);
  return `${pkrFormatted} (${usdFormatted})`;
}

// Global active currency hook for options
export function useCurrencyMode() {
  const [currencyMode, setCurrencyMode] = useState<'PKR' | 'USD' | 'DUAL'>(() => {
    try {
      return (localStorage.getItem('bazar360-currency-preference') as 'PKR' | 'USD' | 'DUAL') || 'DUAL';
    } catch(e) {
      return 'DUAL';
    }
  });

  useEffect(() => {
    const handleCurrencyChange = (e: CustomEvent<'PKR' | 'USD' | 'DUAL'>) => {
      setCurrencyMode(e.detail);
    };
    window.addEventListener('bazar360-currency-change' as any, handleCurrencyChange);
    return () => {
      window.removeEventListener('bazar360-currency-change' as any, handleCurrencyChange);
    };
  }, []);

  const changeCurrencyMode = (mode: 'PKR' | 'USD' | 'DUAL') => {
    try { localStorage.setItem('bazar360-currency-preference', mode); } catch(e) {}
    setCurrencyMode(mode);
    window.dispatchEvent(new CustomEvent('bazar360-currency-change', { detail: mode }));
  };

  const renderPrice = (pkr: number) => {
    if (currencyMode === 'PKR') return formatPkrPrice(pkr);
    if (currencyMode === 'USD') return formatUsdPrice(pkr);
    return formatDualPrice(pkr); // DUAL mode (default)
  };

  return { currencyMode, changeCurrencyMode, renderPrice };
}
