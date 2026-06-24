import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowLeft, 
  Gauge, 
  Sparkles, 
  Compass, 
  Award, 
  SlidersHorizontal,
  ChevronRight,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { VehicleListing } from './luxuryTypes';
import { CinematicVehicleCard } from './CinematicVehicleCard';

interface CatalogContainerProps {
  listings: VehicleListing[];
  onOpenInquiryModal?: (vehicle: VehicleListing) => void;
}

export const CatalogContainer: React.FC<CatalogContainerProps> = ({ listings }) => {
  // Client state hooks
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('premium-first'); // 'price-asc', 'price-desc', 'year-desc', 'premium-first'
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleListing | null>(null);
  const [inquiryName, setInquiryName] = useState<string>('');
  const [inquiryPhone, setInquiryPhone] = useState<string>('');
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false);

  // Available unique categories
  const categoriesList = ['All', 'Supercar', 'Hypercar', 'Luxury SUV', 'Classic'];

  // Filtering + Sorting memoization
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Filter by text search
    if (searchQuery.trim() !== '') {
      const sq = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(sq) ||
          v.brand.toLowerCase().includes(sq) ||
          v.category.toLowerCase().includes(sq) ||
          v.exteriorColor.toLowerCase().includes(sq)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((v) => v.category === selectedCategory);
    }

    // Apply sorting array algorithm
    result.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.priceRaw - b.priceRaw;
      }
      if (sortBy === 'price-desc') {
        return b.priceRaw - a.priceRaw;
      }
      if (sortBy === 'year-desc') {
        return parseInt(b.modelYear) - parseInt(a.modelYear);
      }
      // Default: show premium and available live on top
      if (a.isPremium !== b.isPremium) {
        return a.isPremium ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [listings, searchQuery, selectedCategory, sortBy]);

  // WhatsApp routing helper
  const handleContactWhatsApp = (car: VehicleListing) => {
    const textStr = encodeURIComponent(
      `Hello Auto Choice Peshawar showroom, I am interested in exploring specifications on the verified ${car.brand} ${car.title} listed at ${car.priceFormatted}. Please share the certified appraisal reports.`
    );
    window.open(`https://wa.me/923159085086?text=${textStr}`, '_blank');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setInquiryName('');
      setInquiryPhone('');
    }, 3000);
  };

  return (
    <div className="space-y-8 text-left">
      <AnimatePresence mode="wait">
        {!selectedVehicle ? (
          
          /* =========================================================================
              SHOWROOM PUBLIC CATALOG VIEW
              ========================================================================= */
          <motion.div
            key="catalog-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Dynamic Controls Grid Strip */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#121214] border border-white/5 p-4.5 rounded-2xl">
              
              {/* Left Column: search */}
              <div className="relative md:col-span-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="SEARCH BRAND, MODEL, SPECIFICATION..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-white/5 focus:border-[#c5a880]/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono uppercase tracking-wider text-white placeholder-zinc-600 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Middle Column: Sorting selection */}
              <div className="relative md:col-span-3 flex items-center gap-2">
                <ArrowUpDown size={14} className="text-zinc-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-white/5 focus:border-[#c5a880]/50 rounded-xl p-2.5 text-[10px] font-mono uppercase tracking-wider text-white focus:outline-none cursor-pointer"
                >
                  <option value="premium-first">Flagship Allocations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="year-desc">Newest Year</option>
                </select>
              </div>

              {/* Right Column: Category matrix strip */}
              <div className="md:col-span-4 flex flex-wrap gap-1.5 justify-end">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#c5a880] text-black border-[#c5a880] shadow-[0_0_15px_rgba(197,168,128,0.2)]'
                        : 'bg-[#0a0a0b] text-zinc-500 border-white/5 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Cinematic Stagger Grid */}
            {filteredListings.length === 0 ? (
              <div className="p-16 border border-white/5 rounded-3xl bg-[#121214] text-center space-y-3">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Zero Allocations Found</p>
                <p className="text-[10px] text-zinc-600 max-w-sm mx-auto">
                  Adjust your search parameters. No luxury active listings match "{searchQuery}" under "{selectedCategory}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase px-4 py-2 border border-white/10 rounded-xl"
                >
                  Reset Filtering Parameters
                </button>
              </div>
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredListings.map((car) => (
                  <CinematicVehicleCard
                    key={car.id}
                    vehicle={car}
                    onSelect={setSelectedVehicle}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          
          /* =========================================================================
              IMMERSIVE CAR DETAIL DRILLDOWN STAGE
              ========================================================================= */
          <motion.div
            key="catalog-drilldown"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="space-y-8"
          >
            {/* Header / Escape Row */}
            <div className="flex justify-between items-center bg-[#121214] border border-white/5 p-4 rounded-xl">
              <button
                onClick={() => {
                  setSelectedVehicle(null);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft size={14} className="text-[#c5a880]" />
                Return to Showroom Floor
              </button>
              
              <span className="text-[9px] font-mono uppercase text-[#c5a880] font-black tracking-widest bg-black/40 px-3 py-1 rounded border border-white/5">
                Auto Choice Verified Portfolio
              </span>
            </div>

            {/* Immersive layout layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Visual Carousel & Specs Panel */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Showcase Container */}
                <div className="relative aspect-[16/10] bg-black border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-4">
                  {/* Absolute shadow mask vignettes */}
                  <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
                  <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

                  {/* Watermark brand layer */}
                  <div className="absolute inset-0 flex items-center justify-center select-none opacity-[0.02] pointer-events-none">
                    <p className="text-[120px] font-black tracking-tighter text-white uppercase italic">
                      AUTO CHOICE
                    </p>
                  </div>

                  <img
                    src={selectedVehicle.images[0]}
                    alt={selectedVehicle.title}
                    className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] z-10"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-sm border border-white/5 px-3 py-1 rounded-lg text-zinc-500 font-mono text-[9px] tracking-widest uppercase">
                    Model Year: {selectedVehicle.modelYear}
                  </div>
                </div>

                {/* Sub images layout / spec cards strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#121214] border border-white/5 p-4 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Peak scale power</span>
                    <p className="text-white text-sm font-mono font-bold uppercase">{selectedVehicle.horsepower} HP</p>
                  </div>
                  <div className="bg-[#121214] border border-white/5 p-4 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Displacement CC</span>
                    <p className="text-white text-sm font-mono font-bold uppercase">{selectedVehicle.engineCC || 'Electric'} CC</p>
                  </div>
                  <div className="bg-[#121214] border border-white/5 p-4 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Body Color</span>
                    <p className="text-white text-xs font-bold uppercase truncate">{selectedVehicle.exteriorColor}</p>
                  </div>
                  <div className="bg-[#121214] border border-white/5 p-4 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Odometer log</span>
                    <p className="text-white text-xs font-mono font-bold uppercase">{selectedVehicle.mileage}</p>
                  </div>
                </div>

              </div>

              {/* Right Column: Transaction & Inquiry Deck */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Brand & valuation title card */}
                <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl space-y-3.5">
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-[#c5a880] font-black">{selectedVehicle.brand}</span>
                    <span className="text-zinc-500">{selectedVehicle.category}</span>
                  </div>

                  <h1 className="text-white text-xl font-bold uppercase tracking-tight leading-snug">
                    {selectedVehicle.title}
                  </h1>

                  <div className="pt-3 border-t border-white/5 flex items-end justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Flagship retail quota</span>
                      <p className="text-2xl font-mono font-black text-[#c5a880] tracking-wide">
                        {selectedVehicle.priceFormatted}
                      </p>
                    </div>

                    <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-right font-mono text-[9px] uppercase text-zinc-400">
                      Condition • {selectedVehicle.conditionScore.toFixed(1)}/10.0
                    </div>
                  </div>
                </div>

                {/* Logistics Profile specifications */}
                <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest text-[#c5a880]">Insured Escrow Logistics</h4>
                  
                  <div className="space-y-3 text-[11px] text-zinc-300">
                    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                      <span className="text-zinc-500 font-mono text-[9.5px] uppercase">Registry paperwork</span>
                      <span className="font-bold text-white uppercase">Duplication Free • Verified Smart Card</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                      <span className="text-zinc-500 font-mono text-[9.5px] uppercase">Biometric security</span>
                      <span className="font-bold text-emerald-400">NADRA Instant Biometric Ready</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                      <span className="text-zinc-500 font-mono text-[9.5px] uppercase">Taxes & Token Duties</span>
                      <span className="font-bold text-white">100% Tax Clearance Paid to 2026</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-zinc-500 font-mono text-[9.5px] uppercase">Showroom Physical Address</span>
                      <span className="font-bold text-white text-right max-w-[180px] truncate">Auto Choice Peshawar HQ</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed pt-2 border-t border-white/5">
                    {selectedVehicle.description}
                  </p>
                </div>

                {/* High Intent Call to Actions Section */}
                <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest text-[#c5a880]">Acquisition & Booking portal</h4>

                  {/* WhatsApp contact router button */}
                  <button
                    onClick={() => handleContactWhatsApp(selectedVehicle)}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] duration-200"
                  >
                    <MessageSquare size={15} /> Contact WhatsApp Agent
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-3 text-[8.5px] font-mono uppercase text-zinc-600">OR REQUEST ESCORT</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  {/* Submission form */}
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="YOUR REGISTERED NAME..."
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-[#0a0a0b] border border-white/5 focus:border-[#c5a880]/50 rounded-lg py-2 pl-3 text-xs uppercase font-mono tracking-wider text-white focus:outline-none placeholder-zinc-700"
                    />
                    <input
                      type="tel"
                      placeholder="CONTACT TELEPHONE..."
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full bg-[#0a0a0b] border border-white/5 focus:border-[#c5a880]/50 rounded-lg py-2 pl-3 text-xs uppercase font-mono tracking-wider text-white focus:outline-none placeholder-zinc-700"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#c5a880] hover:bg-[#b4966e] text-black font-sans font-bold text-[10.5px] uppercase tracking-widest py-2.5 rounded-xl transition-all"
                    >
                      REQUEST CALL APPOINTMENT
                    </button>
                  </form>

                  <AnimatePresence>
                    {inquirySuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase p-3 rounded-xl text-center"
                      >
                        ✓ Request Captured. Representative out of Auto Choice Peshawar HQ will call you back within 15 mins.
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
