import { Home, ClipboardList, Film, TrendingUp, PhoneCall } from 'lucide-react';

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
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    { id: 'media', label: 'Media Feed', icon: Film },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'concierge', label: 'Concierge', icon: PhoneCall },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col bg-[#070c18]/95 backdrop-blur-md border-t border-sky-500/10 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
      <nav className="flex justify-around items-center h-16 pb-safe pl-2 pr-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`btn-nav-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-14 min-w-[54px] transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-white'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-orange-500/10 text-orange-500 scale-110' : ''}`}>
                <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

