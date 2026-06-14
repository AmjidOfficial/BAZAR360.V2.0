import React from 'react';
import { Check, X, ShieldAlert, Sparkles, Clock, Car, ExternalLink } from 'lucide-react';
import { CarListing, Dealer } from '../types';

interface AdminModerationDeckProps {
  listings: CarListing[];
  dealers: Dealer[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void; // local state delete
}

export default function AdminModerationDeck({
  listings,
  dealers,
  onApproveListing,
  onRejectListing
}: AdminModerationDeckProps) {
  const pendingListings = listings.filter((l) => l.approved === false);

  return (
    <section className="bg-[#121af2]/5 border border-[#1e293b] p-6 rounded-3xl space-y-6 shadow-2xl font-sans text-xs">
      
      {/* Moderation header */}
      <div className="flex justify-between items-center border-b border-[#1e293b] pb-4 flex-wrap gap-2">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
            <Clock size={10} className="animate-spin" /> System Gatekeeper Active
          </span>
          <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" /> Pending Approval Desk ({pendingListings.length})
          </h2>
          <p className="text-gray-400 text-[11px]">
            Dealer and private advertiser listings must pass structural quality audits before listing index activation.
          </p>
        </div>
        <div className="bg-[#051020]/80 px-4 py-2 rounded-xl border border-[#1e293b] font-mono text-right text-[10px]/relaxed">
          <span className="text-gray-500 block uppercase font-bold">Showroom Policy</span>
          <span className="text-[#38bdf8] font-bold">111-Point Verification Required</span>
        </div>
      </div>

      {pendingListings.length === 0 ? (
        <div className="p-8 text-center bg-[#07101c] rounded-2xl border border-dashed border-[#1e293b] max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Check size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold uppercase tracking-tight text-[11px]">Audit Queue Empty</h4>
            <p className="text-gray-500 text-[10px] leading-relaxed">
              No outstanding dealer or user posts require approvals. All active inventory feeds are verified and in sync.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingListings.map((car) => {
            const dealerName = dealers.find((d) => d.id === car.dealerId)?.name || 'Private Collector';
            return (
              <div 
                key={car.id} 
                className="bg-[#0a111e] border border-[#1e293b] p-4 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5 relative">
                    <img 
                      src={car.imageUrl} 
                      alt={car.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-gray-400 font-bold">
                      {car.year}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[8px] font-mono font-bold bg-[#1e293b] text-[#38bdf8] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {car.fuelType} • {car.transmission}
                    </span>
                    <h4 className="text-white font-bold text-[11px] truncate uppercase pr-1 block leading-tight">
                      {car.title}
                    </h4>
                    <p className="text-gray-500 text-[9px] font-mono truncate">
                      Submitted by: <span className="text-[#38bdf8] font-semibold">{dealerName}</span>
                    </p>
                    <p className="text-amber-500 text-xs font-black font-mono">
                      Rs. {car.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1e293b]/40">
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold font-mono block">AI Optimized Content Draft:</span>
                  <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 pr-1 font-sans">
                    {car.description || 'No custom description. AI generator draft missing.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    onClick={() => onRejectListing(car.id)}
                    className="p-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg uppercase tracking-wider text-[9px] flex items-center gap-1 active:scale-95 duration-100"
                  >
                    <X size={10} /> Delete/Reject
                  </button>
                  <button
                    onClick={() => onApproveListing(car.id)}
                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-[#0b121f] font-mono font-black rounded-lg uppercase tracking-wider text-[9px] flex items-center gap-1 active:scale-95 duration-100 shadow shadow-emerald-950/20"
                  >
                    <Check size={11} /> Approve Listing
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}
