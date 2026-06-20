import { Bell, PlusCircle, User, ShieldAlert, LogOut, DollarSign, Wallet } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';

interface TopAppBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onPostAdClick: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onBackToGateway: () => void;
  isWithTicker?: boolean;
}

export default function TopAppBar({ 
  currentTab, 
  setTab, 
  onPostAdClick, 
  currentUser,
  onLogout,
  onBackToGateway,
  isWithTicker
}: TopAppBarProps) {
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();

  return (
    <header className={`flex justify-between items-center w-full px-4 md:px-16 h-16 fixed ${isWithTicker ? 'top-8' : 'top-0'} z-50 bg-[#070c18]/90 backdrop-blur-md border-b border-white/5 shadow-lg transition-all`}>
      <div className="flex items-center gap-3">
        {/* Dedicated Back to Gateway page button */}
        <button
          onClick={onBackToGateway}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121c32]/80 hover:bg-[#1a2d4f] text-gray-300 hover:text-white border border-[#38BDF8]/20 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer select-none active:scale-95"
          title="Return to Master Gateway View"
        >
          ← Gate
        </button>

        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setTab('home')}>
          {/* BAZAR360 Premium Responsive Logo Component */}
          <div className="flex items-center space-x-2 select-none tracking-tight">
            {/* Interactive 360-Degree Orbital Icon */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-500/30 shadow-lg group active:scale-95 transition-transform">
              <svg className="w-6 h-6 text-orange-500 animate-[spin_20s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
              <span className="absolute text-[10px] font-black text-sky-400 tracking-tighter">360</span>
            </div>
            {/* Typography Wrapper */}
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-widest leading-none">BAZAR<span className="text-orange-500 font-extrabold">360</span></span>
              <span className="text-[9px] font-bold text-sky-400 tracking-[0.25em] uppercase pl-0.5">Ecosystem</span>
            </div>
          </div>
        </div>

        {/* Dynamic active Auto Choice brand signature */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-xl text-[9.5px] font-mono font-black text-sky-400 tracking-widest uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400"></span>
          </span>
          🚗 Auto Choice
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
              : 'text-[#a3b3cc] hover:text-white'
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

      <div className="flex items-center gap-4">
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
          className={`hidden lg:flex items-center gap-1 text-[10px] font-mono font-bold tracking-tight px-2.5 py-1 rounded border transition-all ${
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
          className={`hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold tracking-tight px-2.5 py-1 rounded border transition-all ${
            currentTab === 'dealers'
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
          }`}
        >
          🏬 SHOWROOMS
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
              className="hidden lg:flex items-center gap-2 bg-[#121c32]/80 border border-white/10 rounded-full py-1 pl-1.5 pr-3 cursor-pointer text-[10px] select-none hover:border-[#38BDF8]/40 transition-colors"
              title="Manage profile & showroom roles"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-[9px] uppercase font-mono">
                {currentUser.displayName.substring(0, 1).toUpperCase()}
              </div>
              <span className="text-gray-300 font-bold max-w-[80px] truncate">{currentUser.displayName.split(' ')[0]}</span>
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
          className="hidden md:flex bg-[#F97316] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20 items-center gap-2 border border-white/5 duration-150 tracking-wider uppercase cursor-pointer"
        >
          <PlusCircle size={15} />
          AI Selling Engine
        </button>
      </div>
    </header>
  );
}
