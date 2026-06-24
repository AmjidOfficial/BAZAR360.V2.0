import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Plus, Menu, X, ClipboardList, TrendingUp, User, Store, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  onCategoryChange?: (category: 'gateway' | 'auto' | 'footwear' | 'food') => void;
}

export default function BottomNavBar({ 
  currentTab, 
  setTab,
  currentCategory = 'gateway',
  onCategoryChange
}: BottomNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (tabId: string) => {
    setTab(tabId);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'inventory', label: 'Vehicle Inventory', icon: ClipboardList, desc: 'Faceted search & filters' },
    { id: 'insights', label: 'Market Insights', icon: TrendingUp, desc: 'Pricing indexes & analytics' },
    { id: 'portal', label: 'User Profile & Onboarding', icon: User, desc: 'Quick pass registration suite' },
    { id: 'dealers', label: 'Dealership Showrooms', icon: Store, desc: 'Dynamic brand storefronts' },
    { id: 'concierge', label: 'VIP Concierge Service', icon: HelpCircle, desc: 'Bespoke vehicle procurement' },
  ];

  return (
    <>
      {/* Streamlined Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col bg-bg-secondary/95 backdrop-blur-md border-t border-border-main shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pb-safe">
        <div className="relative flex justify-between items-center h-16 px-6">
          
          {/* Home Link (Essential) */}
          <button
            id="btn-nav-home"
            onClick={() => setTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              currentTab === 'home' ? 'text-accent-main' : 'text-text-muted hover:text-text-main'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Home size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider mt-1">Home</span>
          </button>

          {/* Center Floating Post (+) button */}
          <div className="relative -mt-6 flex flex-col items-center justify-center shrink-0">
            <button
              onClick={() => setTab('sell')}
              className={`w-14 h-14 rounded-full flex items-center justify-center bg-accent-main text-stone-950 font-black shadow-[0_8px_24px_rgba(var(--color-accent-main-rgb,197,168,128),0.3)] hover:shadow-[0_12px_32px_rgba(var(--color-accent-main-rgb,197,168,128),0.55)] border-4 border-bg-secondary transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
                currentTab === 'sell' ? 'bg-accent-main scale-105' : ''
              }`}
              title="Post an Ad"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <Plus size={24} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90 text-stone-950" />
            </button>
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-accent-main mt-1 block">POST</span>
          </div>

          {/* Hamburger Menu Trigger for Secondary Links */}
          <button
            id="btn-nav-menu"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isMenuOpen ? 'text-accent-main' : 'text-text-muted hover:text-text-main'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Menu size={20} className={isMenuOpen ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider mt-1">Menu</span>
          </button>

        </div>
      </div>

      {/* Slide-Up Navigation Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-sm md:hidden"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-bg-secondary border-t border-border-main rounded-t-[32px] p-6 pb-10 z-[111] shadow-[0_-12px_40px_rgba(0,0,0,0.6)] text-text-main flex flex-col max-h-[75vh] md:hidden"
            >
              {/* Notch */}
              <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto mb-5 shrink-0" />

              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-text-main flex items-center gap-1.5">
                    <Sparkles size={14} className="text-accent-main" /> BAZAR360 NAVIGATOR
                  </h3>
                  <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-widest">
                    Quick-access multi-tenant platform hubs
                  </p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-bg-primary border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Navigation list */}
              <div className="space-y-2.5 overflow-y-auto pr-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-accent-main/10 border-accent-main text-accent-main'
                          : 'bg-bg-primary border-border-main hover:border-text-muted/30 text-text-main'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-accent-main text-stone-950' : 'bg-bg-secondary border border-border-main text-text-muted'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5 font-mono">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer info inside menu */}
              <div className="mt-6 pt-5 border-t border-border-main/50 text-center text-[9px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">
                Founder: Muhammad Amjid <br />
                Helpline Connect: <span className="text-text-main font-bold">03149198403</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
