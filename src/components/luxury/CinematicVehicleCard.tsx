import React from 'react';
import { motion } from 'motion/react';
import { Gauge, Sparkles, Zap, Award, Compass, ArrowRight } from 'lucide-react';
import { VehicleListing } from './luxuryTypes';

interface CinematicVehicleCardProps {
  vehicle: VehicleListing;
  onSelect: (vehicle: VehicleListing) => void;
  onInspectToggle?: (vehicle: VehicleListing) => void;
}

export const CinematicVehicleCard: React.FC<CinematicVehicleCardProps> = ({
  vehicle,
  onSelect,
}) => {
  // Spec highlights based on category
  const getBadgeIcon = () => {
    switch (vehicle.category) {
      case 'Hypercar':
        return <Sparkles className="text-[#c5a880] w-3.5 h-3.5 animate-pulse" />;
      case 'Supercar':
        return <Zap className="text-[#c5a880] w-3.5 h-3.5" />;
      case 'Luxury SUV':
        return <Compass className="text-[#c5a880] w-3.5 h-3.5" />;
      case 'Classic':
        return <Award className="text-[#c5a880] w-3.5 h-3.5" />;
      default:
        return <Sparkles className="text-[#c5a880] w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { type: 'spring', stiffness: 80, damping: 15 } 
        },
        show: { 
          opacity: 1, 
          y: 0, 
          transition: { type: 'spring', stiffness: 80, damping: 15 } 
        }
      }}
      className="group relative bg-[#121214] border border-white/5 rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-[#c5a880]/30 transition-all duration-500 flex flex-col justify-between"
      onClick={() => onSelect(vehicle)}
    >
      {/* Absolute overlay highlights for pre-reserved or sold flags */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none">
        {vehicle.isSold ? (
          <span className="bg-red-500/90 text-white font-mono text-[9px] font-black tracking-widest px-2.5 py-1 rounded border border-red-400/25 uppercase shadow-xl">
            Sold & Delivered
          </span>
        ) : vehicle.isReserved ? (
          <span className="bg-[#c5a880]/90 text-black font-mono text-[9px] font-black tracking-widest px-2.5 py-1 rounded border border-[#d6bc97]/25 uppercase shadow-xl">
            Reserved / Under Escrow
          </span>
        ) : vehicle.isPremium ? (
          <span className="bg-black/80 backdrop-blur-md text-[#c5a880] font-mono text-[9px] font-black tracking-widest px-2.5 py-1 rounded border border-[#c5a880]/30 uppercase flex items-center gap-1 shadow-xl">
            {getBadgeIcon()} Flagship Verified
          </span>
        ) : null}
      </div>

      {/* Cinematic Media viewport stage */}
      <div className="relative aspect-[16/10] bg-black overflow-hidden select-none">
        {/* Soft black vignette masks for real-world stage feel */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10 opacity-90 transition-opacity group-hover:opacity-100 duration-500"></div>
        <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-transparent duration-500"></div>

        {/* Dynamic scale transition image */}
        <img
          src={vehicle.images[0]}
          alt={vehicle.title}
          className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Golden laser border highlight beam on hover */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a880] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-20"></div>
      </div>

      {/* Meta Specifications Description Content */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between relative z-20">
        <div className="space-y-2">
          {/* Brand Category Tag Row */}
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
            <span className="text-[#c5a880] font-black">
              {vehicle.brand}
            </span>
            <span className="text-zinc-500">
              {vehicle.category}
            </span>
          </div>

          {/* Title Headline */}
          <h3 className="text-white text-[14px] font-bold uppercase tracking-tight line-clamp-1 group-hover:text-[#c5a880] transition-colors duration-300">
            {vehicle.title}
          </h3>

          {/* Horizontal spec matrix strip */}
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-zinc-400 flex-wrap pt-1">
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
              <Gauge size={10} className="text-[#c5a880]" />
              <span>{vehicle.mileage}</span>
            </div>
            <div className="bg-black/40 px-2 py-1 rounded border border-white/5">
              <span>{vehicle.horsepower} HP</span>
            </div>
            <div className="bg-black/40 px-2 py-1 rounded border border-white/5">
              <span>{vehicle.transmission}</span>
            </div>
          </div>
        </div>

        {/* Pricing tag demand row */}
        <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Capital valuation</span>
            <p className="text-[15px] font-mono font-black text-white group-hover:text-[#c5a880] transition-colors duration-300">
              {vehicle.priceFormatted}
            </p>
          </div>

          {/* Action indicator button */}
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#c5a880] group-hover:text-black group-hover:border-[#c5a880] transition-all duration-300">
            <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
