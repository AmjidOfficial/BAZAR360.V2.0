import { Bell, PlusCircle, User, ShieldAlert, LogOut, DollarSign, Wallet, Menu, Sun, Moon, Monitor, LogOut as LogOutIcon } from 'lucide-react';
import { UserProfile } from '../lib/dbService';
import { useCurrencyMode } from '../lib/currency';
import { useTheme } from './ThemeContext';

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
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
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
  lang,
  onLanguageToggle
}: TopAppBarProps) {
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`flex justify-between items-center w-full px-4 md:px-12 h-16 fixed top-0 z-50 bg-[#0F172A]/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-b-slate-200 dark:border-b-white/5 shadow-sm transition-all text-slate-800 dark:text-white`}>
      <div className="flex items-center gap-4">

        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setTab('home')}>
          {/* BAZAR360 Premium Responsive Logo Component */}
          <div className="flex items-center space-x-2 select-none">
            {/* Real high-fidelity shopping bag "360" brand logo from guidelines */}
            <div className="flex items-center gap-2">
              <svg className="w-10 h-10 select-none flex-shrink-0" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Top dark blue/white arching bracket/arrow */}
                <path 
                  d="M 40 50 H 60 C 75 25, 110 25, 125 50" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  fill="none" 
                  className="stroke-[#0B2240] dark:stroke-white" 
                />
                {/* 2 white/blue rivets on the left of upper arc */}
                <circle cx="46" cy="45" r="2.5" className="fill-white dark:fill-[#0F2E59]" />
                <circle cx="54" cy="45" r="2.5" className="fill-white dark:fill-[#0F2E59]" />

                {/* Bottom orange arrow arc */}
                <path 
                  d="M 35 95 C 45 130, 95 130, 115 105" 
                  stroke="#FF6B00" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  fill="none" 
                />
                {/* Arrow head for orange arc */}
                <path d="M 110 106 L 122 102 L 118 114 Z" fill="#FF6B00" />

                {/* Number "36" of 360 */}
                <text 
                  x="18" 
                  y="96" 
                  className="font-sans font-black fill-[#0B2240] dark:fill-white" 
                  fontSize="70" 
                  letterSpacing="-4"
                >
                  36
                </text>

                {/* Orange filled circle with shopping cart icon (representing "0") */}
                <circle cx="115" cy="75" r="24" fill="url(#orangeLogoGrad)" />
                <circle cx="115" cy="75" r="18" fill="#FFFFFF" />
                
                {/* Orange shopping cart path inside the circle */}
                <path 
                  d="M 103 66 L 107 66 L 110 78 L 123 78 L 126 69 L 109 69" 
                  stroke="#FF6B00" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                />
                <circle cx="113" cy="84" r="2.5" fill="#FF6B00" />
                <circle cx="121" cy="84" r="2.5" fill="#FF6B00" />

                <defs>
                  <linearGradient id="orangeLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8A00" />
                    <stop offset="100%" stopColor="#FF5200" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Typography Wrapper */}
              <div className="flex items-center">
                <div className="flex flex-col text-left">
                  <div className="flex items-baseline leading-none">
                    <span className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight font-sans">BAZAR<span className="text-orange-500">360</span></span>
                    <span className="text-[11px] font-extrabold text-[#38BDF8] ml-0.5 font-sans lowercase">.online</span>
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.18em] uppercase pl-0.5 mt-0.5 font-sans">
                    BUY <span className="text-orange-500 font-black">|</span> SELL <span className="text-orange-500 font-black">|</span> CONNECT
                  </span>
                </div>
                {currentCategory === 'auto' && (
                  <>
                    <div className="h-6 w-px bg-white/10 mx-3 hidden sm:block" id="brand-vertical-divider"></div>
                    <div className="flex flex-col text-left hidden sm:flex" id="brand-premium-tag">
                      <span className="text-xs font-black text-white uppercase tracking-wider leading-none font-sans">AUTO CHOICE</span>
                      <span className="text-[7.5px] font-black text-orange-500 tracking-widest uppercase mt-0.5 leading-none">PREMIUM PARTNER</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Web Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-6 font-sans text-xs tracking-wider">
        {(() => {
          const navItems = {
            en: [
              { id: 'home', label: 'Home' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'dealers', label: 'Showrooms' },
              { id: 'services', label: 'Services' },
              { id: 'contact', label: 'Contact' }
            ],
            ur: [
              { id: 'home', label: 'ہوم' },
              { id: 'inventory', label: 'انوینٹری' },
              { id: 'dealers', label: 'شورومز' },
              { id: 'services', label: 'سروسز' },
              { id: 'contact', label: 'رابطہ' }
            ]
          }[lang || 'en'];

          return navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'inventory' && currentTab === 'search');
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`font-extrabold transition-all duration-150 cursor-pointer uppercase ${
                  isActive
                    ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          });
        })()}
      </nav>

      {/* Desktop Navigation & Utilities (hidden on mobile < 768px) */}
      <div className="hidden md:flex items-center gap-4" id="desktop-right-utilities">

        {/* Sign In / Register Button for Guest Customers */}
        {!currentUser ? (
          <button
            onClick={() => setTab('portal')}
            className="text-xs font-sans font-extrabold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl cursor-pointer duration-100 uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div 
              onClick={() => setTab('portal')}
              className="flex items-center gap-2 bg-[#1E293B] border border-white/5 rounded-full py-1.5 pl-2 pr-3.5 cursor-pointer text-xs select-none hover:border-[#38BDF8] transition-colors animate-fade-in"
              title="Manage profile & showroom roles"
            >
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-[9px] uppercase font-mono">
                {(currentUser.displayName || currentUser.email || 'User').substring(0, 1).toUpperCase()}
              </div>
              <span className="text-white font-bold max-w-[90px] truncate">
                {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
              </span>
              <span className="bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] border border-amber-500/20 uppercase tracking-wider scale-90">
                {currentUser.role}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
              title="Sign Out of session"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Desktop Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 text-[#38BDF8] font-mono font-black text-[10px] rounded-xl border border-white/10 cursor-pointer transition-all active:scale-95 select-none uppercase tracking-wider"
          title={lang === 'en' ? "اردو میں تبدیل کریں" : "Switch to English"}
        >
          {lang === 'en' ? 'اردو' : 'English'}
        </button>

        {/* Desktop Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-[#1E293B]/80 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#38BDF8] rounded-xl border border-white/10 cursor-pointer transition-all active:scale-95 select-none"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          onClick={onPostAdClick}
          className="flex bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-500/15 items-center gap-2 border border-rose-500/10 duration-150 tracking-wider uppercase cursor-pointer"
        >
          <PlusCircle size={15} />
          {lang === 'en' ? 'Post Your Ad' : 'اشتہار لگائیں'}
        </button>
      </div>
    </header>
  );
}
