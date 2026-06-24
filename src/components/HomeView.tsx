import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  SlidersHorizontal, 
  Calendar, 
  DollarSign, 
  Activity, 
  Building, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  Video, 
  ChevronRight, 
  Gauge, 
  Compass,
  Calculator,
  Wrench,
  FileText,
  UserCheck,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Grid,
  List
} from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { useCurrencyMode } from '../lib/currency';
import { PAKISTAN_CITIES_MATRIX, ALL_PAKISTAN_CITIES } from '../lib/cities';
import { UserProfile, dbSaveLead } from '../lib/dbService';
import AutoChoiceEngine from './AutoChoiceEngine';
import { VehicleCard } from './VehicleCard';

export const VEHICLE_DICTIONARY: Record<string, Array<{ make: string; model: string; price: number; description: string }>> = {
  SUV: [
    { make: 'Toyota', model: 'Fortuner Legender', price: 18500000, description: 'High performance urban diesel SUV.' },
    { make: 'Porsche', model: 'Cayenne GTS', price: 55000000, description: 'High performance luxury SUV.' },
    { make: 'Changan', model: 'Oshan X7', price: 8200000, description: 'Premium intelligence spacious family SUV.' }
  ],
  Sedan: [
    { make: 'Honda', model: 'Civic RS Turbo', price: 9800000, description: 'Sleek sports sedan with high torque agility.' },
    { make: 'Toyota', model: 'Corolla Altis Grande', price: 7800000, description: 'Highly reliable executive luxury sedan.' },
    { make: 'BMW', model: '3 Series 320i', price: 21000000, description: 'German engineered high precision luxury sedan.' }
  ],
  Electric: [
    { make: 'Tesla', model: 'Model S', price: 38000000, description: 'Supercharged triple-motor high Agility electric sedan.' },
    { make: 'Audi', model: 'e-tron', price: 42000000, description: 'Luxury electric gran turismo with futuristic curves.' },
    { make: 'Deepal', model: 'S07 EV', price: 10500000, description: 'Futuristic dynamic cabin smart EV.' },
    { make: 'BYD', model: 'Seal Premium', price: 14500000, description: 'Sleek sports electric sedan with advanced battery cells.' }
  ],
  Luxury: [
    { make: 'Porsche', model: '911 Carrera S', price: 85000000, description: 'Elite rear-engine legacy sports coupe.' },
    { make: 'BMW', model: 'M4', price: 45000000, description: 'High power racing spec luxury coupe.' },
    { make: 'Tesla', model: 'Model S', price: 38000000, description: 'Supercharged triple-motor electric luxury.' },
    { make: 'Audi', model: 'e-tron', price: 42000000, description: 'Futuristic German luxury electric.' }
  ]
};

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentCategory?: string;
  currentUser?: UserProfile | null;
}

const ELITE_WHEEL_LIST = [
  { id: 'wheel-1', name: 'Porsche 911 GT3 RS', year: 2024, mileage: 'Total Genuine (1,200 km)', price: 'Rs. 7.6 Crore', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600' },
  { id: 'wheel-2', name: 'Mercedes-Benz AMG G63', year: 2023, mileage: 'Total Genuine (4,800 km)', price: 'Rs. 9.2 Crore', img: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=600' },
  { id: 'wheel-3', name: 'BMW M4 Competition', year: 2024, mileage: 'Brand New (0 km)', price: 'Rs. 4.8 Crore', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600' },
  { id: 'wheel-4', name: 'Toyota Land Cruiser ZX', year: 2024, mileage: 'Total Genuine (150 km)', price: 'Rs. 11.5 Crore', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600' },
];

export default function HomeView({
  dealers,
  listings,
  setTab,
  setSelectedCategory,
  setSearchQuery,
  onSelectDealer,
  onSelectListing,
  onToggleCompare,
  compareList = [],
  currentCategory = 'auto',
  currentUser
}: HomeViewProps) {
  const { currencyMode, renderPrice } = useCurrencyMode();
  const [budgetInputText, setBudgetInputText] = useState('350 Lac');
  const [dictType, setDictType] = useState<string>('All');
  const [dictModel, setDictModel] = useState<string>('All');
  const [selectedFutureSector, setSelectedFutureSector] = useState<{ title: string; tagline: string; desc: string; icon: string; spec: string } | null>(null);
  const [engineView, setEngineView] = useState<'dashboard' | 'drilldown'>('dashboard');

  // VERTICAL DYNAMIC CAROUSEL CORE
  const [wheelActiveIndex, setWheelActiveIndex] = useState(0);

  const rotateWheelDown = () => {
    setWheelActiveIndex((prev) => (prev + 1) % ELITE_WHEEL_LIST.length);
  };

  const rotateWheelUp = () => {
    setWheelActiveIndex((prev) => (prev - 1 + ELITE_WHEEL_LIST.length) % ELITE_WHEEL_LIST.length);
  };

  const getFlankingIndex = (offset: number) => {
    return (wheelActiveIndex + offset + ELITE_WHEEL_LIST.length) % ELITE_WHEEL_LIST.length;
  };
  
  // Real-time search filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterMake, setFilterMake] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterPriceRange, setFilterPriceRange] = useState<number>(35000000); // 3.5 Crore PKR Default max
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [filterYearMin, setFilterYearMin] = useState<number>(2000);
  const [filterYearMax, setFilterYearMax] = useState<number>(2026);
  const [cardLayout, setCardLayout] = useState<'grid' | 'list'>('grid');

  // Real-time synchronization of currency switches to the budget typing input box
  React.useEffect(() => {
    if (currencyMode === 'USD') {
      const usdVal = Math.round(filterPriceRange / 278);
      setBudgetInputText(`${Math.round(usdVal / 1000)}k`);
    } else {
      setBudgetInputText(`${filterPriceRange / 100000} Lac`);
    }
  }, [currencyMode]);

  // Interactive Bottom Sheet (Mobile Only)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeSheetField, setActiveSheetField] = useState<'keywords' | 'city' | 'budget' | null>(null);

  // BAZAR360 Direct Trade VIP intake overlay states
  const [isDirectTradeOpen, setIsDirectTradeOpen] = useState(false);
  const [directTradeForm, setDirectTradeForm] = useState({
    requirements: '',
    budget: '',
    query: ''
  });

  // Appraisal Estimator State (Built-in to Auto Choice Managed Bargains)
  const [appraisalBrand, setAppraisalBrand] = useState('Suzuki');
  const [appraisalYear, setAppraisalYear] = useState(2021);
  const [appraisalCondition, setAppraisalCondition] = useState(8);
  const [appraisalResult, setAppraisalResult] = useState<number | null>(null);

  // Horizontal Mesh Services State
  const [activeMeshTool, setActiveMeshTool] = useState<string | null>(null);
  const [meshInputs, setMeshInputs] = useState({
    inspName: '',
    inspPhone: '',
    inspDate: '',
    insCarVal: 3000000,
    finDownPayment: 1000000,
    finTenure: 3, // years
    regPlate: '',
  });
  const [meshMessage, setMeshMessage] = useState('');

  // Brand items for marquee
  const brandList = ['Suzuki', 'Toyota', 'Honda', 'BYD', 'Changan', 'Zeekr', 'Deepal'];

  const getBrandLogoSvg = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'suzuki':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 20 20 4 20 8 8 20" />
            <polyline points="4 16 16 4" strokeWidth="1.5" />
          </svg>
        );
      case 'toyota':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="12" rx="10" ry="6" />
            <ellipse cx="12" cy="11" rx="5" ry="3.5" />
            <line x1="12" y1="6" x2="12" y2="17" />
          </svg>
        );
      case 'honda':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-[#38BDF8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M7 7 V17 H17 V7 M7 12 H17" />
          </svg>
        );
      case 'byd':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M7 10 h6 a1.5 1.5 0 0 1 0 3 H7 M9 9 v5" />
          </svg>
        );
      case 'changan':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,5 18,15 14,15 12,10 10,15 6,15" />
            <circle cx="12" cy="12" r="9" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        );
      case 'zeekr':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7 h14 L5 16 h14" />
            <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        );
      case 'deepal':
        return (
          <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,4 19,16 12,12 5,16" />
          </svg>
        );
      default:
        return <span>✦</span>;
    }
  };

  // Handle category triggers
  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    setSelectedCategory(category);
  };

  // Collect and aggregate real-time activity feeds from all dealers
  const aggregatedActivities = dealers.flatMap((dealer) => {
    return (dealer.activityFeed || []).map((feed) => ({
      ...feed,
      dealerId: dealer.id,
      dealerName: dealer.name,
      dealerAvatar: dealer.avatarUrl,
      dealerLetter: dealer.avatarLetter
    }));
  });

  const uniqueMakes = ['All', ...new Set(listings.map(l => l.make))];
  const uniqueCities = ALL_PAKISTAN_CITIES;

  // Calculate Appraisal
  const handleCalculateAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    let basePrice = 2500000;
    
    // Brand multipliers
    if (appraisalBrand === 'Toyota') basePrice = 4500000;
    else if (appraisalBrand === 'Honda') basePrice = 3800000;
    else if (appraisalBrand === 'BYD') basePrice = 8500000;
    else if (appraisalBrand === 'Zeekr') basePrice = 9500000;
    else if (appraisalBrand === 'Deepal') basePrice = 7500000;

    // Age multiplier
    const currentYear = 2026;
    const age = Math.max(0, currentYear - appraisalYear);
    const ageFactor = Math.max(0.4, 1 - (age * 0.05));

    // Condition multiplier
    const conditionFactor = 0.5 + (appraisalCondition * 0.05);

    const result = Math.round(basePrice * ageFactor * conditionFactor);
    setAppraisalResult(result);
  };

  // Handle service bookings
  const handleServiceSubmit = (e: React.FormEvent, tool: string) => {
    e.preventDefault();
    if (tool === 'inspection') {
      if (!meshInputs.inspPhone || !meshInputs.inspPhone) {
        setMeshMessage('Please fill in your name and cell number');
        return;
      }
      dbSaveLead({
        id: `lead-insp-${Date.now()}`,
        type: 'Inspection Booking',
        title: 'Certified Doorstep Diagnostic Audit',
        userName: meshInputs.inspName || currentUser?.displayName || 'Guest Prospect',
        userPhone: meshInputs.inspPhone || currentUser?.phoneNumber || 'N/A',
        userEmail: currentUser?.email || 'N/A',
        city: 'Lahore',
        details: `Requested physical inspection at home. Appointment Date: ${meshInputs.inspDate || 'Tomorrow'}`,
        createdAt: new Date().toISOString()
      });
      setMeshMessage(`✓ Physical Spot Inspection booked successfully! Our Auto Choice certified mechanic will visit on ${meshInputs.inspDate || 'tomorrow'}.`);
    } else if (tool === 'reg') {
      if (!meshInputs.regPlate) {
        setMeshMessage('Please enter a plate chassis sequence');
        return;
      }
      dbSaveLead({
        id: `lead-reg-${Date.now()}`,
        type: 'Excise Query Check',
        title: 'Excise Title Verification Lookup',
        userName: currentUser?.displayName || 'Anonymous Visitor',
        userPhone: currentUser?.phoneNumber || 'N/A',
        userEmail: currentUser?.email || 'N/A',
        city: 'Federal/KPK',
        details: `Queried Plate sequences register check: ${meshInputs.regPlate.toUpperCase()}`,
        createdAt: new Date().toISOString()
      });
      setMeshMessage(`🔍 Query: Plated record ${meshInputs.regPlate.toUpperCase()} identified with KPK Excise. Verified clear. No active token liabilities.`);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterMake('All');
    setFilterCity('All');
    setFilterPriceRange(35000000);
    setFilterTransmission('All');
    setActiveCategory('All');
    setSortBy('Newest');
    setFilterYearMin(2000);
    setFilterYearMax(2026);
  };

  // Dynamic filtering pipeline
  const filteredListings = listings.filter((car) => {
    if (car.approved === false) return false;

    // Category filter
    if (activeCategory !== 'All') {
      const matchTag = car.tags && car.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());
      const matchFuel = car.fuelType?.toLowerCase() === activeCategory.toLowerCase();
      if (!matchTag && !matchFuel) return false;
    }

    // Keyword search
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchTitle = car.title.toLowerCase().includes(q);
      const matchMake = car.make.toLowerCase().includes(q);
      const matchModel = car.model.toLowerCase().includes(q);
      const matchDesc = car.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchMake && !matchModel && !matchDesc) return false;
    }

    // Make dropdown filter
    if (filterMake !== 'All' && car.make !== filterMake) return false;

    // City location filter
    if (filterCity !== 'All') {
      const listingDealer = dealers.find(d => d.id === car.dealerId);
      const dealerLoc = listingDealer?.location || '';
      if (!dealerLoc.toLowerCase().includes(filterCity.toLowerCase())) return false;
    }

    // Max Price filter
    if (car.price > filterPriceRange) return false;

    // Transmission type
    if (filterTransmission !== 'All' && car.transmission !== filterTransmission) return false;

    // Year range filter
    if (car.year && (car.year < filterYearMin || car.year > filterYearMax)) return false;

    return true;
  });

  // Sort logic - "Newly Uploaded" priority
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    } else if (sortBy === 'PriceLow') {
      return a.price - b.price;
    } else if (sortBy === 'PriceHigh') {
      return b.price - a.price;
    }
    return 0;
  });

  const openMobileSheet = (field: 'keywords' | 'city' | 'budget') => {
    setActiveSheetField(field);
    setIsBottomSheetOpen(true);
  };

  return (
    <div id="bazar360-home-viewport" className="flex flex-col space-y-8 pb-16 animate-fade-in text-white font-sans">

      {/* CUSTOM INTEGRATED STUDIO-GRADE CAR DETAIL ARCHITECTURE & INTERACTIVE CANVAS ENGINE */}
      <section className="order-1">
        <AutoChoiceEngine 
          allListings={listings} 
          onViewChange={setEngineView}
          onSelectExternalListing={(listingId) => {
            const found = listings.find(l => l.id === listingId);
            if (found) onSelectListing(found);
          }} 
        />
      </section>

      {engineView === 'dashboard' && (
        <>
          {/* 1. HIGHLY VISUAL CATEGORY/BRAND ICON GRID SPLIT */}
      <section className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl order-1">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[10px] font-mono font-black text-[#38BDF8] uppercase tracking-wider">
            Explore Bazar360 Portals By Group
          </span>
          <span className="text-[9px] text-gray-500 font-mono uppercase">Direct Entry Points</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'SUV & Jeeps', icon: '🚙', tag: 'SUV', count: listings.filter(l => l.tags?.some(t => t === 'SUV')).length + ' units' },
            { name: 'Luxury Sedans', icon: '🚘', tag: 'Sedan', count: listings.filter(l => l.tags?.some(t => t === 'Sedan')).length + ' units' },
            { name: 'Electric Motors', icon: '⚡', tag: 'Electric', count: listings.filter(l => l.tags?.some(t => t === 'Electric')).length + ' units' },
            { name: 'Showroom VIPs', icon: '🏬', tab: 'dealers', count: dealers.length + ' showrooms' },
            { name: 'Market Media', icon: '📣', tab: 'media', count: 'Live feeds' },
            { name: 'Insights Center', icon: '📈', tab: 'insights', count: 'Escrow active' },
          ].map((item, i) => (
            <button
              key={`cat-grid-${i}`}
              type="button"
              onClick={() => {
                if (item.tag) {
                  handleCategoryPress(item.tag);
                  setTab('inventory');
                } else if (item.tab) {
                  setTab(item.tab);
                }
              }}
              className="bg-[#0c1322] hover:bg-[#121a2a] border border-white/5 hover:border-orange-500/40 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 duration-150 active:scale-95 transition-all select-none cursor-pointer group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold text-white uppercase group-hover:text-orange-400 truncate tracking-tight">{item.name}</p>
                <p className="text-[8.5px] text-gray-500 font-mono font-medium truncate mt-0.5">{item.count}</p>
              </div>
            </button>
          ))}
        </div>
      </section>


      {/* 2. DUAL SELLING PIPELINE SELECTOR MATRIX */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 order-4">
        
        {/* Sell It Myself Module */}
        <div className="bg-[#121a2a]/90 border border-white/5 hover:border-orange-500/30 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl group duration-200">
          <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono font-black uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Independent path
              </span>
              <Sparkles size={14} className="text-orange-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                📣 Sell It Myself AI Shorthand
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-sans">
                Post your vehicle directly onto BAZAR360. Enter crude shorthand parameters or let our modern model write polished marketing descriptions, allocate keywords, and suggest optimum PKR pricing indices.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#070c12]/80 rounded-xl border border-white/5">
                <span className="text-base">🚀</span>
                <p className="text-white font-mono font-bold text-[9px] mt-1 uppercase">1-Click AI Translation</p>
              </div>
              <div className="p-3 bg-[#070c12]/80 rounded-xl border border-white/5">
                <span className="text-base">⚡</span>
                <p className="text-white font-mono font-bold text-[9px] mt-1 uppercase">Direct Buyer Inboxes</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTab('sell')}
            className="mt-6 w-full bg-[#1e293b] hover:bg-orange-500 hover:text-slate-950 py-3.5 px-4.5 rounded-2xl text-[10px] font-mono font-black tracking-widest uppercase flex items-center justify-center gap-2 duration-150 active:scale-[0.98] transition-transform"
            style={{ minHeight: '48px' }}
          >
            Launch Listing Wizard <ChevronRight size={14} />
          </button>
        </div>

        {/* Auto Choice Managed Bargains (VIP Consignment with Interactive Appraisal Engine) */}
        <div className="bg-[#121a2a]/90 border border-white/5 hover:border-[#38BDF8]/40 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between duration-200">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#38BDF8] opacity-5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-mono font-black uppercase text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded border border-[#38BDF8]/20">
                Premium Managed Channel
              </span>
              <ShieldCheck size={14} className="text-[#38BDF8]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                ⭐ Auto Choice Managed VIP Bargains
              </h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">
                Delegate absolute vehicle logistics to BAZAR360's certified mechanics. Physical appraisal, excise biometrics, pricing ledger code allocation, and instant premium display coverage.
              </p>
            </div>

            {/* Appraisal Estimator Live Tool */}
            <form onSubmit={handleCalculateAppraisal} className="bg-[#070c12]/90 p-4 rounded-2xl border border-white/5 space-y-3.5">
              <div className="border-b border-white/5 pb-1.5 flex justify-between items-center">
                <span className="text-[9px] font-mono font-black text-[#38BDF8] uppercase flex items-center gap-1">
                  <Calculator size={10} /> In-House Appraisal Estimator
                </span>
                <span className="text-[8px] text-gray-500 font-mono">Live calculation</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-gray-500 font-mono font-bold block">Brand / Maker</label>
                  <select 
                    value={appraisalBrand}
                    onChange={(e) => { setAppraisalBrand(e.target.value); setAppraisalResult(null); }}
                    className="w-full bg-[#121c32]/80 border border-white/10 text-white font-mono text-[10px] rounded-lg p-1.5"
                  >
                    {brandList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-gray-500 font-mono font-bold block">Year</label>
                  <select 
                    value={appraisalYear}
                    onChange={(e) => { setAppraisalYear(parseInt(e.target.value)); setAppraisalResult(null); }}
                    className="w-full bg-[#121c32]/80 border border-white/10 text-white font-mono text-[10px] rounded-lg p-1.5"
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2018, 2015].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-gray-500 font-mono font-bold block">Condition ({appraisalCondition}/10)</label>
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={appraisalCondition}
                    onChange={(e) => { setAppraisalCondition(parseInt(e.target.value)); setAppraisalResult(null); }}
                    className="w-full h-1 bg-[#121c32] rounded appearance-none cursor-pointer accent-orange-500 mt-2.5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {appraisalResult !== null ? (
                  <div className="flex-grow bg-[#1a2e4c]/40 border border-[#38BDF8]/20 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[7.5px] font-mono text-gray-400 block uppercase">Estimate range PKR</span>
                      <span className="text-sm font-black text-[#38BDF8]">
                        Rs. {(appraisalResult - 250000).toLocaleString()} - {(appraisalResult + 250000).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/923159085086?text=Hi%20Auto%20Choice,%20I'd%20like%20to%20consign%20my%20${appraisalBrand}%20${appraisalYear}%20(Estimated%20Rs.%20${appraisalResult.toLocaleString()}).`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] font-mono font-extrabold uppercase bg-orange-500 hover:bg-orange-600 active:scale-95 duration-100 text-slate-950 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      Bargain Call
                    </a>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#121a2a]/95 hover:bg-white/[0.04] text-xs font-mono font-bold uppercase py-2 border border-white/10 rounded-xl tracking-wider cursor-pointer"
                  >
                    Run appraisal estimate
                  </button>
                )}
              </div>
            </form>
          </div>

          <a
            href="https://wa.me/923159085086?text=Hi%20Auto%20Choice%20VIP%20desk,%20I%20want%20to%20learn%20more%20about%20managed%20consignment%20bargains."
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full text-center block bg-orange-500 hover:bg-orange-600 text-slate-950 py-3.5 px-4 rounded-2xl text-[10px] font-mono font-black tracking-widest uppercase duration-150 active:scale-[0.98] transition-all"
            style={{ minHeight: '48px' }}
          >
            Route to managed dispatch A
          </a>
        </div>
      </section>

      {/* VIP DIRECT TRADE CHANNEL BANNER - MANAGED BY MUHAMMAD AMJID */}
      <section className="bg-gradient-to-r from-slate-900 via-[#0a1120] to-slate-900 border-2 border-amber-500/30 hover:border-amber-500/60 p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-4 select-none group transition-all order-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-black text-amber-500 bg-amber-500/15 px-3 py-1 rounded border border-amber-500/20 uppercase tracking-widest">
              ★ Premium VIP Managed Portal
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Direct Trade via BAZAR360 Management
            </h3>
            <p className="text-gray-300 text-xs max-w-2xl font-sans leading-relaxed">
              Bypass standard listings entirely. Connect immediately with our Executive Trade Manager <strong className="text-amber-400">Muhammad Amjid</strong> to source high-end models, custom pricing contracts, or resolve emergency liquidations via private escrow channels.
            </p>
          </div>
          <button
            onClick={() => setIsDirectTradeOpen(true)}
            className="bg-[#f97316] text-[#030712] hover:bg-orange-400 transition-colors duration-150 py-4 px-6 rounded-2xl text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap active:scale-[0.98] select-none cursor-pointer flex items-center gap-2 shadow-lg shadow-orange-500/10 shrink-0"
            style={{ minHeight: '48px' }}
          >
            <span>Launch Intake Form</span>
            <span>⭐</span>
          </button>
        </div>

        {/* Manager badge details */}
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase bg-slate-950/40 p-3 rounded-xl border border-white/5 w-fit">
          <span className="text-gray-400">Escrow Officer: <strong className="text-white">Muhammad Amjid</strong></span>
          <span className="text-white/20">|</span>
          <span className="text-gray-400">Direct Secure Hotline: <a href="tel:03149198403" className="text-orange-400 underline font-black">03149198403</a></span>
        </div>
      </section>

      {/* 3. HORIZONTAL AUTOMOTIVE SUPPORT SERVICES */}
      <section className="space-y-3.5 order-5">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Wrench size={14} className="text-[#38BDF8]" /> Horizontal Automotive Support Services
          </h3>
          <span className="text-[9px] font-mono text-gray-500 uppercase">Swipeable Tool Integrations</span>
        </div>

        {/* Touch Swipeable Horizontal List */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          
          {/* Card 1: Car Inspection Booking */}
          <button
            onClick={() => { setActiveMeshTool('inspection'); setMeshMessage(''); }}
            className={`min-w-[220px] max-w-[260px] p-4 rounded-2xl border text-left cursor-pointer duration-150 group shrink-0 ${
              activeMeshTool === 'inspection' 
                ? 'bg-[#1a293d] border-[#38BDF8]/60 shadow-xl' 
                : 'bg-[#121a2a]/90 border-white/5 hover:border-[#38BDF8]/30 hover:bg-[#121a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Wrench size={16} />
              </div>
              <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">Interactive</span>
            </div>
            <h4 className="text-xs uppercase font-black text-white group-hover:text-[#38BDF8] transition-colors">Car Inspection Booking</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-sans leading-normal">Schedule an in-house certified mechanist 180-point appraisal diagnostic at your spot.</p>
          </button>

          {/* Card 2: Insurance Calculator */}
          <button
            onClick={() => { setActiveMeshTool('insurance'); setMeshMessage(''); }}
            className={`min-w-[220px] max-w-[260px] p-4 rounded-2xl border text-left cursor-pointer duration-150 group shrink-0 ${
              activeMeshTool === 'insurance' 
                ? 'bg-[#1a293d] border-[#38BDF8]/60 shadow-xl' 
                : 'bg-[#121a2a]/90 border-white/5 hover:border-[#38BDF8]/30 hover:bg-[#121a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-[#38BDF8]">
                <Calculator size={16} />
              </div>
              <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">Calculative</span>
            </div>
            <h4 className="text-xs uppercase font-black text-white group-hover:text-[#38BDF8] transition-colors">Insurance Estimators</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-sans leading-normal">Assess custom corporate luxury comprehensive indemnity rates for your sedan/SUV instantly.</p>
          </button>

          {/* Card 3: Finance Estimator */}
          <button
            onClick={() => { setActiveMeshTool('finance'); setMeshMessage(''); }}
            className={`min-w-[220px] max-w-[260px] p-4 rounded-2xl border text-left cursor-pointer duration-150 group shrink-0 ${
              activeMeshTool === 'finance' 
                ? 'bg-[#1a293d] border-[#38BDF8]/60 shadow-xl' 
                : 'bg-[#121a2a]/90 border-white/5 hover:border-[#38BDF8]/30 hover:bg-[#121a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={16} />
              </div>
              <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">Tenure check</span>
            </div>
            <h4 className="text-xs uppercase font-black text-white group-hover:text-[#38BDF8] transition-colors">Finance Installments</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-sans leading-normal">Est. down-payment amortization splits and standard interest indexes across local bank ties.</p>
          </button>

          {/* Card 4: Title/Registration Tracker */}
          <button
            onClick={() => { setActiveMeshTool('reg'); setMeshMessage(''); }}
            className={`min-w-[220px] max-w-[260px] p-4 rounded-2xl border text-left cursor-pointer duration-150 group shrink-0 ${
              activeMeshTool === 'reg' 
                ? 'bg-[#1a293d] border-[#38BDF8]/60 shadow-xl' 
                : 'bg-[#121a2a]/90 border-white/5 hover:border-[#38BDF8]/30 hover:bg-[#121a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <FileText size={16} />
              </div>
              <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">Excise</span>
            </div>
            <h4 className="text-xs uppercase font-black text-white group-hover:text-[#38BDF8] transition-colors">Tax & Registration Tracker</h4>
            <p className="text-[10px] text-gray-400 mt-1 font-sans leading-normal">Verify KPK/Peshawar tax token statuses and registration plate legality records.</p>
          </button>

        </div>

        {/* Dynamic Tool Content Overlay Drawer */}
        {activeMeshTool && (
          <div className="bg-[#0f172a] border border-[#38BDF8]/20 p-5 rounded-2xl space-y-4 shadow-xl relative animate-scale-fade">
            
            <button 
              onClick={() => { setActiveMeshTool(null); setMeshMessage(''); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X size={14} />
            </button>

            {/* tool headers */}
            {activeMeshTool === 'inspection' && (
              <form onSubmit={(e) => handleServiceSubmit(e, 'inspection')} className="space-y-4">
                <div className="flex-col">
                  <h4 className="text-xs font-black uppercase text-[#38BDF8]">Book an Auto Choice Certified Diagnostic Visit</h4>
                  <p className="text-[10px] text-gray-400">Submit coordinates below. Mechanics inspect engine suspension landmarks at your doorstep.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={meshInputs.inspName}
                    onChange={(e) => setMeshInputs({...meshInputs, inspName: e.target.value})}
                    className="bg-[#121c32]/80 border border-white/10 text-[10px] rounded-lg p-2.5 font-mono text-white placeholder-gray-600 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Enter cell number e.g. 0315..."
                    value={meshInputs.inspPhone}
                    onChange={(e) => setMeshInputs({...meshInputs, inspPhone: e.target.value})}
                    className="bg-[#121c32]/80 border border-white/10 text-[10px] rounded-lg p-2.5 font-mono text-white placeholder-gray-600 focus:outline-none"
                  />
                  <input
                    type="date"
                    required
                    value={meshInputs.inspDate}
                    onChange={(e) => setMeshInputs({...meshInputs, inspDate: e.target.value})}
                    className="bg-[#121c32]/80 border border-white/10 text-[10px] rounded-lg p-2.5 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-[9.5px] py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Authorize Diagnostic Dispatch
                </button>
              </form>
            )}

            {activeMeshTool === 'insurance' && (
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#38BDF8]">Luxury Insurance Premium rate estimator</h4>
                  <p className="text-[10px] text-gray-400">Instant comprehensive rate assessment based on standard 1.7% auto-cleared local ledger points.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-gray-400 font-bold uppercase">Estimated Vehicle Value (PKR):</span>
                    <span className="text-orange-400 font-black">Rs. {meshInputs.insCarVal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1500000"
                    max="45000000"
                    step="500000"
                    value={meshInputs.insCarVal}
                    onChange={(e) => setMeshInputs({...meshInputs, insCarVal: parseInt(e.target.value)})}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Annual Comprehensive Premium Rate</span>
                    <span className="text-sm font-black text-emerald-400">
                      Rs. {Math.round(meshInputs.insCarVal * 0.017).toLocaleString()} / Year
                    </span>
                  </div>
                  <div className="text-right text-[8px] font-mono text-gray-400 uppercase">
                    <span>Includes tracker locks</span>
                    <span className="block mt-0.5 text-orange-400">Zero deductibles</span>
                  </div>
                </div>
              </div>
            )}

            {activeMeshTool === 'finance' && (
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#38BDF8]">Automotive Financing & Installments</h4>
                  <p className="text-[10px] text-gray-400">Calculates fixed monthly splits with a standard 12% profit index rate markup.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono text-gray-400">
                      <span>DOWN PAYMENT (PKR):</span>
                      <span className="text-white font-bold">Rs. {meshInputs.finDownPayment.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500000"
                      max="15000000"
                      step="250000"
                      value={meshInputs.finDownPayment}
                      onChange={(e) => setMeshInputs({...meshInputs, finDownPayment: parseInt(e.target.value)})}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase text-gray-400 font-mono font-bold block">Tenure Plan</label>
                    <select
                      value={meshInputs.finTenure}
                      onChange={(e) => setMeshInputs({...meshInputs, finTenure: parseInt(e.target.value)})}
                      className="w-full bg-[#121c32]/80 border border-white/10 text-white font-mono text-xs rounded-lg p-2"
                    >
                      <option value="3">3 Years (36 Months)</option>
                      <option value="5">5 Years (60 Months)</option>
                      <option value="7">7 Years (84 Months)</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Estimated Installment (Standard markup)</span>
                    <span className="text-sm font-black text-[#38BDF8]">
                      Rs. {Math.round(((12000000 - meshInputs.finDownPayment) * 1.36) / (meshInputs.finTenure * 12)).toLocaleString()} / Month
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded font-bold uppercase shrink-0">
                    Calculated on Rs. 120M SUV Index
                  </span>
                </div>
              </div>
            )}

            {activeMeshTool === 'reg' && (
              <form onSubmit={(e) => handleServiceSubmit(e, 'reg')} className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#38BDF8]">Excise Verification Desk Query</h4>
                  <p className="text-[10px] text-gray-400">Match active KP register tokens & title clearing records instantly.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter registration number sequence, e.g. Peshawar AAA-451"
                    value={meshInputs.regPlate}
                    onChange={(e) => setMeshInputs({...meshInputs, regPlate: e.target.value})}
                    className="flex-grow bg-[#121c32]/80 border border-white/10 text-xs font-mono rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-slate-950 px-5 rounded-xl font-mono text-xs font-extrabold uppercase active:scale-95 duration-150 shrink-0"
                  >
                    Run check
                  </button>
                </div>
              </form>
            )}

            {meshMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans text-xs rounded-xl flex items-center gap-1.5">
                <Check size={14} /> {meshMessage}
              </div>
            )}

          </div>
        )}
      </section>

      {/* CORE 3-COLUMN ARCHITECTURE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start order-3">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Community, Live Discovery & Clickable Dealers */}
        {/* ========================================================= */}
        <div className="lg:col-span-1 space-y-6 order-3 lg:order-1">
          
          {/* Card 1: Clickable verified dealerships (On Top) */}
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Building size={14} className="text-[#38BDF8]" /> Verified Showrooms
            </h3>

            <div className="space-y-2.5">
              {dealers.map((dl) => (
                <button
                  key={dl.id}
                  onClick={() => onSelectDealer(dl.id)}
                  className="w-full text-left bg-[#080d19] border border-white/5 hover:border-[#38BDF8]/40 hover:bg-white/[0.02] p-2.5 rounded-xl flex items-center gap-3 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                    {dl.avatarUrl ? (
                      <img
                        src={dl.avatarUrl}
                        alt={dl.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-black text-white">{dl.avatarLetter}</span>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate group-hover:text-[#38BDF8] transition-colors">
                      {dl.name}
                    </h4>
                    <span className="text-[9px] text-[#22c55e] font-mono flex items-center gap-1 mt-0.5">
                      ● Active Storefront
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-[#38BDF8] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Live Activities feed (Beneath) */}
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Activity size={14} className="text-[#38BDF8] animate-pulse" /> Live Activity Feed
            </h3>
            
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {aggregatedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[10px] text-gray-500 font-mono">No recent activity found.</p>
                </div>
              ) : (
                aggregatedActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => onSelectDealer(act.dealerId)}
                    className="w-full text-left bg-[#080d19] border border-white/5 hover:border-orange-500/30 p-2.5 rounded-xl block transition-all group duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[8px] uppercase font-bold">
                        {act.badge}
                      </span>
                      <span className="text-[8px] text-gray-500 font-mono">{act.timestamp}</span>
                    </div>

                    <h4 className="text-white font-bold text-xs truncate group-hover:text-[#38BDF8] transition-colors uppercase tracking-tight">
                      {act.title}
                    </h4>
                    <p className="text-white/60 text-[10px] line-clamp-2 mt-1 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[9px] font-mono text-[#38BDF8]">
                      <span className="text-gray-400 truncate max-w-[120px] font-sans">
                        @{act.dealerName}
                      </span>
                      <span className="font-bold underline text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[8px] uppercase">
                        View Store <ChevronRight size={10} />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Interactive Marketplace Product Feed */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          
          {/* Main category Selector slider with upcoming expandability slots */}
          <div className="bg-[#121a2a]/90 border border-[#1e293b] p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-lg">
            {['All', 'SUV', 'Sedan', 'Electric', 'Luxury'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryPress(cat)}
                className={`flex-grow px-4.5 py-3 rounded-xl text-[10px] font-mono font-extrabold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer select-none ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-900/30'
                    : 'bg-[#080d19] text-gray-400 border border-white/5 hover:border-[#38BDF8] hover:text-white'
                }`}
                style={{ minHeight: '44px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Title & Sorter Control Bar */}
          <div className="flex justify-between items-center bg-[#0a1120] border border-white/5 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[10px] font-black uppercase text-white font-mono tracking-wider">
                {sortedListings.length} products <span className="text-[#38BDF8]">offered</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Layout Switcher */}
              <div className="flex bg-bg-primary border border-border-main p-1 rounded-xl">
                <button
                  onClick={() => setCardLayout('grid')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    cardLayout === 'grid'
                      ? 'bg-accent-main text-stone-950'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                  title="Grid Layout"
                >
                  <Grid size={13} />
                </button>
                <button
                  onClick={() => setCardLayout('list')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    cardLayout === 'list'
                      ? 'bg-accent-main text-stone-950'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                  title="List Layout"
                >
                  <List size={13} />
                </button>
              </div>

              <span className="text-[9px] text-gray-500 font-mono hidden sm:inline">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-bg-secondary border border-border-main text-text-main font-mono text-[9px] uppercase font-bold py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-accent-main cursor-pointer"
              >
                <option value="Newest">🔥 Newly Uploaded</option>
                <option value="PriceLow">🪙 Price: Low to High</option>
                <option value="PriceHigh">📈 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Listings grid board */}
          {sortedListings.length === 0 ? (
            <div className="bg-[#121a2a] border border-[#1e293b] rounded-3xl p-12 text-center space-y-4">
              <SlidersHorizontal className="mx-auto text-gray-600 animate-bounce" size={32} />
              <div className="space-y-1">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">No matching inventory matches</h4>
                <p className="text-gray-500 text-[11px] max-w-sm mx-auto">Try broadening your active search parameters, resetting the price threshold slider, or changing categories.</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4.5 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-orange-600 shadow"
              >
                Refresh Filters
              </button>
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              initial="hidden"
              animate="show"
              className={cardLayout === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "flex flex-col gap-6"}
            >
              {sortedListings.map((car) => {
                const carDealer = dealers.find(d => d.id === car.dealerId);
                return (
                  <VehicleCard
                    key={car.id}
                    car={car}
                    dealer={carDealer}
                    variant={cardLayout}
                    onSelect={onSelectListing}
                    onToggleCompare={onToggleCompare}
                    isComparing={compareList.some(item => item.id === car.id)}
                  />
                );
              })}
            </motion.div>
          )}

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Deep Search & Sticky Refiner */}
        {/* ========================================================= */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 order-2 lg:order-3">
          
          <div className="bg-[#121a2a]/95 border border-[#1e293b] rounded-2xl p-4.5 space-y-5 shadow-xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#38BDF8]" /> Search & Refine
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-white transition-colors text-[9px] font-mono font-bold flex items-center gap-0.5 bg-[#080d19] px-2 py-1 rounded-lg border border-white/5 cursor-pointer"
                title="Reset active query state"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {/* COMPREHENSIVE VEHICLE DICTIONARY SELECTOR MATRIX */}
            <div className="bg-[#0c1424] border border-[#38BDF8]/30 p-3.5 rounded-xl space-y-3.5 shadow-lg shadow-sky-950/20 text-left">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[10px] uppercase font-mono font-black text-[#38BDF8] tracking-widest flex items-center gap-1">
                  <Sparkles size={11} className="text-[#38BDF8] animate-pulse" /> Vehicle Dictionary
                </span>
                <span className="text-[7px] bg-[#38BDF8]/10 text-[#38BDF8] px-1.5 py-0.5 rounded font-mono font-black uppercase">
                  Active Preset
                </span>
              </div>
              <p className="text-[9px] text-gray-400 font-sans leading-normal">
                Select a class and model to instantly synchronize filter keywords, brands, and price limits.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Dictionary Vehicle Type Dropdown */}
                <div className="space-y-1">
                  <span className="text-gray-500 font-mono text-[8px] uppercase tracking-wider block">1. Vehicle Type:</span>
                  <select
                    value={dictType}
                    onChange={(e) => {
                      const typeSelected = e.target.value;
                      setDictType(typeSelected);
                      setDictModel('All'); // reset model selection
                    }}
                    className="w-full bg-[#080d19] border border-white/5 text-white font-mono text-[10px] rounded-lg p-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="SUV">🚙 SUV</option>
                    <option value="Sedan">🚗 Sedan</option>
                    <option value="Electric">⚡ Electric</option>
                    <option value="Luxury">👑 Luxury</option>
                  </select>
                </div>

                {/* Dictionary Models Dropdown */}
                <div className="space-y-1">
                  <span className="text-gray-500 font-mono text-[8px] uppercase tracking-wider block">2. Model Dict:</span>
                  <select
                    value={dictModel}
                    onChange={(e) => {
                      const modelName = e.target.value;
                      setDictModel(modelName);
                      if (modelName !== 'All') {
                        let foundModel = null;
                        const pools = dictType === 'All' ? Object.keys(VEHICLE_DICTIONARY) : [dictType];
                        for (const pool of pools) {
                          const item = VEHICLE_DICTIONARY[pool]?.find(m => m.model === modelName);
                          if (item) {
                            foundModel = item;
                            break;
                          }
                        }

                        if (foundModel) {
                          setFilterSearch(foundModel.model);
                          setFilterMake(foundModel.make);
                          setFilterPriceRange(foundModel.price);
                          if (currencyMode === 'USD') {
                            setBudgetInputText(`${Math.round((foundModel.price / 278) / 1000)}k`);
                          } else {
                            setBudgetInputText(`${foundModel.price / 100000} Lac`);
                          }
                        }
                      }
                    }}
                    className="w-full bg-[#080d19] border border-white/5 text-white font-mono text-[10px] rounded-lg p-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                  >
                    <option value="All">Select Model...</option>
                    {dictType === 'All' ? (
                      Object.keys(VEHICLE_DICTIONARY).map((typeKey) => (
                        <optgroup key={typeKey} label={typeKey} className="bg-[#080d19] text-[#38BDF8] text-[9px] font-bold">
                          {VEHICLE_DICTIONARY[typeKey].map((m) => (
                            <option key={`${typeKey}-${m.model}`} value={m.model} className="bg-[#080d19] text-white">
                              {m.make} {m.model}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    ) : (
                      VEHICLE_DICTIONARY[dictType]?.map((m) => (
                        <option key={m.model} value={m.model} className="bg-[#080d19] text-white">
                          {m.make} {m.model}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {dictModel !== 'All' && (
                <div className="bg-[#080d19] border border-[#22c55e]/25 p-2 rounded-lg text-[9px] text-[#22c55e]/90 font-mono tracking-tight leading-relaxed animate-pulse">
                  🎯 Auto-Apply Selected: <strong className="text-white uppercase">{dictModel}</strong>.
                </div>
              )}
            </div>

            {/* Selector: Custom Text query */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Keywords Input:</label>
              <div className="bg-[#080d19] border border-[#1e293b] p-2 rounded-xl flex items-center gap-2">
                <Search size={12} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="e.g. Turbo, White, Sedan..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="bg-transparent border-none text-[11px] text-white placeholder-gray-700 w-full focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Selector: Make Select */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Manufacturer Brand:</label>
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#38BDF8] cursor-pointer block"
              >
                {uniqueMakes.map((mk) => (
                  <option key={mk} value={mk}>
                    {mk === 'All' ? 'All Brands / Makers' : mk.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector: City selector */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">City Location KPK/NWD:</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#38BDF8] cursor-pointer block"
              >
                <option value="All">🗺 Nationwide (All)</option>
                {PAKISTAN_CITIES_MATRIX.map((group) => (
                  <optgroup key={group.province} label={group.province} className="bg-[#080d19] text-[#38BDF8] font-bold">
                    {group.cities.map((ct) => (
                      <option key={ct} value={ct} className="bg-[#080d19] text-white font-sans font-normal">
                        {ct}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Selector: Live Price range slide */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-gray-400 font-bold uppercase tracking-wider">MAX BUDGET VALUE:</span>
                <span className="text-orange-400 font-extrabold uppercase">Rs. {(filterPriceRange / 100000).toLocaleString()} Lac</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={50000000}
                step={500000}
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-[#080d19] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-600">
                <span>20 Lac</span>
                <span>5 Crore PKR</span>
              </div>
            </div>

            {/* Selector: Manual Typed PKR Budget */}
            <div className="space-y-1.5 animate-fade-in text-left">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Enter Manual Budget (Lacs/Crores):</label>
              <div className="flex items-center gap-2 bg-[#080d19] border border-[#1e293b] focus-within:border-[#38BDF8]/40 px-3 py-2 rounded-xl text-left relative transition-colors h-11">
                <span className="text-[#38BDF8] font-mono text-[10px] font-black">{currencyMode === 'USD' ? 'USD $' : 'Rs. '}</span>
                <input
                  type="text"
                  value={budgetInputText}
                  placeholder={currencyMode === 'USD' ? 'e.g., 150k' : 'e.g., 350 Lac'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBudgetInputText(val);

                    // Extract numeric content
                    let parsedValue = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                    const lower = val.toLowerCase();

                    if (currencyMode === 'USD') {
                      if (lower.includes('k')) {
                        parsedValue *= 1000;
                      } else if (lower.includes('m')) {
                        parsedValue *= 1000000;
                      }
                      const pkrEquivalent = Math.round(parsedValue * 278);
                      setFilterPriceRange(pkrEquivalent);
                    } else {
                      if (lower.includes('lac') || lower.includes('lakh') || lower.includes('lacs')) {
                        parsedValue *= 100000;
                      } else if (lower.includes('crore') || lower.includes('crores')) {
                        parsedValue *= 10000000;
                      } else if (parsedValue < 1000 && parsedValue > 0) {
                        parsedValue *= 100000;
                      }
                      setFilterPriceRange(parsedValue);
                    }
                  }}
                  className="bg-transparent border-none text-[11px] font-sans font-extrabold text-[#38BDF8] focus:outline-none w-full p-0 font-mono tracking-tight"
                />
              </div>
            </div>

            {/* Selector: Transmission Switch */}
            <div className="space-y-2">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Transmission Gearbox:</label>
              <div className="grid grid-cols-3 bg-[#080d19] p-1 rounded-xl border border-[#1e293b] text-[9px] font-mono font-bold leading-normal">
                {['All', 'Automatic', 'Manual'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterTransmission(mode)}
                    className={`py-1.5 rounded-lg text-center transition-all cursor-pointer select-none ${
                      filterTransmission === mode
                        ? 'bg-[#38BDF8] text-black shadow-md'
                        : 'text-gray-500 hover:text-white'
                    }`}
                    style={{ minHeight: '32px' }}
                  >
                    {mode === 'All' ? 'ALL' : mode.substring(0, 4).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector: Manufacturing Year Range Selector */}
            <div className="space-y-1.5 animate-fade-in text-left">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Manufacturing Year Range:</label>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="space-y-1">
                  <span className="text-[7.5px] uppercase font-bold text-gray-500 block">Min Year:</span>
                  <select
                    value={filterYearMin}
                    onChange={(e) => setFilterYearMin(parseInt(e.target.value))}
                    className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono rounded-lg p-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                  >
                    {Array.from({ length: 27 }, (_, i) => 2000 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[7.5px] uppercase font-bold text-gray-500 block">Max Year:</span>
                  <select
                    value={filterYearMax}
                    onChange={(e) => setFilterYearMax(parseInt(e.target.value))}
                    className="w-full bg-[#080d19] border border-[#1e293b] text-white font-mono rounded-lg p-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                  >
                    {Array.from({ length: 27 }, (_, i) => 2000 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Visual reassurance stamp */}
            <div className="bg-[#080d19] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 select-none">
              <ShieldCheck size={14} className="text-[#38BDF8] animate-pulse" />
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/80">Real-Time Sync Ready</span>
            </div>

          </div>

        </div>

      </div>

      </>
      )}

      {/* MOBILE BOTTOM SHEET FOR GLASS PARAMETERS SELECTION */}
      {isBottomSheetOpen && activeSheetField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0f172a]/95 border-t border-white/10 rounded-t-3xl p-6 space-y-6 shadow-2xl animate-scale-fade pb-safe max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="font-mono text-[10px] font-black uppercase text-[#38BDF8] tracking-widest flex items-center gap-1.5">
                <Compass size={12} className="text-orange-500" /> Filter parameter select
              </span>
              <button 
                onClick={() => setIsBottomSheetOpen(false)}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X size={16} />
              </button>
            </div>

            {activeSheetField === 'keywords' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Match active specs from engine catalogs:</p>
                <div className="p-3 bg-[#070c12] rounded-xl border border-white/5 flex items-center gap-2">
                  <Search size={14} className="text-[#38BDF8]" />
                  <input
                    type="text"
                    placeholder="Type brand, color, engine specs..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="bg-transparent text-xs text-white border-none focus:outline-none w-full font-mono"
                    style={{ minHeight: '36px' }}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {['Toyota', 'Honda', 'Suzuki', 'BYD', 'Zeekr', 'Sedan', 'SUV', 'Electric'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => { setFilterSearch(keyword); setIsBottomSheetOpen(false); }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] border border-white/5 text-[10.5px] font-mono uppercase font-bold text-left cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      ✦ {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSheetField === 'city' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">PAKISTAN LOCALIZATION MATRIX</span>
                  <button
                    onClick={() => { setFilterCity('All'); setIsBottomSheetOpen(false); }}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase transition-all ${
                      filterCity === 'All'
                        ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Nationwide (All)
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {PAKISTAN_CITIES_MATRIX.map((group) => (
                    <div key={group.province} className="space-y-1.5 border-b border-white/5 last:border-none pb-2.5 last:pb-0">
                      <div className="text-[8px] font-mono font-black tracking-widest text-[#38BDF8] uppercase pl-1">
                        {group.province}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.cities.map((ct) => (
                          <button
                            key={ct}
                            onClick={() => { setFilterCity(ct); setIsBottomSheetOpen(false); }}
                            className={`p-2.5 rounded-xl text-left font-mono font-bold uppercase transition-all text-[9.5px] flex items-center justify-between cursor-pointer border ${
                              filterCity === ct 
                                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                                : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border-white/5 hover:border-white/10'
                            }`}
                            style={{ minHeight: '40px' }}
                          >
                            <span className="truncate">{ct}</span>
                            {filterCity === ct && <Check size={10} className="shrink-0 text-[#38BDF8] ml-1" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSheetField === 'budget' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-gray-400 uppercase font-black">MAX BUDGET VALUE:</span>
                  <span className="text-orange-400 font-extrabold uppercase">Rs. {(filterPriceRange / 100000).toLocaleString()} Lac</span>
                </div>
                <input
                  type="range"
                  min={2000000}
                  max={50000000}
                  step={500000}
                  value={filterPriceRange}
                  onChange={(e) => setFilterPriceRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-orange-500 my-4"
                />
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="w-full bg-[#38BDF8] text-black font-semibold uppercase text-xs tracking-wider py-3.5 rounded-xl block cursor-pointer transition-transform duration-100 active:scale-95"
                  style={{ minHeight: '48.5px' }}
                >
                  Save Constraints
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. BAZAR360 DIRECT VIP TRADE INTAKE DRAWER OVERLAY */}
      {isDirectTradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in relative">
          <div className="relative w-full max-w-lg bg-[#0a1120] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsDirectTradeOpen(false)}
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer select-none"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X size={16} />
            </button>

            {/* Title / Brand */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#38BDF8] font-black tracking-widest uppercase bg-[#38BDF8]/10 px-2.5 py-0.5 rounded border border-[#38BDF8]/20">
                ★ BAZAR360 Direct VIP Trade
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Requirement Intake</h3>
              <p className="text-gray-400 text-xs font-sans leading-relaxed">
                Connect immediately with Executive Trade Manager <strong className="text-white">Muhammad Amjid</strong> (Direct Secure Hotline: <a href="tel:03149198403" className="text-orange-400 hover:underline font-bold font-mono">03149198403</a>) to source custom specs or list fast.
              </p>
            </div>

            {/* Intake Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const textMessage = `--- BAZAR360 DIRECT TRADE VIP QUERY ---\n\nManager: Muhammad Amjid\nClient Requirements: ${directTradeForm.requirements || 'N/A'}\nBudget Threshold: ${directTradeForm.budget || 'N/A'}\nFast-Track Query: ${directTradeForm.query || 'N/A'}`;
              
              dbSaveLead({
                id: `lead-trade-${Date.now()}`,
                type: 'VIP Direct Trade',
                title: 'High-End VIP Sourcing Query',
                userName: currentUser?.displayName || 'Guest Prospect',
                userPhone: currentUser?.phoneNumber || 'N/A',
                userEmail: currentUser?.email || 'N/A',
                city: currentUser?.city || 'Lahore',
                details: `Requirements: ${directTradeForm.requirements || 'N/A'}\nBudget Limit: ${directTradeForm.budget || 'N/A'}\nForm Notes: ${directTradeForm.query || 'N/A'}`,
                createdAt: new Date().toISOString()
              });

              const whatsappUrl = `https://wa.me/923149198403?text=${encodeURIComponent(textMessage)}`;
              window.open(whatsappUrl, '_blank');
              setIsDirectTradeOpen(false);
            }} className="space-y-4 font-sans text-xs">
              
              <div className="space-y-1.5 text-left">
                <label className="text-white/60 font-mono font-bold uppercase tracking-wider text-[9px] block">High-End Vehicle Requirements</label>
                <textarea
                  required
                  placeholder="e.g., Toyota Land Cruiser ZX 2024, White, Karachi Registered..."
                  value={directTradeForm.requirements}
                  onChange={(e) => setDirectTradeForm({...directTradeForm, requirements: e.target.value})}
                  className="w-full bg-[#121c32] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#38BDF8]/40 h-20 resize-none font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-white/60 font-mono font-bold uppercase tracking-wider text-[9px] block">Budget Limit Threshold (PKR / Lac)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 5.5 Crore or 350 Lac"
                  value={directTradeForm.budget}
                  onChange={(e) => setDirectTradeForm({...directTradeForm, budget: e.target.value})}
                  className="w-full bg-[#121c32] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#38BDF8]/40 font-bold text-xs"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-white/60 font-mono font-bold uppercase tracking-wider text-[9px] block">Fast-Track Ad Submission Queries / Special Notes</label>
                <textarea
                  placeholder="Notes for our senior board regarding delivery schedule, trade-ins, or files..."
                  value={directTradeForm.query}
                  onChange={(e) => setDirectTradeForm({...directTradeForm, query: e.target.value})}
                  className="w-full bg-[#121c32] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#38BDF8]/40 h-16 resize-none font-bold text-xs"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-grow flex-[2] bg-[#f97316] text-[#030712] hover:bg-orange-400 py-3 px-4 rounded-xl font-mono text-[10.5px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
                  style={{ minHeight: '48px' }}
                >
                  Submit to Management (WhatsApp)
                </button>
                <a
                  href="tel:03149198403"
                  className="flex-grow flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center flex items-center justify-center font-mono text-[10.5px] font-black uppercase text-white duration-100 cursor-pointer"
                  style={{ minHeight: '48px' }}
                >
                  Cellular Call
                </a>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Custom Overlay Modal for Expansion Details */}
      {selectedFutureSector && (
        <div className="fixed inset-0 bg-[#02050e]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-[#0c1322] border border-[#38BDF8]/30 max-w-lg w-full rounded-3xl p-6.5 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setSelectedFutureSector(null)} 
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 p-2 rounded-xl transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3.5 pt-2 text-left">
              <div className="text-3xl bg-[#38BDF8]/10 p-3 rounded-2xl border border-[#38BDF8]/20">{selectedFutureSector.icon}</div>
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-tight">{selectedFutureSector.title}</h3>
                <p className="text-[#38BDF8] font-mono text-[10px] font-black uppercase tracking-widest">Active Development Channel</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-left">
              <div className="bg-[#050912] p-4 rounded-2xl border border-white/5">
                <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono block font-black mb-1">Target Mission Statement:</span>
                <p className="text-white font-sans font-bold text-xs">{selectedFutureSector.tagline}</p>
              </div>

              <div className="bg-[#050912] p-4 rounded-2xl border border-white/5">
                <span className="text-[8px] uppercase tracking-wider text-[#38BDF8] font-mono block font-black mb-1">Functional Outline:</span>
                <p className="text-gray-300 text-xs font-sans leading-relaxed">{selectedFutureSector.desc}</p>
              </div>

              <div className="bg-[#12221b]/40 border border-[#22c55e]/20 p-3 rounded-xl text-[10px] text-green-400 font-mono">
                🚀 {selectedFutureSector.spec}
              </div>
            </div>

            <div className="pt-2 text-center">
              <button 
                onClick={() => setSelectedFutureSector(null)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 font-mono font-black py-3 px-6 rounded-xl w-full text-xs uppercase hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] duration-100 cursor-pointer shadow-lg"
              >
                Confirm Understanding & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
