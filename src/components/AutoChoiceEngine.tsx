import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Settings, 
  Eye, 
  Lock, 
  Award, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { VehicleListing } from './luxury/luxuryTypes';
import { PREMIUM_SEED_VEHICLES } from './luxury/seedData';
import { CatalogContainer } from './luxury/CatalogContainer';
import { AdminDashboard } from './luxury/AdminDashboard';

export default function AutoChoiceEngine({
  allListings = [],
  onSelectExternalListing,
  onViewChange
}: {
  allListings?: any[];
  onSelectExternalListing?: (listingId: string) => void;
  onViewChange?: (view: 'dashboard' | 'drilldown') => void;
}) {
  // Central dynamic state manager populated on mount with luxury seed logs
  const [vehicles, setVehicles] = useState<VehicleListing[]>(PREMIUM_SEED_VEHICLES);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Administrative Interactive State Toggles
  const handleToggleReserved = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isReserved: !v.isReserved } : v))
    );
  };

  const handleToggleSold = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isSold: !v.isSold } : v))
    );
  };

  const handleTogglePremium = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isPremium: !v.isPremium } : v))
    );
  };

  const handleResetData = () => {
    setVehicles(PREMIUM_SEED_VEHICLES);
  };

  const handleAddCustomListing = (newListing: VehicleListing) => {
    setVehicles((prev) => [newListing, ...prev]);
  };

  return (
    <div 
      id="auto-choice-premium-engine-viewport" 
      className="w-full text-white font-sans bg-[#0a0a0b] border border-white/5 rounded-3xl p-6 md:p-10 space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
    >
      {/* Dynamic ambient golden light aura behind header */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[150px] bg-[#c5a880]/5 rounded-full blur-[100px] pointer-events-none select-none"></div>

      {/* =========================================================================
          1. SPECTACULAR HEAD-HEADER & BRANDING AREA
          ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8 relative z-10 text-left">
        <div className="space-y-2">
          
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] font-mono text-[9px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Auto Choice Prestige Division
            </span>
            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded-full">
              Bazar360 Signature Storefront
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white uppercase italic">
            AUTO CHOICE <span className="text-[#c5a880] not-italic font-black">PREMIUM</span>
          </h1>
          
          <p className="text-zinc-400 text-xs md:text-[13px] leading-relaxed max-w-2xl font-sans font-medium">
            Discover precision-engineered supercars, elite sports divisions, and luxury SUVs vetted by Auto Choice certification specialists. Fully digitized escrow logging and nadra biometric verification clearance models.
          </p>
        </div>

        {/* Cohesive Segmented Navigation Swapper Controls */}
        <div className="flex bg-[#121214] border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setIsAdminView(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer ${
              !isAdminView
                ? 'bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/20'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Eye size={13} />
            Showroom Floor
          </button>
          
          <button
            onClick={() => setIsAdminView(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer ${
              isAdminView
                ? 'bg-zinc-800 text-white border border-white/5'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Lock size={13} className={isAdminView ? 'text-[#c5a880]' : ''} />
            Staff Ledger
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. DYNAMIC LAYERS RENDERING CONTAINER
          ========================================================================= */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!isAdminView ? (
            <motion.div
              key="cust-showroom-floor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <CatalogContainer listings={vehicles} />
            </motion.div>
          ) : (
            <motion.div
              key="admin-ledger"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <AdminDashboard
                listings={vehicles}
                onToggleReserved={handleToggleReserved}
                onToggleSold={handleToggleSold}
                onTogglePremium={handleTogglePremium}
                onResetSeedData={handleResetData}
                onAddCustomListing={handleAddCustomListing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          3. PREMIUM FOOTER ACCENT BAR DETAIL
          ========================================================================= */}
      <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest text-left">
        <div className="flex items-center gap-2">
          <Award className="text-[#c5a880] w-3.5 h-3.5" />
          <span>100% Collector Asset Integrity Guarantee</span>
        </div>
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Showroom Telemetry Sync: Live Connected</span>
        </div>
      </div>

    </div>
  );
}
