import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Check, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Coins, 
  TrendingUp, 
  Activity, 
  Shuffle,
  ShieldAlert,
  ArrowDownCircle,
  Eye,
  Plus
} from 'lucide-react';
import { VehicleListing } from './luxuryTypes';

interface AdminDashboardProps {
  listings: VehicleListing[];
  onToggleReserved: (id: string) => void;
  onToggleSold: (id: string) => void;
  onTogglePremium: (id: string) => void;
  onResetSeedData: () => void;
  onAddCustomListing: (listing: VehicleListing) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  listings,
  onToggleReserved,
  onToggleSold,
  onTogglePremium,
  onResetSeedData,
  onAddCustomListing,
}) => {
  // Compute analytics metrics dynamically in-memory
  const metricsSnapshot = useMemo(() => {
    const totalInventory = listings.length;
    const soldCount = listings.filter((l) => l.isSold).length;
    const reservedCount = listings.filter((l) => l.isReserved && !l.isSold).length;
    const availableLive = totalInventory - soldCount - listings.filter((l) => l.isReserved).length;
    
    // Sum premium capital evaluations
    const totalValuePKR = listings.reduce((sum, car) => sum + car.priceRaw, 0);

    return { totalInventory, availableLive, reservedCount, soldCount, totalValuePKR };
  }, [listings]);

  // Form submit state for quick custom mockup release asset
  const handleCreateMockListing = () => {
    const randomBrands = ['Bugatti', 'Ferrari', 'Aston Martin', 'Mclaren', 'Lamborghini', 'Mercedes-Benz'];
    const chosenBrand = randomBrands[Math.floor(Math.random() * randomBrands.length)];
    const randomId = `luxe-custom-${Date.now()}`;
    const randomNames = ['Revuelto V12 Hybrid', '750S Spider Twin Turbo', 'Valhalla Hyper-GT', 'GT Black Series'];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const pkrPrices = [98000000, 185000000, 240000000, 72000000];
    const pricesFm = ['PKR 9.8 Crore', 'PKR 18.5 Crore', 'PKR 24.0 Crore', 'PKR 7.2 Crore'];
    const randInd = Math.floor(Math.random() * pkrPrices.length);

    const newCar: VehicleListing = {
      id: randomId,
      title: `${chosenBrand} ${chosenName} flagship allocation`,
      brand: chosenBrand,
      modelYear: '2025',
      priceFormatted: pricesFm[randInd],
      priceRaw: pkrPrices[randInd],
      mileage: '0 KM',
      mileageRaw: 0,
      fuelType: 'Hybrid',
      images: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600'],
      isPremium: true,
      category: 'Hypercar',
      engineCC: 3998,
      horsepower: 820,
      exteriorColor: 'Liquid Chrome Satin Black',
      conditionScore: 10.0,
      transmission: 'Automatic',
      description: 'Quick custom administrative allocation release. Built to client bespoke specifications, high performance aerodynamic composite matrices.',
      isSold: false,
      isReserved: false
    };

    onAddCustomListing(newCar);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Dynamic Summary Metric Tallyboards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric Card 1 */}
        <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
            <span>Total Catalog Volume</span>
            <BarChart3 className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono">{metricsSnapshot.totalInventory}</p>
            <span className="text-[9px] text-zinc-500 font-mono uppercase">Combined physical allocations</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
            <span>Available Live</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono">{metricsSnapshot.availableLive}</p>
            <span className="text-[9px] text-emerald-500 font-mono uppercase">Ready for checkout & escort</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
            <span>Escrow & Reserved</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono">{metricsSnapshot.reservedCount}</p>
            <span className="text-[9px] text-[#c5a880] font-mono uppercase">Deposits processed active</span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
            <span>SoldCount</span>
            <Coins className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono">{metricsSnapshot.soldCount}</p>
            <span className="text-[9px] text-red-400 font-mono uppercase">Completed capital dispatches</span>
          </div>
        </div>
      </div>

      {/* Advanced Quick Action Controls Strip */}
      <div className="bg-[#121214]/40 border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-left space-y-1">
          <h4 className="text-white text-xs font-bold uppercase tracking-tight">Auto Choice Showroom Command</h4>
          <p className="text-[10px] text-zinc-400 font-mono uppercase">
            Bespoke sandbox deployment • Total Value: PKR {(metricsSnapshot.totalValuePKR / 10000000).toFixed(2)} Crore
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateMockListing}
            className="bg-[#c5a880] hover:bg-[#b4966e] text-black font-sans font-bold text-[10.5px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 select-none active:scale-[0.98]"
            title="Adds an on-the-fly random high-end allocation"
          >
            <Plus size={13} strokeWidth={3} /> Add Allocations
          </button>
          
          <button
            onClick={onResetSeedData}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 font-mono text-[9.5px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5"
          >
            <Shuffle size={12} /> Reset Database
          </button>
        </div>
      </div>

      {/* Real-time Inventory Status Data Table */}
      <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 bg-black/15 flex justify-between items-center">
          <span className="text-[10px] text-zinc-400 font-mono uppercase font-black">Live Stock Ledger</span>
          <span className="text-[8px] text-zinc-500 font-mono uppercase">Authorized staff clearance mode</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-black/5 text-[9px] font-mono uppercase text-zinc-500 tracking-wider">
                <th className="p-4">Allocation Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Valuation demand</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Ledger actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {listings.map((car) => (
                <tr key={car.id} className="hover:bg-white/[0.02] transition-colors duration-200">
                  
                  {/* Title Area */}
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-200 text-xs truncate max-w-[280px]">
                        {car.brand} • {car.title.replace(`${car.brand} `, '')}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                        ID: {car.id} • {car.modelYear} • {car.horsepower} HP
                      </span>
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="p-4 font-mono text-[10px] text-zinc-400 uppercase">
                    {car.category}
                  </td>
                  
                  {/* Price */}
                  <td className="p-4 font-mono font-bold text-gray-200">
                    {car.priceFormatted}
                  </td>
                  
                  {/* Score */}
                  <td className="p-4 font-mono text-[10px]/none text-[#c5a880]">
                    {car.conditionScore.toFixed(1)} / 10.0
                  </td>
                  
                  {/* Flags badge indicators */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {car.isSold ? (
                        <span className="bg-red-950/40 text-red-400 border border-red-500/10 text-[8px] font-mono uppercase px-2 py-0.5 rounded">
                          SOLD
                        </span>
                      ) : car.isReserved ? (
                        <span className="bg-amber-950/40 text-amber-400 border border-amber-500/10 text-[8px] font-mono uppercase px-2 py-0.5 rounded">
                          RESERVED
                        </span>
                      ) : (
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 text-[8px] font-mono uppercase px-2 py-0.5 rounded animate-pulse">
                          LIVE
                        </span>
                      )}
                      
                      {car.isPremium && (
                        <span className="bg-amber-500/15 text-[#c5a880] border border-[#c5a880]/15 text-[8.5px] font-mono uppercase px-2 py-0.5 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Interactive Table Action Toggles */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      
                      {/* Toggle Premium Highlight status */}
                      <button
                        onClick={() => onTogglePremium(car.id)}
                        className="text-gray-400 hover:text-[#c5a880] p-1.5 rounded bg-white/5 border border-white/5 flex items-center justify-center transition-colors"
                        title="Toggle Flagship Premium Verified allocation status"
                      >
                        {car.isPremium ? (
                          <ToggleRight size={15} className="text-[#c5a880]" />
                        ) : (
                          <ToggleLeft size={15} />
                        )}
                      </button>

                      {/* Toggle Reserved */}
                      <button
                        onClick={() => onToggleReserved(car.id)}
                        className={`text-[9.5px] font-mono uppercase px-2.5 py-1 rounded transition-all tracking-wider ${
                          car.isReserved 
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:text-[#c5a880]'
                        }`}
                        title="Toggle reservation escrow hold"
                      >
                        {car.isReserved ? 'Unreserve' : 'Reserve'}
                      </button>

                      {/* Toggle Sold */}
                      <button
                        onClick={() => onToggleSold(car.id)}
                        className={`text-[9.5px] font-mono uppercase px-2.5 py-1 rounded transition-all tracking-wider ${
                          car.isSold 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Dispatch complete transaction"
                      >
                        {car.isSold ? 'Restock' : 'Sell Out'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
