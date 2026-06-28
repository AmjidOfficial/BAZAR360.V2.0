import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Plus, Menu, X, ClipboardList, TrendingUp, User, Store, Sparkles, PhoneCall, Sun, Moon } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
  onCategoryChange?: (category: 'gateway' | 'auto' | 'footwear' | 'food') => void;
  lang: 'en' | 'ur';
  onLanguageToggle: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function BottomNavBar({ 
  currentTab, 
  setTab,
  currentCategory = 'gateway',
  onCategoryChange,
  lang,
  onLanguageToggle,
  theme,
  toggleTheme
}: BottomNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (tabId: string) => {
    setTab(tabId);
    setIsMenuOpen(false);
  };

  // Translations dictionary for the bottom nav bar
  const t = {
    en: {
      home: 'Home',
      post: 'Post',
      menu: 'Menu',
      title: 'Bazar360 Navigator',
      subtitle: 'Quick access multi-tenant platform hubs',
      founder: 'Founder',
      helpline: 'Helpline Connect',
      items: {
        home: { label: 'Home Dashboard', desc: 'Main hub & spotlight features' },
        inventory: { label: 'Vehicle Inventory', desc: 'Faceted search & filters' },
        insights: { label: 'Market Insights', desc: 'Pricing indexes & analytics' },
        portal: { label: 'Profile & Auth', desc: 'Sign In / Sign Up suite' },
        dealers: { label: 'Showrooms', desc: 'Verified dealer storefronts' },
        services: { label: 'Auto Services', desc: 'Inspections & financing' },
        contact: { label: 'Contact Help', desc: '24/7 customer assistance' }
      }
    },
    ur: {
      home: 'ہوم',
      post: 'پوسٹ',
      menu: 'مینو',
      title: 'بازار 360 نیویگیٹر',
      subtitle: 'پلیٹ فارم کے مختلف حصوں تک فوری رسائی',
      founder: 'بانی',
      helpline: 'ہیلپ لائن رابطہ',
      items: {
        home: { label: 'ہوم ڈیش بورڈ', desc: 'مرکزی ہب اور اہم خصوصیات' },
        inventory: { label: 'گاڑیوں کی انوینٹری', desc: 'سرچ اور فلٹرز کے ساتھ گاڑیوں کی تلاش' },
        insights: { label: 'مارکیٹ کے تجزیات', desc: 'گاڑیوں کی قیمتوں کا موازنہ' },
        portal: { label: 'پروفائل اور لاگ ان', desc: 'سائن ان اور اکاؤنٹ بنائیں' },
        dealers: { label: 'شورومز', desc: 'تصدیق شدہ برانڈ شورومز' },
        services: { label: 'آٹو سروسز', desc: 'گاڑیوں کی انسپکشن اور فنانسنگ' },
        contact: { label: 'رابطہ کریں', desc: '24/7 کسٹمر سپورٹ رابطہ' }
      }
    }
  }[lang];

  const menuItems = [
    { id: 'home', label: t.items.home.label, icon: Home, desc: t.items.home.desc },
    { id: 'inventory', label: t.items.inventory.label, icon: ClipboardList, desc: t.items.inventory.desc },
    { id: 'dealers', label: t.items.dealers.label, icon: Store, desc: t.items.dealers.desc },
    { id: 'insights', label: t.items.insights.label, icon: TrendingUp, desc: t.items.insights.desc },
    { id: 'services', label: t.items.services.label, icon: PhoneCall, desc: t.items.services.desc },
    { id: 'portal', label: t.items.portal.label, icon: User, desc: t.items.portal.desc },
    { id: 'contact', label: t.items.contact.label, icon: PhoneCall, desc: t.items.contact.desc },
  ];

  return (
    <>
      {/* Pristine Facebook Marketplace Style Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col bg-[#030712]/95 backdrop-blur-md border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe">
        <div className="relative flex justify-between items-center h-16 px-8">
          
          {/* 1. Home Button (Left Side) */}
          <button
            id="mobile-nav-home"
            onClick={() => setTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              currentTab === 'home' ? 'text-[#38BDF8]' : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Home size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[10px] font-sans font-bold tracking-wide mt-1 uppercase">{t.home}</span>
          </button>

          {/* 2. Big Center Elevated Post (+) Button */}
          <div className="relative -mt-6 flex flex-col items-center justify-center shrink-0">
            <button
              id="mobile-nav-post"
              onClick={() => setTab('sell')}
              className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0ea5e9] text-white font-black shadow-[0_4px_20px_rgba(14,165,233,0.4)] border-4 border-[#030712] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                currentTab === 'sell' ? 'bg-[#38BDF8] scale-105' : ''
              }`}
              title="Post an Ad"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <Plus size={26} strokeWidth={3} className="text-white" />
            </button>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#38BDF8] mt-1 block">{t.post}</span>
          </div>

          {/* 3. Hamburger Menu Button (Right Side) */}
          <button
            id="mobile-nav-menu"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isMenuOpen ? 'text-[#38BDF8]' : 'text-gray-400 hover:text-white'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <Menu size={20} className={isMenuOpen ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[10px] font-sans font-bold tracking-wide mt-1 uppercase">{t.menu}</span>
          </button>

        </div>
      </div>

      {/* Slide-Up Navigation Menu Drawer (Highly Polished) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 z-[110] backdrop-blur-sm md:hidden"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              // Updated background logic to work for both themes
              className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto border-t rounded-t-[32px] p-6 pb-10 z-[111] shadow-[0_-12px_40px_rgba(0,0,0,0.3)] flex flex-col max-h-[80vh] md:hidden ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0f19] border-white/5 text-white'
              }`}
            >
              {/* Logo Section - Added Here */}
              <div className="flex justify-center mb-6">
                <img 
                  src={theme === 'light' ? '/logo-light.jpg' : '/logo-dark.jpg'} 
                  alt="Bazar360 Logo" 
                  className="h-16 w-auto rounded-2xl shadow-md"
                />
              </div>

              {/* Grab Notch - Adjusted opacity for light mode */}
              <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 shrink-0 ${theme === 'light' ? 'bg-slate-300' : 'bg-white/10'}`} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
