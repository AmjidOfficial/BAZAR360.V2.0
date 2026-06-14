import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Gauge, Fuel, Milestone, Star, Award, DollarSign, Send, Hourglass } from 'lucide-react';
import { CarListing, Dealer, Review } from './types';
import { INITIAL_DEALERS, INITIAL_LISTINGS, INITIAL_REVIEWS } from './data';

import { 
  dbFetchDealers, 
  dbFetchListings, 
  dbSaveListing, 
  dbRegisterDealership, 
  dbApproveListing, 
  dbAddReview, 
  dbFetchReviews,
  dbSaveUserProfile,
  UserProfile,
  seedDatabaseIfEmpty
} from './lib/dbService';

import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import HomeView from './components/HomeView';
import DealerStorefrontView from './components/DealerStorefrontView';
import SellWithAIView from './components/SellWithAIView';
import SearchExplorerView from './components/SearchExplorerView';
import RegistrationPortal from './components/RegistrationPortal';
import AdminModerationDeck from './components/AdminModerationDeck';

export default function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [selectedDealerId, setSelectedDealerId] = useState<string>('almas-car-valley');
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);

  // Dynamic States
  const [listings, setListings] = useState<CarListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Active Session User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bazar360_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default logged in user - Private Seller, so they can post ads like FB Marketplace right away!
    return {
      uid: 'usr-default-777',
      email: 'amjid.bisconni@gmail.com',
      displayName: 'Amjid B. (Direct Seller)',
      role: 'PrivateSeller',
      region: 'Lahore',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Filter trackers
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bid interaction state inside Detail modal
  const [offerInput, setOfferInput] = useState('');
  const [offerSuccessMessage, setOfferSuccessMessage] = useState('');

  // Sync session profile to standard storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bazar360_user', JSON.stringify(currentUser));
      // Save profile to database
      dbSaveUserProfile(currentUser).catch(err => console.warn('Bypass profile save:', err));
    }
  }, [currentUser]);

  // Initial Sync and Seed workflow
  useEffect(() => {
    async function initDatabase() {
      setDbLoading(true);
      try {
        await seedDatabaseIfEmpty();
        
        const fetchedDealers = await dbFetchDealers();
        const fetchedListings = await dbFetchListings();
        
        setDealers(fetchedDealers);
        setListings(fetchedListings);
        
        // Load reviews in record
        const revsRecord: Record<string, Review[]> = {};
        for (const dl of fetchedDealers) {
          revsRecord[dl.id] = await dbFetchReviews(dl.id);
        }
        setReviewsMap(revsRecord);
      } catch (err) {
        console.warn('Sandbox local sync bypass:', err);
        setDealers(INITIAL_DEALERS);
        setListings(INITIAL_LISTINGS);
        setReviewsMap(INITIAL_REVIEWS);
      } finally {
        setDbLoading(false);
      }
    }
    initDatabase();
  }, []);

  const onSelectDealer = (id: string) => {
    setSelectedDealerId(id);
    setTab('dealer-storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddListing = async (newListing: CarListing) => {
    // 1. Determine permission default values
    const isApprovedByDefault = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.role === 'PrivateSeller';
    
    const finalListing: CarListing = {
      ...newListing,
      approved: isApprovedByDefault,
      assignedSalesRepId: currentUser?.uid || 'guest-seller',
      // If of Manager role, assign to their showroom
      dealerId: currentUser?.role === 'Manager' && currentUser?.salesPodId ? currentUser.salesPodId : 'private',
      createdAt: new Date().toISOString()
    };

    // 2. Commit to database
    try {
      await dbSaveListing(finalListing);
    } catch (err) {
      console.warn(err);
    }

    // 3. Update React views instantly
    setListings((prev) => [finalListing, ...prev]);

    if (finalListing.dealerId !== 'private') {
      setDealers((prevDealers) =>
        prevDealers.map((d) =>
          d.id === finalListing.dealerId
            ? { ...d, vehiclesCount: d.vehiclesCount + 1 }
            : d
        )
      );
    }
  };

  const handleApproveListing = async (listingId: string) => {
    try {
      await dbApproveListing(listingId, true);
    } catch (err) {
      console.warn(err);
    }
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, approved: true } : l))
    );
  };

  const handleRejectListing = async (listingId: string) => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await deleteDoc(doc(db, 'listings', listingId));
    } catch (err) {
      console.warn(err);
    }
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  const handleAddReview = async (comment: string, rating: number) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: currentUser?.displayName || 'Aamir G. (Verified Buyer)',
      rating,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      comment,
    };

    try {
      await dbAddReview(selectedDealerId, newRev);
    } catch (err) {
      console.warn(err);
    }

    setReviewsMap((prev) => ({
      ...prev,
      [selectedDealerId]: [newRev, ...(prev[selectedDealerId] || [])],
    }));

    // Re-average rating inside dealers state
    setDealers((prevDealers) =>
      prevDealers.map((d) => {
        if (d.id === selectedDealerId) {
          const currentReviews = reviewsMap[selectedDealerId] || [];
          const allRatings = [rating, ...currentReviews.map((r) => r.rating)];
          const sum = allRatings.reduce((acc, curr) => acc + curr, 0);
          const computedAvg = parseFloat((sum / allRatings.length).toFixed(1));
          return { ...d, rating: computedAvg };
        }
        return d;
      })
    );
  };

  const currentDealer = dealers.find((d) => d.id === selectedDealerId) || dealers[0];

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput.trim()) return;
    
    const bidAmount = parseInt(offerInput) || 0;
    const listingDealer = dealers.find((d) => d.id === selectedListing?.dealerId);

    setOfferSuccessMessage(
      `✓ Dynamic Offer of Rs. ${bidAmount.toLocaleString()} submitted successfully! ${
        listingDealer?.name || 'Seller'
      } is processing your proposal.`
    );
    setOfferInput('');
    setTimeout(() => {
      setOfferSuccessMessage('');
    }, 5000);
  };

  // RBAC query view filtering based on permissions
  const visibleListings = listings.filter((l) => {
    if (l.approved !== false) return true; // Show all approved listings
    // Non-approved listings only visible to Admins, Showroom Managers, or the listing author
    const isModerator = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
    const isOwner = currentUser && l.assignedSalesRepId === currentUser.uid;
    return isModerator || isOwner;
  });

  return (
    <div className="bg-[#0b121f] text-white min-h-screen text-sm font-sans flex flex-col pb-24 md:pb-8">
      
      {/* Dynamic Top Navigation */}
      <TopAppBar
        currentTab={currentTab}
        setTab={setTab}
        onPostAdClick={() => setTab('sell')}
        currentUser={currentUser}
      />

      {/* Main Container Core Shell */}
      <main className="flex-grow max-w-[1440px] mx-auto w-full pt-20 px-5 md:px-16">
        
        {dbLoading ? (
          <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] space-y-4">
            <div className="relative">
              <Hourglass className="animate-spin text-[#38BDF8]" size={36} />
              <div className="absolute inset-0 border-2 border-dashed border-[#38BDF8] rounded-full animate-ping scale-150 opacity-15"></div>
            </div>
            <p className="text-xs text-[#38BDF8] font-mono tracking-widest uppercase font-bold">Synchronizing Cloud Core</p>
            <p className="text-[10px] text-white/40 font-sans">Connecting to persistent firestore instance & seeding databases...</p>
          </div>
        ) : (
          <>
            {/* Show Moderation Dashboard to Admins or Managers on home page */}
            {currentTab === 'home' && (currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
              <div className="mb-8">
                <AdminModerationDeck
                  listings={listings}
                  dealers={dealers}
                  onApproveListing={handleApproveListing}
                  onRejectListing={handleRejectListing}
                />
              </div>
            )}

            {currentTab === 'home' && (
              <HomeView
                dealers={dealers}
                listings={visibleListings}
                setTab={setTab}
                setSelectedCategory={setSelectedCategory}
                setSearchQuery={setSearchQuery}
                onSelectDealer={onSelectDealer}
                onSelectListing={setSelectedListing}
              />
            )}

            {currentTab === 'search' && (
              <SearchExplorerView
                listings={visibleListings}
                dealers={dealers}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectListing={setSelectedListing}
              />
            )}

            {currentTab === 'dealers' && (
              <div className="space-y-6">
                <div className="border-b border-[#1e293b] pb-3">
                  <h2 className="font-sans font-bold text-xl md:text-2xl text-white">Verified Automotive Dealerships</h2>
                  <p className="text-xs text-gray-400 mt-1">Select an elite showroom partner to inspect dedicated inventories and talk with experts</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dealers.map((dealer) => (
                    <div
                      key={dealer.id}
                      onClick={() => onSelectDealer(dealer.id)}
                      className="bg-[#121a2a] border border-[#1e293b] rounded-2xl overflow-hidden group hover:-translate-y-1 cursor-pointer relative shadow-xl duration-200 hover:border-[#00a3ff]"
                    >
                      <div className="h-32 bg-[#051020] relative flex items-center justify-center overflow-hidden">
                        <img
                          alt={dealer.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                          src={dealer.coverImage}
                          referrerPolicy="no-referrer"
                        />
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center z-10 shadow-lg border-2 border-[#121a2a]">
                          <span className="font-sans font-bold text-xl text-black">
                            {dealer.avatarLetter}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="font-sans font-extrabold text-[#00a3ff] text-base group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                            {dealer.name}
                          </h3>
                          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1 font-sans">
                            <MapPin size={12} className="text-[#00a3ff]" /> {dealer.location}
                          </p>
                        </div>

                        <p className="text-[#a3b3cc] text-xs leading-relaxed line-clamp-2 pr-2 font-sans">
                          {dealer.description}
                        </p>

                        <div className="flex justify-between items-center border-t border-[#1e293b]/50 pt-3 text-[10px]/relaxed">
                          <div className="flex items-center gap-1 font-sans text-gray-500 uppercase tracking-widest font-bold">
                            <Star size={12} className="fill-[#ff6b00] text-[#ff6b00]" /> {dealer.rating} User Score
                          </div>
                          <span className="font-sans text-gray-500 uppercase tracking-widest font-bold">
                            {listings.filter((l) => l.dealerId === dealer.id).length} Active Listings
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab === 'dealer-storefront' && (
              <DealerStorefrontView
                dealer={currentDealer}
                listings={visibleListings}
                reviews={reviewsMap[selectedDealerId] || []}
                onAddReview={handleAddReview}
                onSelectListing={setSelectedListing}
              />
            )}

            {currentTab === 'sell' && (
              <SellWithAIView
                onAddListing={handleAddListing}
                setTab={setTab}
              />
            )}

            {currentTab === 'portal' && (
              <div className="max-w-4xl mx-auto space-y-8 pb-16">
                <div className="border-b border-[#1e293b] pb-3">
                  <h2 className="font-sans font-bold text-xl md:text-2xl text-[#38bdf8] uppercase tracking-tight">CarBazar-360 Portal & Forms</h2>
                  <p className="text-xs text-gray-400 mt-1">Register user accounts, submit dealership catalogs, or toggle RBAC privilege contexts for end-to-end testing.</p>
                </div>
                <RegistrationPortal
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  onDealerRegistered={(newD) => {
                    setDealers((prev) => [...prev, newD]);
                    setReviewsMap((prev) => ({ ...prev, [newD.id]: [] }));
                  }}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Bottom Nav Bar (Mobile Only) */}
      <BottomNavBar currentTab={currentTab} setTab={setTab} />

      {/* DYNAMIC LISTING DETAILS POPUP MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
          <div className="bg-[#0b121f] border border-[#1e293b] rounded-2xl max-w-3xl w-full text-xs font-sans shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Header banner */}
            <div className="bg-[#121a2a] p-4 border-b border-[#1e293b] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#001c33] text-[#00a3ff] font-bold text-[9px] uppercase tracking-wider border border-[#00345c] flex items-center gap-1">
                  <ShieldCheck size={10} /> Certified Spec
                </span>
                <span className="text-[10px] text-gray-400 font-sans">Ref ID: {selectedListing.id}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setOfferSuccessMessage('');
                }}
                className="text-gray-400 hover:text-white bg-[#1e293b] hover:bg-gray-800 p-1.5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrolling Core Content */}
            <div className="flex-grow overflow-y-auto no-scrollbar pb-6 space-y-6">
              
              {/* Product Cover image */}
              <div className="h-64 md:h-80 bg-[#051020] relative shrink-0">
                <img
                  src={selectedListing.imageUrl}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title, details block */}
              <div className="px-6 space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                      {selectedListing.title}
                    </h2>
                    <p className="text-[#00a3ff] text-xs font-bold font-sans mt-1.5 flex items-center gap-1">
                      <MapPin size={12} /> Nationwide Delivery in Pakistan from {dealers.find((d) => d.id === selectedListing.dealerId)?.name || 'Merchant'}
                    </p>
                  </div>
                  <div className="bg-[#001729] border border-[#003964] px-4 py-3 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Certified Valuation</span>
                    <span className="text-xl font-extrabold text-[#ff6b00]">
                      Rs. {selectedListing.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grid Spec Indicators */}
                <div className="grid grid-cols-4 gap-2 text-center pt-2 font-sans text-xs">
                  <div className="bg-[#121a2a] border border-[#1e293b] p-2.5 rounded-xl">
                    <Gauge className="text-[#00a3ff] mx-auto mb-1" size={16} />
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Mileage</span>
                    <span className="font-bold text-white block mt-0.5">{selectedListing.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="bg-[#121a2a] border border-[#1e293b] p-2.5 rounded-xl">
                    <Fuel className="text-[#00a3ff] mx-auto mb-1" size={16} />
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Fuel Type</span>
                    <span className="font-bold text-white block mt-0.5">{selectedListing.fuelType}</span>
                  </div>
                  <div className="bg-[#121a2a] border border-[#1e293b] p-2.5 rounded-xl">
                    <span className="material-symbols-outlined shrink-0 text-base text-[#00a3ff] block mb-1">manufacturing</span>
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Transmission</span>
                    <span className="font-bold text-white block mt-0.5">{selectedListing.transmission}</span>
                  </div>
                  <div className="bg-[#121a2a] border border-[#1e293b] p-2.5 rounded-xl">
                    <Milestone className="text-[#00a3ff] mx-auto mb-1" size={16} />
                    <span className="text-[9px] text-gray-500 block uppercase font-bold text-ellipsis overflow-hidden whitespace-nowrap">Specifications</span>
                    <span className="font-bold text-white block mt-0.5 font-ellipsis overflow-hidden whitespace-nowrap text-[11px]">{selectedListing.specs.regionalSpecs.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Technical data sheets */}
                <div className="bg-[#121a2a] border border-[#1e293b] rounded-xl p-4.5 space-y-2 font-sans text-xs">
                  <h4 className="text-[#00a3ff] font-bold text-xs uppercase tracking-wider border-b border-[#1e293b] pb-1.5 mb-2 flex items-center gap-1">
                    <Award size={14} /> Full Technical Specification Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <p className="flex justify-between border-b border-[#1e293b]/50 pb-1">
                      <span className="text-gray-500">Outer Paint Body:</span> <span className="font-bold text-white">{selectedListing.specs.color}</span>
                    </p>
                    <p className="flex justify-between border-b border-[#1e293b]/50 pb-1">
                      <span className="text-gray-500">Engine block Displacement:</span> <span className="font-bold text-white">{selectedListing.specs.engineSize}</span>
                    </p>
                    <p className="flex justify-between border-b border-[#1e293b]/50 pb-1">
                      <span className="text-gray-500">Horsepower capacity:</span> <span className="font-bold text-white">{selectedListing.specs.horspower}</span>
                    </p>
                    <p className="flex justify-between border-b border-[#1e293b]/50 pb-1">
                      <span className="text-gray-500">Regional Specifications:</span> <span className="font-bold text-[#00a3ff]">{selectedListing.specs.regionalSpecs}</span>
                    </p>
                  </div>
                </div>

                {/* Sales copywriting */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1e293b] pb-1.5">Executive Presentation Description</h4>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans pr-4">{selectedListing.description}</p>
                </div>

                {/* Bid/Offer tool integrations */}
                <div className="bg-[#121a2a]/40 border border-[#1e293b] p-4 rounded-xl space-y-3 font-sans mt-2">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">Dynamic Offer Pipeline</span>
                  
                  {offerSuccessMessage ? (
                    <div className="p-3 bg-green-950/40 text-green-400 font-bold text-xs rounded border border-green-900 leading-relaxed font-sans shadow-inner">
                      {offerSuccessMessage}
                    </div>
                  ) : (
                    <form onSubmit={handleOfferSubmit} className="flex gap-2">
                      <div className="bg-[#051020] border border-[#1e293b] p-2 rounded-lg flex items-center flex-grow">
                        <DollarSign size={14} className="text-[#00a3ff] mr-1 shrink-0" />
                        <input
                          type="number"
                          placeholder="Place custom offer in PKR / Rs..."
                          className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-xs w-full"
                          value={offerInput}
                          onChange={(e) => setOfferInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#00a3ff] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 duration-75 text-xs shadow"
                      >
                        <Send size={12} /> Submit Bid
                      </button>
                    </form>
                  )}
                  <span className="text-[9px] text-gray-500 mt-1 block font-sans">Offers sent via the pipeline are non-binding but pre-qualify you in standard showroom inventories.</span>
                </div>

              </div>

            </div>

            {/* Bottom converted Action CTA Bar */}
            <div className="p-4 border-t border-[#1e293b] bg-[#121a2a] flex gap-3 shrink-0">
              <button
                onClick={() => {
                  const d = dealers.find((dl) => dl.id === selectedListing.dealerId);
                  if (d) {
                    onSelectDealer(d.id);
                    setSelectedListing(null);
                  }
                }}
                className="flex-1 bg-transparent border border-[#00a3ff] hover:bg-[#00a3ff]/10 text-[#00a3ff] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-97 change-all duration-75"
              >
                <span className="material-symbols-outlined shrink-0 text-base">store</span> Contact Showroom Profile
              </button>
              
              <a
                href={`mailto:amjid.bisconni@gmail.com?subject=Inquiry on ${selectedListing.title}&body=Hello, I am interested in checking vehicle specifications on the ${selectedListing.title} listed under id ${selectedListing.id}.`}
                className="flex-1 bg-[#ff6b00] hover:bg-orange-600 border border-orange-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center active:scale-97 change-all duration-75 shadow"
              >
                <span className="material-symbols-outlined shrink-0 text-base">mail</span> Submit Instant Query Card
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
