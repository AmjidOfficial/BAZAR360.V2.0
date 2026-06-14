import { Home, Search, Plus, ShieldCheck, Store } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function BottomNavBar({ currentTab, setTab }: BottomNavBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-[#0B1121] border-t border-white/5 shadow-2xl pb-safe">
      <button
        onClick={() => setTab('home')}
        className={`flex flex-col items-center justify-center transition-colors duration-150 ${
          currentTab === 'home' ? 'text-[#38BDF8]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </button>

      <button
        onClick={() => setTab('search')}
        className={`flex flex-col items-center justify-center transition-colors duration-150 ${
          currentTab === 'search' ? 'text-[#38BDF8]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Search size={18} />
        <span className="text-[10px] font-medium mt-1">Search</span>
      </button>

      {/* Floating Center Action for AI Generator Selling feature */}
      <button
        onClick={() => setTab('sell')}
        className="flex flex-col items-center justify-center relative -top-3 cursor-pointer group"
      >
        <div className="bg-[#F97316] w-12 h-12 rounded-full flex items-center justify-center shadow-xl text-white border-4 border-[#0B1121] transition-all duration-150 group-hover:scale-105 active:scale-95">
          <Plus size={24} className="stroke-[3]" />
        </div>
        <span className="text-[10px] font-bold text-[#F97316] mt-1">Sell</span>
      </button>

      <button
        onClick={() => setTab('dealers')}
        className={`flex flex-col items-center justify-center transition-colors duration-150 ${
          currentTab === 'dealers' || currentTab === 'dealer-storefront'
            ? 'text-[#38BDF8]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Store size={18} />
        <span className="text-[10px] font-medium mt-1">Dealers</span>
      </button>

      <button
        onClick={() => setTab('services')}
        className={`flex flex-col items-center justify-center transition-colors duration-150 ${
          currentTab === 'services' ? 'text-[#38BDF8]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <ShieldCheck size={18} />
        <span className="text-[10px] font-medium mt-1">Services</span>
      </button>
    </nav>
  );
}
