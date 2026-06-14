import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, Milestone, Sparkles, AlertCircle, Eye } from 'lucide-react';
import { Dealer, CarListing } from '../types';

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (listing: CarListing) => void;
}

export default function HomeView({
  dealers,
  listings,
  setTab,
  setSelectedCategory,
  setSearchQuery,
  onSelectDealer,
  onSelectListing,
}: HomeViewProps) {
  const [localSearch, setLocalSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setTab('search');
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    setTab('search');
  };


  return (
    <div className="space-y-12 pb-16">
      {/* Hero Search Section - Bento Style Showcase Card */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] min-h-[380px] flex flex-col items-center justify-center p-6 md:p-12 border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#0B1121]/80 opacity-90 z-0"></div>
        
        {/* Absolute ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#38BDF8] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-3xl text-center space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#38BDF8] uppercase bg-[#0F172A] px-3.5 py-1.5 rounded-full border border-white/10 shadow">
              <Sparkles size={11} className="text-[#F97316] animate-pulse" /> NEXT-GEN DEALER SYSTEM ACTIVE
            </span>
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-none uppercase">
              FIND YOUR NEXT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-white to-[#F97316]">ELITE VEHICLE</span>
            </h1>
            <p className="text-white/60 text-xs md:text-sm max-w-lg mx-auto font-sans leading-relaxed">
              Connect directly with verified premium showrooms and private collectors under one digital bento-engineered pipeline.
            </p>
          </div>

          <form onSubmit={handleHeroSearchSubmit} className="bg-[#0F172A] border border-white/5 rounded-2xl p-2 flex flex-col md:flex-row gap-2 w-full shadow-2xl focus-within:border-[#38BDF8] transition-all duration-200">
            <div className="flex-1 flex items-center px-4 py-3 md:py-0 bg-[#0F172A] rounded-xl">
              <Search className="text-gray-400 mr-3" size={18} />
              <input
                className="w-full bg-transparent border-none text-white focus:outline-none placeholder-gray-500 text-xs font-mono"
                placeholder="Make, Model, or Keyword (e.g. Porsche, AMG, electric)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                type="text"
              />
            </div>
            <button
              type="submit"
              className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20 active:scale-95 duration-100 flex items-center justify-center gap-2 tracking-wider uppercase"
            >
              Search Index
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2.5">
            {['SUV', 'Sedan', 'Electric', 'Luxury'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryPress(cat)}
                className="px-4.5 py-1.5 rounded-full bg-[#1E293B] border border-white/10 text-gray-300 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer hover:border-[#38BDF8] hover:text-white transition-all duration-150 shadow"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Showrooms - Bento Style Cards */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-2">
          <div>
            <span className="text-[10px] font-mono text-[#38BDF8] font-bold tracking-widest uppercase block">Certified Showrooms</span>
            <h2 className="font-sans font-extrabold text-xl md:text-2xl text-white uppercase tracking-tight">FEATURED SHOWROOMS</h2>
          </div>
          <button
            onClick={() => setTab('dealers')}
            className="text-[#38BDF8] text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0F172A] px-3.5 py-1.5 rounded-full border border-white/10 hover:border-[#38BDF8] transition-all"
          >
            VIEW ALL
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dealers.map((dealer) => (
            <div
              key={dealer.id}
              onClick={() => onSelectDealer(dealer.id)}
              className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden group cursor-pointer relative border-t-2 border-t-[#F97316] transition-all duration-200 hover:shadow-2xl hover:border-r hover:border-l hover:border-white/10"
            >
              <div className="h-32 bg-[#0F172A] relative flex items-center justify-center overflow-hidden">
                <img
                  alt={dealer.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-45 transition-opacity duration-500"
                  src={dealer.coverImage}
                  referrerPolicy="no-referrer"
                />
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center z-10 shadow-lg border-2 border-[#1E293B]">
                  {dealer.avatarUrl ? (
                    <img
                      src={dealer.avatarUrl}
                      alt={dealer.name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-sans font-bold text-xl text-black">
                      {dealer.avatarLetter}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white truncate group-hover:text-[#38BDF8] transition-colors uppercase tracking-tight">{dealer.name}</h3>
                  <p className="text-white/50 text-xs mt-1 flex items-center gap-1 font-sans">
                    <MapPin size={11} className="text-[#38BDF8]" /> {dealer.location}
                  </p>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3.5 text-xs">
                  <span className="text-white/40 font-mono text-[10px] tracking-widest uppercase">{dealer.vehiclesCount} Listings</span>
                  <span className="text-[#38BDF8] font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Storefront →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Ads - Bento Style Product Cards */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-2">
          <div>
            <span className="text-[10px] font-mono text-[#38BDF8] font-bold tracking-widest uppercase block">Curated Listings</span>
            <h2 className="font-sans font-extrabold text-xl md:text-2xl text-white uppercase tracking-tight">FEATURED ADS</h2>
          </div>
          <button
            onClick={() => setTab('search')}
            className="text-[#38BDF8] text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0F172A] px-3.5 py-1.5 rounded-full border border-white/10 hover:border-[#38BDF8] transition-all"
          >
            EXPLORE MARKET
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.filter((l) => l.featured).map((car) => (
            <div
              key={car.id}
              onClick={() => onSelectListing(car)}
              className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 shadow-xl cursor-pointer hover:border-[#38BDF8]"
            >
              <div className="relative h-48 bg-[#0F172A] overflow-hidden">
                <img
                  alt={car.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={car.imageUrl}
                  referrerPolicy="no-referrer"
                />
                
                {car.verified && (
                  <div className="absolute top-3 left-3 bg-[#0F172A]/95 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-xl text-white text-[9px] font-mono font-bold uppercase flex items-center gap-1 shadow-lg">
                    <ShieldCheck size={11} className="text-[#38BDF8]" /> Verified
                  </div>
                )}
                
                <div className="absolute bottom-3 right-3 bg-[#0B1121]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-mono text-[#38BDF8] font-semibold border border-white/10">
                  {car.year} MODEL
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white truncate pr-2 group-hover:text-[#38BDF8] transition-colors uppercase tracking-tight">
                    {car.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-white/50 text-[10px] font-mono mt-2 uppercase">
                    <span className="bg-[#0F172A] px-2 py-0.5 rounded">{(car.mileage).toLocaleString()} KM</span>
                    <span className="bg-[#0F172A] px-2 py-0.5 rounded">{car.fuelType}</span>
                    <span className="bg-[#0F172A] px-2 py-0.5 rounded">{car.transmission}</span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">Starting Price</span>
                    <span className="text-lg font-black text-[#F97316]">
                      Rs. {car.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#0F172A] border border-white/10 text-[#38BDF8] p-2.5 rounded-xl group-hover:bg-[#38BDF8] group-hover:text-white hover:border-transparent transition-all duration-200">
                    <Eye size={15} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
