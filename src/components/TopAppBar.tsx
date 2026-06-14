import { Bell, PlusCircle, Car } from 'lucide-react';

interface TopAppBarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onPostAdClick: () => void;
}

export default function TopAppBar({ currentTab, setTab, onPostAdClick }: TopAppBarProps) {
  return (
    <header className="flex justify-between items-center w-full px-5 md:px-16 h-16 fixed top-0 z-50 bg-[#0B1121] border-b border-white/5 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setTab('home')}>
          <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md shadow-orange-950/20">
            B
          </div>
          <span className="font-sans font-extrabold text-2xl tracking-tighter text-white select-none hover:opacity-95">
            BAZAR<span className="text-[#38BDF8]">360</span> <span className="hidden sm:inline text-[9px] font-mono font-medium opacity-50 px-1.5 py-0.5 rounded border border-white/10 ml-2">ARCHITECT v2.4</span>
          </span>
        </div>
      </div>

      {/* Web Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-wider">
        <button
          onClick={() => setTab('home')}
          className={`font-bold transition-all duration-150 ${
            currentTab === 'home'
              ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          DASHBOARD
        </button>
        <button
          onClick={() => setTab('search')}
          className={`font-bold transition-all duration-150 ${
            currentTab === 'search'
              ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          INVENTORY
        </button>
        <button
          onClick={() => setTab('dealers')}
          className={`font-bold transition-all duration-150 ${
            currentTab === 'dealers' || currentTab === 'dealer-storefront'
              ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          DEALERS
        </button>
        <button
          onClick={() => setTab('services')}
          className={`font-bold transition-all duration-150 ${
            currentTab === 'services'
              ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] pb-1'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          SERVICES
        </button>
      </nav>

      <div className="flex items-center gap-4">
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
          className="hidden md:flex bg-[#F97316] text-white px-5 py-2.0 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20 items-center gap-2 border border-white/5 duration-150 tracking-wider uppercase"
        >
          <PlusCircle size={15} />
          AI Selling Engine
        </button>
      </div>
    </header>
  );
}
