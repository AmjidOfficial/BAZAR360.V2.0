import { useState, useMemo } from 'react';
import { Search, MapPin, ShieldCheck, Sliders, X, Sparkles, Check, Phone, MessageSquare } from 'lucide-react';
import { CarListing, Dealer } from '../types';

interface SearchExplorerViewProps {
  listings: CarListing[];
  dealers: Dealer[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectListing: (listing: CarListing) => void;
}

export default function SearchExplorerView({
  listings,
  dealers,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectListing,
}: SearchExplorerViewProps) {
  const [maxPrice, setMaxPrice] = useState<number>(1200000);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  const filteredListings = useMemo(() => {
    return listings.filter((car) => {
      // 1. Keyword query match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const mainMatch = car.title.toLowerCase().includes(query) ||
                          car.make.toLowerCase().includes(query) ||
                          car.model.toLowerCase().includes(query) ||
                          car.description.toLowerCase().includes(query);
        if (!mainMatch) return false;
      }

      // 2. Category match
      if (selectedCategory && selectedCategory !== 'All') {
        const hasTag = car.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase());
        const hasFuel = car.fuelType.toLowerCase() === selectedCategory.toLowerCase();
        if (!hasTag && !hasFuel) return false;
      }

      // 3. Price limit
      if (car.price > maxPrice) return false;

      // 4. Verification Check
      if (onlyVerified && !car.verified) return false;

      return true;
    });
  }, [listings, searchQuery, selectedCategory, maxPrice, onlyVerified]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(1200000);
    setOnlyVerified(false);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Search Header and Filters bar - Bento Styled Container */}
      <section className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl shadow-xl space-y-5">
        <span className="text-[10px] font-mono text-[#38BDF8] font-bold tracking-widest uppercase block mb-1">Filter Inventory</span>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow flex items-center bg-[#0F172A] border border-white/5 px-4 py-3 rounded-xl focus-within:border-[#38BDF8] transition-all">
            <Search className="text-gray-400 mr-2 shrink-0" size={16} />
            <input
              className="w-full bg-transparent border-none text-white focus:outline-none text-xs font-mono"
              placeholder="Search make, model derivatives, description..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              className="bg-[#0F172A] border border-white/5 text-xs font-mono text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#38BDF8]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Body Types</option>
              <option value="SUV">SUVs</option>
              <option value="Sedan">Sedans</option>
              <option value="Electric">Electric Vehicles</option>
              <option value="Luxury">Luxury Grade</option>
              <option value="Classic">Classics</option>
              <option value="Sport">Sport Series</option>
            </select>

            {(searchQuery || selectedCategory !== 'All' || onlyVerified || maxPrice < 1200000) && (
              <button
                onClick={clearFilters}
                className="bg-[#0F172A] border border-white/10 text-[#38BDF8] px-4 py-3 rounded-xl text-xs font-mono font-bold hover:border-[#38BDF8] transition-colors"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Sliders/Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5 text-xs font-sans">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-400 font-mono">
              <span className="font-bold uppercase tracking-wider text-[10px]">Maximum Price threshold:</span>
              <span className="font-mono text-[#F97316] font-bold text-sm">AED {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="1200000"
              step="25000"
              className="w-full accent-[#F97316] h-1.5 bg-[#0F172A] rounded-lg cursor-pointer"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-3 bg-[#0F172A] p-3 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className="focus:outline-none shrink-0"
            >
              <div
                className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 ${
                  onlyVerified ? 'bg-[#38BDF8]' : 'bg-[#1E293B] border border-white/10'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-200 ${
                    onlyVerified ? 'translate-x-4' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </button>
            <div>
              <span className="text-white font-bold block text-xs">Only Verified Listings</span>
              <span className="text-[10px] text-white/50 font-sans mt-0.5 block">Show vehicles pre-audited with 111-point inspections.</span>
            </div>
          </div>

        </div>
      </section>

      {/* Grid of Results */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1 font-mono">
          <p className="text-white/50 text-[10px] uppercase tracking-wider">
            Showing <span className="text-white font-bold">{filteredListings.length}</span> luxury units indexed
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 shadow-2xl text-xs font-sans">
            <div className="w-12 h-12 bg-[#F97316]/10 text-[#F97316] rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white/5">
              <Sliders size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold uppercase tracking-tight text-sm">No Matching Listings Found</h4>
              <p className="text-white/50 max-w-xs mx-auto">
                No luxury cars fit your preset specs. Try widening your price bar or resetting custom queries.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="bg-[#F97316] text-white font-bold font-mono text-xs py-2.5 px-6 rounded-xl shadow-lg shadow-orange-950/20 uppercase tracking-wider hover:bg-orange-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((car) => {
              const dealerObj = dealers.find((d) => d.id === car.dealerId);
              return (
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
                      {car.year} Model
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white truncate pr-2 group-hover:text-[#38BDF8] transition-colors uppercase tracking-tight">
                        {car.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-white/50 text-[10px] font-mono mt-2 uppercase">
                        <span className="bg-[#0F172A] px-2 py-0.5 rounded">{(car.mileage).toLocaleString()} km</span>
                        <span className="bg-[#0F172A] px-2 py-0.5 rounded">{car.fuelType}</span>
                        <span className="bg-[#0F172A] px-2 py-0.5 rounded">{car.transmission}</span>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-white/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">Starting Price</span>
                        <span className="text-lg font-black text-[#F97316]">
                          AED {car.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-right font-mono">
                        <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-0.5">Dealer</span>
                        <span className="text-xs font-bold text-[#38BDF8] truncate max-w-[100px] block">
                          {dealerObj?.name ? dealerObj.name.split(' ')[0] : 'Private Seller'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
