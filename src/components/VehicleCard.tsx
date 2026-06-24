import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gauge, Sparkles, Check, ArrowRight, ShieldCheck, Heart, RefreshCw, Share2, MessageCircle } from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { useCurrencyMode } from '../lib/currency';
import ShareOverlay from './ShareOverlay';
import CommentSection from './CommentSection';
import SimpleRegistrationModal from './SimpleRegistrationModal';
import { dbToggleLike, dbFetchLikes, UserProfile } from '../lib/dbService';

interface VehicleCardProps {
  car: CarListing;
  dealer?: Dealer;
  variant?: 'grid' | 'list' | 'compact' | 'hero';
  onSelect: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  isComparing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  car,
  dealer,
  variant = 'grid',
  onSelect,
  onToggleCompare,
  isComparing = false,
}) => {
  const { renderPrice } = useCurrencyMode();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bazar360_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    const fetchLikesData = async () => {
      try {
        const likes = await dbFetchLikes(car.id);
        setLikedBy(likes);
        setLikedCount(likes.length);
      } catch (err) {
        console.warn('Silent likes fetch issue:', err);
      }
    };
    fetchLikesData();
  }, [car.id]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsRegOpen(true);
      return;
    }

    const isLiking = !likedBy.includes(currentUser.uid);
    // Optimistic UI update
    if (isLiking) {
      setLikedBy((prev) => [...prev, currentUser.uid]);
      setLikedCount((prev) => prev + 1);
    } else {
      setLikedBy((prev) => prev.filter((uid) => uid !== currentUser.uid));
      setLikedCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await dbToggleLike(car.id, currentUser.uid, isLiking);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsRegOpen(true);
      return;
    }
    setIsCommentOpen(true);
  };

  const handleRegSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Refresh page/component state to detect user is now registered
    window.dispatchEvent(new Event('storage'));
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareTitle = `${car.make} ${car.model} (${car.year})`;
    const shareText = `Check out this verified ${car.title} on BAZAR360!`;
    const shareUrl = `${window.location.origin}/listings/${car.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled or failed, open custom sheet as fallback just in case
        setIsShareOpen(true);
      }
    } else {
      setIsShareOpen(true);
    }
  };

  const hasLiked = currentUser ? likedBy.includes(currentUser.uid) : false;

  const renderSocialBar = () => (
    <div className="flex items-center justify-between border-t border-border-main/50 pt-2.5 mt-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-wider shrink-0 select-none">
      <button
        type="button"
        onClick={handleLikeToggle}
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-bg-primary transition-colors cursor-pointer ${
          hasLiked ? 'text-red-500 font-bold' : 'hover:text-text-main'
        }`}
      >
        <Heart size={13} className={hasLiked ? 'fill-red-500 stroke-red-500' : ''} />
        <span>{likedCount > 0 ? `${likedCount} Like${likedCount > 1 ? 's' : ''}` : 'Like'}</span>
      </button>

      <button
        type="button"
        onClick={handleCommentClick}
        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-bg-primary hover:text-text-main transition-colors cursor-pointer"
      >
        <MessageCircle size={13} />
        <span>Comment</span>
      </button>

      <button
        type="button"
        onClick={handleShareClick}
        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-bg-primary hover:text-text-main transition-colors cursor-pointer"
      >
        <Share2 size={13} />
        <span>Share</span>
      </button>
    </div>
  );

  const isAutoChoice = car.dealerId === 'auto-choice-peshawar';

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 } 
    }
  };

  // Compact variant layout
  if (variant === 'compact') {
    return (
      <>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onClick={() => onSelect(car)}
          className="group flex gap-3 p-2.5 rounded-xl bg-bg-secondary border border-border-main hover:border-accent-main/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
            <img
              src={car.imageUrl}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col justify-between py-0.5 flex-grow min-w-0">
            <div>
              <span className="text-[9px] font-mono tracking-wider text-accent-main font-black uppercase">
                {car.make} {car.year}
              </span>
              <h4 className="text-xs font-bold text-text-main line-clamp-1 group-hover:text-accent-main transition-colors uppercase">
                {car.title}
              </h4>
            </div>
            <div className="flex items-center justify-between gap-1 mt-1">
              <span className="text-xs font-mono font-black text-text-main">
                {renderPrice(car.price)}
              </span>
              <span className="text-[8.5px] font-mono text-text-muted">
                {car.mileage.toLocaleString()} km
              </span>
            </div>
          </div>
        </motion.div>
        <ShareOverlay isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title={car.title} description={car.description || 'Verified BAZAR360 Car Listing'} url={`${window.location.origin}/listings/${car.id}`} />
        <CommentSection isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} listingId={car.id} listingTitle={car.title} currentUserName={currentUser?.displayName || 'Guest Visitor'} currentUserId={currentUser?.uid} />
        <SimpleRegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} onSuccess={handleRegSuccess} />
      </>
    );
  }

  // Horizontal list variant layout
  if (variant === 'list') {
    return (
      <>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onClick={() => onSelect(car)}
          className="group flex flex-col md:flex-row bg-bg-secondary border border-border-main hover:border-accent-main/40 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full"
        >
          {/* Left Side: Photo with high radius */}
          <div className="relative w-full md:w-72 aspect-[16/10] md:aspect-auto overflow-hidden bg-stone-900">
            <img
              src={car.imageUrl}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {isAutoChoice ? (
                <span className="bg-accent-main text-stone-950 font-mono text-[9px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" /> Flagship
                </span>
              ) : car.verified ? (
                <span className="bg-bg-primary/90 text-text-main font-mono text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md border border-border-main shadow-lg flex items-center gap-1">
                  <Check size={10} className="text-accent-main" /> Verified
                </span>
              ) : null}
            </div>

            {/* Floating Share Action Button */}
            <button
              type="button"
              onClick={handleShareClick}
              className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/75 hover:bg-accent-main text-gray-300 hover:text-stone-950 flex items-center justify-center border border-white/10 hover:border-accent-main transition-all cursor-pointer shadow-lg z-20"
              title="Share Listing"
            >
              <Share2 size={13} />
            </button>
          </div>

          {/* Right Side: Specs & Action Rows */}
          <div className="p-6 flex-grow flex flex-col justify-between gap-4 min-w-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black tracking-luxury text-accent-main uppercase">
                  {car.make} • {car.model} • {car.year}
                </span>
                {dealer && (
                  <span className="text-[8px] font-mono uppercase bg-bg-primary px-2.5 py-1 rounded border border-border-main text-text-muted">
                    {dealer.name}
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-text-main group-hover:text-accent-main transition-colors uppercase leading-snug line-clamp-1">
                {car.title}
              </h3>

              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                {car.description || 'Experience ultimate comfort and prestige with this meticulously inspected vehicle. Designed to exceed premium road standards.'}
              </p>

              <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted uppercase flex-wrap pt-1">
                <span className="bg-bg-primary px-2.5 py-1 rounded border border-border-main flex items-center gap-1 text-text-main">
                  <Gauge size={12} className="text-accent-main" /> {car.mileage.toLocaleString()} KM
                </span>
                <span className="bg-bg-primary px-2.5 py-1 rounded border border-border-main text-text-main">{car.fuelType}</span>
                <span className="bg-bg-primary px-2.5 py-1 rounded border border-border-main text-text-main">{car.transmission}</span>
                {car.specs?.color && (
                  <span className="bg-bg-primary px-2.5 py-1 rounded border border-border-main text-text-main">{car.specs.color}</span>
                )}
              </div>
              {renderSocialBar()}
            </div>

            <div className="flex items-center justify-between border-t border-border-main pt-4 mt-auto">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase tracking-widest text-text-muted">Valuation Index</span>
                <p className="text-lg font-mono font-black text-text-main group-hover:text-accent-main transition-colors duration-300">
                  {renderPrice(car.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onToggleCompare && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(car);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-black uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                      isComparing
                        ? 'bg-accent-main text-stone-950 border-accent-main shadow-md'
                        : 'bg-bg-primary text-text-muted border-border-main hover:text-text-main'
                    }`}
                    style={{ minHeight: '34px' }}
                  >
                    <RefreshCw size={10} className={isComparing ? 'animate-spin' : ''} />
                    {isComparing ? 'In Scope' : '+ Compare'}
                  </button>
                )}

                <div className="w-9 h-9 rounded-xl bg-bg-primary border border-border-main flex items-center justify-center group-hover:bg-accent-main group-hover:text-stone-950 group-hover:border-accent-main transition-all duration-300">
                  <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <ShareOverlay isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title={car.title} description={car.description || 'Verified BAZAR360 Car Listing'} url={`${window.location.origin}/listings/${car.id}`} />
        <CommentSection isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} listingId={car.id} listingTitle={car.title} currentUserName={currentUser?.displayName || 'Guest Visitor'} currentUserId={currentUser?.uid} />
        <SimpleRegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} onSuccess={handleRegSuccess} />
      </>
    );
  }

  // Hero immersive widescreen variant
  if (variant === 'hero') {
    return (
      <>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onClick={() => onSelect(car)}
          className="group relative bg-bg-secondary border border-border-main hover:border-accent-main/40 rounded-xl overflow-hidden shadow-xl cursor-pointer transition-all duration-500 flex flex-col min-h-[480px] w-full"
        >
          <div className="relative h-[280px] w-full overflow-hidden bg-stone-950">
            <img
              src={car.imageUrl}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-black/20 z-10" />
            
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <span className="bg-stone-950/80 backdrop-blur-md text-accent-main border border-accent-main/35 font-mono text-[9px] font-black tracking-widest px-3 py-1 rounded-lg uppercase flex items-center gap-1.5 shadow-2xl">
                <Sparkles size={11} className="animate-pulse" /> Signature Showcase
              </span>
            </div>

            {/* Floating Share Action Button */}
            <button
              type="button"
              onClick={handleShareClick}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-950/80 backdrop-blur-md hover:bg-accent-main text-gray-300 hover:text-stone-950 flex items-center justify-center border border-white/10 hover:border-accent-main transition-all cursor-pointer shadow-lg z-20"
              title="Share Listing"
            >
              <Share2 size={14} />
            </button>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-accent-main uppercase font-bold">
                  {car.make} • {car.year} Model
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight line-clamp-1 drop-shadow-md">
                  {car.title}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-grow flex flex-col justify-between relative z-20">
            <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
              {car.description || 'This ultra-exclusive vehicle offers a standard-setting fusion of breathtaking aesthetics, high-octane engineering, and uncompromised road mastery.'}
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1 text-[10px] font-mono uppercase text-text-main text-center">
              <div className="bg-bg-primary p-2.5 rounded-xl border border-border-main flex flex-col items-center justify-center gap-0.5">
                <span className="text-[8px] text-text-muted">Mileage</span>
                <span className="font-bold">{car.mileage.toLocaleString()} km</span>
              </div>
              <div className="bg-bg-primary p-2.5 rounded-xl border border-border-main flex flex-col items-center justify-center gap-0.5">
                <span className="text-[8px] text-text-muted">Transmission</span>
                <span className="font-bold">{car.transmission}</span>
              </div>
              <div className="bg-bg-primary p-2.5 rounded-xl border border-border-main flex flex-col items-center justify-center gap-0.5">
                <span className="text-[8px] text-text-muted">Fuel Engine</span>
                <span className="font-bold">{car.fuelType}</span>
              </div>
            </div>
            {renderSocialBar()}

            <div className="border-t border-border-main pt-4 flex items-center justify-between mt-auto">
              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-text-muted">Exclusive Valuation</span>
                <p className="text-xl font-mono font-black text-text-main group-hover:text-accent-main transition-colors duration-300">
                  {renderPrice(car.price)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {onToggleCompare && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(car);
                    }}
                    className={`px-3 py-2 rounded-xl border text-[9px] font-mono font-black uppercase transition-all duration-200 cursor-pointer ${
                      isComparing
                        ? 'bg-accent-main text-stone-950 border-accent-main'
                        : 'bg-bg-primary text-text-muted border-border-main hover:text-text-main'
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    {isComparing ? '✓ Comparison Target' : '+ Add to Comparison'}
                  </button>
                )}
                <div className="px-4 py-2 bg-text-main text-bg-primary group-hover:bg-accent-main group-hover:text-stone-950 rounded-xl font-mono text-[10px] font-black tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-md">
                  Inquire <ArrowRight size={11} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <ShareOverlay isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title={car.title} description={car.description || 'Verified BAZAR360 Car Listing'} url={`${window.location.origin}/listings/${car.id}`} />
        <CommentSection isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} listingId={car.id} listingTitle={car.title} currentUserName={currentUser?.displayName || 'Guest Visitor'} currentUserId={currentUser?.uid} />
        <SimpleRegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} onSuccess={handleRegSuccess} />
      </>
    );
  }

  // Grid default variant (the main beautifully aligned card)
  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        onClick={() => onSelect(car)}
        className="group relative bg-bg-secondary border border-border-main hover:border-accent-main/30 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
      >
        {/* Photo with aspect ratios & vignettes */}
        <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden select-none">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-secondary/40 to-transparent z-10 opacity-70 group-hover:opacity-100 duration-500"></div>
          <img
            src={car.imageUrl}
            alt={car.title}
            className="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {isAutoChoice ? (
              <span className="bg-accent-main text-stone-950 font-mono text-[9px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                <Sparkles size={10} className="animate-pulse" /> Flagship
              </span>
            ) : car.verified ? (
              <span className="bg-bg-primary/95 text-text-main font-mono text-[9px] font-black tracking-wider px-2 py-0.5 rounded border border-border-main shadow-lg flex items-center gap-0.5">
                <Check size={9} className="text-accent-main" /> Verified
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-3 right-3 text-white bg-black/75 border border-white/10 text-[8.5px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {car.year} MODEL
          </div>

          {/* Floating Share Action Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/75 hover:bg-accent-main text-gray-300 hover:text-stone-950 flex items-center justify-center border border-white/10 hover:border-accent-main transition-all cursor-pointer shadow-lg z-20"
            title="Share Listing"
          >
            <Share2 size={13} />
          </button>

          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(car);
              }}
              className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-lg border text-[8.5px] font-mono font-black uppercase backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                isComparing
                  ? 'bg-accent-main text-stone-950 border-accent-main shadow-md'
                  : 'bg-black/70 text-gray-300 border-white/10 hover:text-white'
              }`}
              style={{ minHeight: '30px' }}
            >
              {isComparing ? '✓ Comparing' : '+ Compare'}
            </button>
          )}
        </div>

        {/* Meta Specs Descriptions content */}
        <div className="p-5 space-y-3.5 flex-grow flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1.5 text-[9.5px] font-mono uppercase tracking-wider">
              <span className="text-accent-main font-black truncate max-w-[120px]">
                {car.make} • {car.model}
              </span>
              {dealer && (
                <span className="text-[7.5px] text-text-muted bg-bg-primary border border-border-main px-2 py-0.5 rounded truncate max-w-[120px]">
                  {dealer.name}
                </span>
              )}
            </div>

            <h3 className="text-text-main text-[13.5px] font-bold uppercase tracking-tight line-clamp-1 group-hover:text-accent-main transition-colors duration-300 leading-tight">
              {car.title}
            </h3>

            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-text-muted flex-wrap pt-0.5">
              <div className="flex items-center gap-1 bg-bg-primary px-2 py-0.5 rounded border border-border-main text-text-main">
                <Gauge size={10} className="text-accent-main" />
                <span>{car.mileage.toLocaleString()} km</span>
              </div>
              <div className="bg-bg-primary px-2 py-0.5 rounded border border-border-main text-text-main">
                <span>{car.fuelType}</span>
              </div>
              <div className="bg-bg-primary px-2 py-0.5 rounded border border-border-main text-text-main">
                <span>{car.transmission}</span>
              </div>
            </div>
            {renderSocialBar()}
          </div>

          {/* Pricing tag row */}
          <div className="border-t border-border-main pt-3.5 flex items-center justify-between mt-auto">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono uppercase tracking-widest text-text-muted">Market value</span>
              <p className="text-[14px] font-mono font-black text-text-main group-hover:text-accent-main transition-colors duration-300">
                {renderPrice(car.price)}
              </p>
            </div>

            <div className="w-8 h-8 rounded-xl bg-bg-primary border border-border-main flex items-center justify-center group-hover:bg-accent-main group-hover:text-stone-950 group-hover:border-accent-main transition-all duration-300">
              <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
      <ShareOverlay isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title={car.title} description={car.description || 'Verified BAZAR360 Car Listing'} url={`${window.location.origin}/listings/${car.id}`} />
      <CommentSection isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} listingId={car.id} listingTitle={car.title} currentUserName={currentUser?.displayName || 'Guest Visitor'} currentUserId={currentUser?.uid} />
      <SimpleRegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} onSuccess={handleRegSuccess} />
    </>
  );
};
