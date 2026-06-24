import { Bell, PlusCircle, User, ShieldAlert, LogOut, DollarSign, Wallet, Menu, Sun, Moon, Monitor } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';

interface TopAppBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onPostAdClick: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onBackToGateway: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isWithTicker?: boolean;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  onCategoryChange?: (category: 'gateway' | 'auto' | 'footwear' | 'food') => void;
  onMobileMenuToggle: () => void;
}

export default function TopAppBar({ 
  currentTab, 
  setTab, 
  onPostAdClick, 
  currentUser,
  onLogout,
  onBackToGateway,
  currentTheme,
  onThemeChange,
  isWithTicker,
  currentCategory = 'gateway',
  onCategoryChange,
  onMobileMenuToggle
}: TopAppBarProps) {
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();

  return (
    <header className={`flex justify-between items-center w-full px-4 md:px-12 h-16 fixed top-0 z-50 bg-[#070c18] border-b border-white/5 shadow-2xl transition-all text-white`}>
      <div className="flex items-center gap-4">
        {/* Dedicated Back to Gateway page button */}
        <button
          onClick={onBackToGateway}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#121c32]/50 hover:bg-[#1a2d4f] text-gray-400 hover:text-white border border-white/10 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer select-none active:scale-95"
          title="Return to Master Gateway View"
        >
          ← Gate
        </button>

        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setTab('home')}>
          {/* BAZAR360 Premium Responsive Logo Component */}
          <div className="flex items-center space-x-2 select-none">
            {/* Interactive 360-Degree Orbital Icon */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 border border-white/10 shadow-lg transition-transform">
              <svg className="w-5 h-5 text-orange-500 animate-[spin_20s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
              <span className="absolute text-[9px] font-black text-sky-400 tracking-tighter">360</span>
            </div>
            {/* Typography Wrapper */}
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-[17px] font-black text-white tracking-widest leading-none">BAZAR<span className="text-orange-500">360</span></span>
                <span className="text-[8px] font-bold text-sky-400 tracking-[0.22em] uppercase pl-0.5">Ecosystem</span>
              </div>
              {currentCategory === 'auto' && (
                <>
                  <div className="h-6 w-px bg-white/20 mx-3 hidden sm:block" id="brand-vertical-divider"></div>
                  <div className="flex flex-col text-left hidden sm:flex" id="brand-premium-tag">
                    <span className="text-xs font-black text-white uppercase tracking-wider leading-none">AUTO CHOICE</span>
                    <span className="text-[7.5px] font-black text-[#ff6b00] tracking-widest uppercase mt-0.5 leading-none">PREMIUM PARTNER</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Web Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-6 font-mono text-xs tracking-wider">
        <button
          onClick={() => setTab('home')}
          className={`font-black transition-all duration-150 cursor-pointer uppercase ${
            currentTab === 'home'
              ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          HOME
        </button>
        <button
          onClick={() => setTab('inventory')}
          className={`font-black transition-all duration-150 cursor-pointer uppercase ${
            currentTab === 'inventory' || currentTab === 'search'
              ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          INVENTORY
        </button>
        <button
          onClick={() => setTab('media')}
          className={`font-black transition-all duration-150 cursor-pointer uppercase ${
            currentTab === 'media'
              ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          MEDIA FEED
        </button>
        <button
          onClick={() => setTab('insights')}
          className={`font-black transition-all duration-150 cursor-pointer uppercase ${
            currentTab === 'insights'
              ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          MARKET INSIGHTS
        </button>
        <button
          onClick={() => setTab('concierge')}
          className={`font-black transition-all duration-150 cursor-pointer uppercase ${
            currentTab === 'concierge'
              ? 'text-orange-500 border-b-2 border-orange-500 pb-1'
              : 'text-[#a3b3cc] hover:text-white'
          }`}
        >
          CONCIERGE
        </button>
      </nav>

      {/* Desktop Navigation & Utilities (hidden on mobile < 768px) */}
      <div className="hidden md:flex items-center gap-4" id="desktop-right-utilities">
        {/* Universal Pricing Switcher: PKR / USD / Dual */}
        <div className="flex items-center bg-slate-950/80 border border-white/5 rounded-xl p-1" id="global-currency-switcher-root">
          <button
            onClick={() => changeCurrencyMode('DUAL')}
            className={`px-2 py-1 text-[8.5px] font-mono font-black rounded-lg transition-all cursor-pointer ${
              currencyMode === 'DUAL'
                ? 'bg-orange-500 text-[#070c18]'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '30px' }}
            title="Show both PKR & US Dollar equivalents"
          >
            Dual
          </button>
          <button
            onClick={() => changeCurrencyMode('PKR')}
            className={`px-2 py-1 text-[8.5px] font-mono font-black rounded-lg transition-all cursor-pointer ${
              currencyMode === 'PKR'
                ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '30px' }}
            title="PKR Rupees"
          >
            PKR
          </button>
          <button
            onClick={() => changeCurrencyMode('USD')}
            className={`px-2 py-1 text-[8.5px] font-mono font-black rounded-lg transition-all cursor-pointer ${
              currencyMode === 'USD'
                ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '30px' }}
            title="United States Dollars"
          >
            $ (USD)
          </button>
        </div>

        {/* Portal Forms Toggle Shortcut */}
        <button
          onClick={() => setTab('portal')}
          className={`flex items-center gap-1 text-[10px] font-mono font-bold tracking-tight px-2.5 py-1 rounded border transition-all ${
            currentTab === 'portal'
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          PORTAL FORMS
        </button>

        {/* Verified Showrooms Shortcut */}
        <button
          onClick={() => setTab('dealers')}
          className={`flex items-center gap-1 text-[10px] font-mono font-bold tracking-tight px-2.5 py-1 rounded border transition-all ${
            currentTab === 'dealers'
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
          }`}
        >
          🏬 SHOWROOMS
        </button>

        {/* Premium Cycle Theme Toggle: Light -> Dark -> System */}
        <button
          onClick={() => {
            const nextMap: Record<string, string> = {
              'light': 'dark',
              'dark': 'system',
              'system': 'light'
            };
            onThemeChange(nextMap[currentTheme] || 'light');
          }}
          className="flex items-center justify-center w-9 h-9 bg-bg-secondary hover:bg-bg-primary text-text-muted hover:text-text-main border border-border-main rounded-xl transition-all duration-200 cursor-pointer relative group active:scale-95"
          title={`Active Theme: ${currentTheme.toUpperCase()} (Click to change)`}
          style={{ minHeight: '34px' }}
        >
          {currentTheme === 'light' && <Sun size={15} className="text-amber-500" />}
          {currentTheme === 'dark' && <Moon size={15} className="text-sky-400" />}
          {currentTheme === 'system' && <Monitor size={15} className="text-emerald-400" />}
          
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10">
            {currentTheme}
          </span>
        </button>

        {/* Sign In / Register Button for Guest Customers */}
        {!currentUser ? (
          <button
            onClick={() => setTab('portal')}
            className="text-[11px] font-sans font-extrabold text-[#38BDF8] hover:text-white border border-[#38BDF8]/30 hover:border-[#38BDF8] bg-[#38BDF8]/5 px-3.5 py-1.5 rounded-xl cursor-pointer duration-100 uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div 
              onClick={() => setTab('portal')}
              className="flex items-center gap-2 bg-[#121c32]/80 border border-white/10 rounded-full py-1 pl-1.5 pr-3 cursor-pointer text-[10px] select-none hover:border-[#38BDF8]/40 transition-colors"
              title="Manage profile & showroom roles"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-[9px] uppercase font-mono">
                {(currentUser.displayName || currentUser.email || 'User').substring(0, 1).toUpperCase()}
              </div>
              <span className="text-gray-300 font-bold max-w-[80px] truncate">
                {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
              </span>
              <span className="bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] border border-amber-500/20 uppercase tracking-wider scale-90">
                {currentUser.role}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
              title="Sign Out of session"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Simple mock notifications badge */}
        <div className="relative cursor-pointer transition-transform duration-100 hover:scale-105 active:scale-95">
          <Bell className="text-white hover:text-[#38BDF8]" size={20} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
          </span>
        </div>

        <button
          onClick={onPostAdClick}
          className="flex bg-[#F97316] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20 items-center gap-2 border border-white/5 duration-150 tracking-wider uppercase cursor-pointer"
        >
          <PlusCircle size={15} />
          AI Selling Engine
        </button>
      </div>

      {/* Mobile-Only Burger Menu Trigger Button (Visible only < 768px viewports) */}
      <button
        onClick={onMobileMenuToggle}
        className="flex md:hidden text-white hover:text-orange-500 transition-all p-2 bg-[#121c32]/40 rounded-xl border border-white/5 cursor-pointer active:scale-95"
        id="mobile-drawer-toggle-btn"
        title="Open Navigation Menu"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
