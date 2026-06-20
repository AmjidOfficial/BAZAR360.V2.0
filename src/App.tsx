import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Gauge, Fuel, Milestone, Star, Award, DollarSign, Send, Hourglass, Bell, Sparkles } from 'lucide-react';
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
  dbFetchUserProfile,
  UserProfile,
  seedDatabaseIfEmpty
} from './lib/dbService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCurrencyMode } from './lib/currency';

import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import HomeView from './components/HomeView';
import DealerStorefrontView from './components/DealerStorefrontView';
import SellWithAIView from './components/SellWithAIView';
import SearchExplorerView from './components/SearchExplorerView';
import RegistrationPortal from './components/RegistrationPortal';
import AdminModerationDeck from './components/AdminModerationDeck';
import MediaFeedView from './components/MediaFeedView';
import MarketInsightsView from './components/MarketInsightsView';
import ConciergeView from './components/ConciergeView';

export default function App() {
  const { renderPrice } = useCurrencyMode();
  const [currentTab, setTab] = useState<string>('home');
  const [selectedDealerId, setSelectedDealerId] = useState<string>('auto-choice-peshawar');
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [compareList, setCompareList] = useState<CarListing[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [activeIndustry, setActiveIndustry] = useState<'Automotive' | 'Footwear' | 'Apparel' | 'Electronics'>('Automotive');
  const [currentCategory, setCurrentCategory] = useState<'gateway' | 'auto' | 'footwear' | 'food'>('gateway');
  const [comingSoonSector, setComingSoonSector] = useState<{ title: string; tagline: string; desc: string; icon: string; spec: string } | null>(null);

  // Ecosystem Gateway gamified voting & notification registers
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_votes');
      return saved ? JSON.parse(saved) : {
        architecture: 1104,
        wellness: 872,
        smartLiving: 615,
        logistics: 439
      };
    } catch (e) {
      return { architecture: 1104, wellness: 872, smartLiving: 615, logistics: 439 };
    }
  });

  const [userVoted, setUserVoted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_user_voted');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bazar360_notifications');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // State-controlled teaser voting & notifications
  const [teaserVotes, setTeaserVotes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bazar360_teaser_votes');
      return saved ? parseInt(saved, 10) : 1240;
    } catch {
      return 1240;
    }
  });
  const [userTeaserVoted, setUserTeaserVoted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bazar360_user_teaser_voted') === 'true';
    } catch {
      return false;
    }
  });
  const [teaserNotified, setTeaserNotified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bazar360_teaser_notified') === 'true';
    } catch {
      return false;
    }
  });

  // Persist gamified registers
  useEffect(() => {
    localStorage.setItem('bazar360_votes', JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem('bazar360_user_voted', JSON.stringify(userVoted));
  }, [userVoted]);

  useEffect(() => {
    localStorage.setItem('bazar360_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bazar360_teaser_votes', teaserVotes.toString());
  }, [teaserVotes]);

  useEffect(() => {
    localStorage.setItem('bazar360_user_teaser_voted', userTeaserVoted ? 'true' : 'false');
  }, [userTeaserVoted]);

  useEffect(() => {
    localStorage.setItem('bazar360_teaser_notified', teaserNotified ? 'true' : 'false');
  }, [teaserNotified]);

  // Dynamic Tagline Rotation Logic
  const [rotatingTagline, setRotatingTagline] = useState<string>('');
  useEffect(() => {
    const taglines = [
      "Unlocking Next-Gen Trade. Premium Ecosystems Loading.",
      "The Marketplace is Expanding. New Spaces Initializing.",
      "Evolving Beyond Borders. Next-Gen Portals Arriving Soon."
    ];
    // Select exactly one tagline upon page load/visit
    const randomIndex = Math.floor(Math.random() * taglines.length);
    setRotatingTagline(taglines[randomIndex]);
  }, []);

  const handleSetCategory = (cat: 'gateway' | 'auto' | 'footwear' | 'food') => {
    // RAM memory reset protocols: Completely flush comparison list, search text, and filter selections.
    setCompareList([]);
    setSearchQuery('');
    setSelectedCategory('All');
    setCurrentCategory(cat);
  };

  const handleToggleCompare = (car: CarListing) => {
    setCompareList((prev) => {
      const exists = prev.some(item => item.id === car.id);
      if (exists) {
        return prev.filter(item => item.id !== car.id);
      }
      if (prev.length >= 2) {
        return [prev[1], car];
      }
      return [...prev, car];
    });
  };

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
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Migration: Auto-inject standard metadata fields required by the latest rules
          return {
            status: 'Active',
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            ...parsed
          };
        }
      } catch (e) {
        // Fallback
      }
    }
    // Default config: Allow visitors to experience the web catalog purely as guests/visitors.
    return null;
  });

  // Filter trackers
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Memory and Media Optimization: Switch categories wipes comparisons to reclaim RAM
  useEffect(() => {
    if (compareList.length > 0) {
      console.log("[BAZAR360 Memory Safe] Tenant category shift. Wiping active auto comparison arrays...");
      setCompareList([]);
    }
  }, [selectedCategory]);

  // Bid interaction state inside Detail modal
  const [offerInput, setOfferInput] = useState('');
  const [offerSuccessMessage, setOfferSuccessMessage] = useState('');

  // Sync session profile to standard storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bazar360_user', JSON.stringify(currentUser));
      // Save profile to database
      dbSaveUserProfile(currentUser).catch(err => console.warn('Bypass profile save:', err));
    } else {
      localStorage.removeItem('bazar360_user');
    }
  }, [currentUser]);

  // Initial Sync and Seed workflow
  useEffect(() => {
    async function initDatabase() {
      setDbLoading(true);
      
      // Fast connection race-timer to guarantee instant rendering even if connection is firewalled or slow
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout - loading high speed local layout')), 4500)
      );

      try {
        await Promise.race([
          (async () => {
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
          })(),
          timeoutPromise
        ]);
      } catch (err) {
        console.warn('Sandbox local sync fallback activated due to:', err);
        // Load highly responsive mock data instantly so the layout works flawlessly in offline / slow connection modes
        setDealers(INITIAL_DEALERS);
        setListings(INITIAL_LISTINGS);
        
        // Build reviews record from local backups
        const revsRecord: Record<string, Review[]> = {};
        for (const dl of INITIAL_DEALERS) {
          revsRecord[dl.id] = INITIAL_REVIEWS[dl.id] || [];
        }
        setReviewsMap(revsRecord);
      } finally {
        setDbLoading(false);
      }
    }
    initDatabase();
  }, []);

  // Listen for Firebase Auth state changes to sync active user profile details
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase Auth active session detected for UID:", firebaseUser.uid);
        try {
          const fetchedProfile = await dbFetchUserProfile(firebaseUser.uid);
          if (fetchedProfile) {
            setCurrentUser(fetchedProfile);
          } else {
            // First-time signup fallback: create a robust, rules-compliant profile
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'amjid.bisconni@gmail.com',
              displayName: firebaseUser.displayName || 'Amjid B.',
              phoneNumber: firebaseUser.phoneNumber || '+92 314 3600000',
              phoneVerified: !!firebaseUser.phoneNumber,
              city: 'Lahore',
              state: 'Punjab',
              role: firebaseUser.email === 'amjid.bisconni@gmail.com' ? 'Admin' : 'Buyer',
              status: 'Active',
              socials: {
                facebook: 'https://facebook.com/amjid.bazar360',
                instagram: 'https://instagram.com/amjid_b360'
              },
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              region: 'Lahore'
            };
            setCurrentUser(fallbackProfile);
            await dbSaveUserProfile(fallbackProfile).catch(err => console.warn("Fallback profile save skip:", err));
          }
        } catch (err) {
          console.error("Auth state loading error:", err);
        }
      } else {
        console.log("No active Firebase Auth session. App running in offline guest mode.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (err) {
      console.warn("Silent auth signout warning:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('bazar360_user');
    setTab('home');
  };

  const handleRoleSwap = (role: 'Admin' | 'Showroom Owner' | 'Private Seller') => {
    if (!currentUser) return;
    
    let displayName = 'Amjid B.';
    let salesPodId: string | undefined = undefined;
    if (role === 'Admin') {
      displayName = 'Amjid B. (Super Admin)';
    } else if (role === 'Showroom Owner') {
      displayName = 'Amjid B. (Showroom Owner / Dealer)';
      salesPodId = 'auto-choice-peshawar'; // Hard link to Auto Choice Peshawar for live sandbox tests!
    } else if (role === 'Private Seller') {
      displayName = 'Amjid B. (Ad Poster / Private Seller)';
    }
    
    const updatedUser: UserProfile = {
      ...currentUser,
      role,
      displayName,
      salesPodId
    };
    
    setCurrentUser(updatedUser);
  };

  const onSelectDealer = (id: string) => {
    setSelectedDealerId(id);
    setTab('dealer-storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddListing = async (newListing: CarListing) => {
    // 1. Determine permission default values
    const isApprovedByDefault = currentUser?.role === 'Admin' || currentUser?.role === 'Showroom Owner' || currentUser?.role === 'Private Seller';
    
    const finalListing: CarListing = {
      ...newListing,
      approved: isApprovedByDefault,
      assignedSalesRepId: currentUser?.uid || 'guest-seller',
      // If of Showroom Owner role, assign to their showroom
      dealerId: currentUser?.role === 'Showroom Owner' && currentUser?.salesPodId ? currentUser.salesPodId : 'private',
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

  const handlePublishActivity = async (dealerId: string, post: any) => {
    setDealers((prevDealers) =>
      prevDealers.map((d) =>
        d.id === dealerId
          ? { ...d, activityFeed: [post, ...(d.activityFeed || [])] }
          : d
      )
    );

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const dealerRef = doc(db, 'dealers', dealerId);
      const dSnap = await getDoc(dealerRef);
      if (dSnap.exists()) {
        const dData = dSnap.data();
        const currentFeed = dData.activityFeed || [];
        await updateDoc(dealerRef, {
          activityFeed: [post, ...currentFeed],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Silent activity feed persistence warning:', err);
    }
  };

  const handleApproveActivity = async (dealerId: string, postId: string) => {
    setDealers((prevDealers) =>
      prevDealers.map((d) => {
        if (d.id === dealerId) {
          const updatedFeed = (d.activityFeed || []).map((post) =>
            post.id === postId ? { ...post, status: 'approved' as const } : post
          );
          return { ...d, activityFeed: updatedFeed };
        }
        return d;
      })
    );

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const dealerRef = doc(db, 'dealers', dealerId);
      const dSnap = await getDoc(dealerRef);
      if (dSnap.exists()) {
        const dData = dSnap.data();
        const currentFeed = dData.activityFeed || [];
        const updatedFeed = currentFeed.map((post: any) =>
          post.id === postId ? { ...post, status: 'approved' } : post
        );
        await updateDoc(dealerRef, {
          activityFeed: updatedFeed,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Silent activity feed approval persistence warning:', err);
    }
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
    // Non-approved listings only visible to Admins, Showroom Owners, or the listing author
    const isModerator = currentUser?.role === 'Admin' || currentUser?.role === 'Showroom Owner';
    const isOwner = currentUser && l.assignedSalesRepId === currentUser.uid;
    return isModerator || isOwner;
  });

  // Flagship Priority Injection: Sort auto-choice-peshawar entries to the absolute top of everything
  const prioritizedListings = React.useMemo(() => {
    const flagshipListings = visibleListings.filter(l => l.dealerId === 'auto-choice-peshawar');
    const ordinaryListings = visibleListings.filter(l => l.dealerId !== 'auto-choice-peshawar');
    return [...flagshipListings, ...ordinaryListings];
  }, [visibleListings]);

  if (currentCategory === 'gateway') {
    const handleVote = (sectorId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (userVoted[sectorId]) {
        setVotes(prev => ({ ...prev, [sectorId]: prev[sectorId] - 1 }));
        setUserVoted(prev => ({ ...prev, [sectorId]: false }));
      } else {
        setVotes(prev => ({ ...prev, [sectorId]: prev[sectorId] + 1 }));
        setUserVoted(prev => ({ ...prev, [sectorId]: true }));
      }
    };

    const handleToggleNotify = (sectorId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
    };

    const upcomingSectors = [
      {
        id: 'architecture',
        title: "Next-Gen Spaces",
        tagline: "Sourcing residential penthouses, sustainable designer villas, and smart buildings.",
        desc: "A digitized architectural directory tracking state-of-the-art developments, luxury master plans, and tokenized occupancy pipelines across metropolis zones.",
        icon: "🏢",
        badge: "In Active Seeding",
        glowColor: "cyan",
      },
      {
        id: 'wellness',
        title: "Premium Wellness",
        tagline: "Advanced tele-consultation pairings, certified diagnostics and pharmacy options.",
        desc: "Connecting local medical registries, genuine pharmaceutical fulfillment workflows, and smart electronic diagnostics records with compliance indicators.",
        icon: "🏥",
        badge: "In Ideation Node",
        glowColor: "purple",
      },
      {
        id: 'smartLiving',
        title: "Smart Living",
        tagline: "Artificial intelligence-backed high precision automated smart home upgrades.",
        desc: "Certified appliance catalogs, customized low-voltage layout optimization services, and solar array performance indexing panels.",
        icon: "⚡",
        badge: "Research Channel",
        glowColor: "emerald",
      },
      {
        id: 'logistics',
        title: "Logistics Hub",
        tagline: "Next-generation secure commercial routes, fleets and priority delivery lines.",
        desc: "Enterprise freight synchronization matrices, heavy-machinery transfers tracking, and automated container dispatch routing channels.",
        icon: "📦",
        badge: "In Incubation",
        glowColor: "orange",
      }
    ];

    return (
      <div className="bg-[#030712] text-white min-h-screen text-sm font-sans flex flex-col justify-between p-4 md:p-12 relative overflow-hidden select-none">
        {/* Ambient Cosmic Background Lighting */}
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* 1. STREAMLINED PREMIUM GATEWAY NAVBAR */}
        <header className="w-full flex items-center justify-between py-4 border-b border-white/5 relative z-20 mb-8 max-w-7xl mx-auto">
          {/* Core Branding */}
          <div className="flex items-center space-x-2.5 cursor-pointer select-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-500/30 shadow-lg shadow-black">
              <svg className="w-6 h-6 text-orange-500 animate-[spin_30s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
              <span className="absolute text-[9px] font-black text-sky-400">360</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-white tracking-widest leading-none">BAZAR<span className="text-orange-500 font-extrabold">360</span></span>
              <span className="text-[9px] font-black text-sky-400 tracking-[0.22em] uppercase pt-0.5">Ecosystem</span>
            </div>
          </div>

          {/* Primary Active Sector Button ONLY (Spaces & Health replaced/cleaned from navbar) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSetCategory('auto')}
              className="group flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-slate-950 border border-orange-500/30 hover:border-orange-500 rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-orange-950/20 active:scale-[0.98]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 group-hover:bg-slate-950 transition-colors"></span>
              </span>
              <span>Auto Choice [Live]</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </header>

        {/* Hero Console */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-10 space-y-4 relative z-10 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-mono font-black tracking-[0.3em] text-[#38BDF8] bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20 shadow-md">
            Pakistan's Premium Multi-Tenant Trade Network
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase">
            Unified Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-orange-500 leading-normal">Ecosystem Entry</span>
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xl">
            Switch sectors instantly to explore specialized inventories, localized financial scales, and high-resolution verified trade assets under one cryptographic catalog gateway.
          </p>
        </div>

        {/* Redesigned 2-Column Responsive Layout Grid */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10 px-4 mb-20 animate-fade-in">
          
          {/* Column 1: FLAGSHIP SECTOR - Auto Choice (Live Partition) */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] uppercase font-black">
                ● FLAGSHIP DIVISION ACTIVE
              </span>
              <span className="text-[8px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 border border-emerald-500/20 rounded font-black tracking-widest uppercase">
                100% ONLINE
              </span>
            </div>

            <div 
              onClick={() => handleSetCategory('auto')}
              className="flex-1 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-[#38BDF8]/20 rounded-[32px] p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#38BDF8]/60 hover:shadow-2xl hover:shadow-[#38BDF8]/15 hover:-translate-y-1 active:scale-[0.99] cursor-pointer group select-none relative overflow-hidden min-h-[480px]"
            >
              {/* Premium Background Grid overlay inside the live card */}
              <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_0.6px,transparent_0.6px)] [background-size:12px_12px] opacity-10"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-orange-500 font-black tracking-widest uppercase bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                    SECTOR 01 • ACTIVE PORTAL
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#38BDF8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>1,452 Active Bidders</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <img 
                    src="/auto_choice_logo_1781509565476.jpg" 
                    className="w-16 h-16 rounded-2xl object-cover border border-[#22d55e]/20 shadow-2xl transition-transform duration-300 group-hover:scale-105" 
                    alt="Auto Choice Flagship"
                  />
                  <div>
                    <h2 className="text-2xl font-black font-sans text-white uppercase tracking-tight">Auto Choice</h2>
                    <p className="text-[#38BDF8] font-mono text-[10px] font-black tracking-widest uppercase mt-0.5">Automotive division</p>
                  </div>
                </div>

                <p className="text-gray-300/90 text-xs leading-relaxed font-sans">
                  Experience Pakistan's elite digitized automotive platform. Browse certified SUVs, premium electric sedans, and high-performance imports with live valuation matrices, secure direct trade options, and instant physical spot-inspection alignments.
                </p>

                {/* Vehicle vector silhouette */}
                <div className="py-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-full h-16 text-sky-400/25 group-hover:text-[#38BDF8]/45 transition-colors" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 28 C 10 24, 25 24, 30 18 L 45 10 C 50 8, 70 8, 75 14 L 90 20 C 105 20, 110 24, 110 28 Z" />
                    <circle cx="30" cy="28" r="5" fill="#030712" />
                    <circle cx="85" cy="28" r="5" fill="#030712" />
                    <path d="M5 28 L 115 28" strokeWidth="0.8" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-6 relative z-10 w-full">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase group-hover:text-[#38BDF8] transition-colors">
                  Tap to enter matrix
                </span>
                <div className="bg-orange-500 text-slate-950 rounded-xl px-5 py-3 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-950/20 group-hover:bg-orange-400 transition-all active:scale-[0.98]">
                  <span>Access Showroom</span>
                  <span className="text-base">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: DYNAMIC COMING SOON TEASER MODULE */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] uppercase font-black flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400 animate-pulse" /> TARGET EXPANSION PIPELINE
              </span>
              <span className="text-[8px] bg-sky-500/15 text-sky-400 font-mono px-2 py-0.5 border border-sky-500/20 rounded font-black tracking-widest uppercase animate-pulse">
                Initializing
              </span>
            </div>

            <div 
              className="flex-1 bg-white/5 backdrop-blur-md border border-[#38BDF8]/20 rounded-[32px] p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-950/20 min-h-[480px] relative overflow-hidden group select-none"
            >
              {/* Grid backdrop overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.6px,transparent_0.6px)] [background-size:12px_12px] opacity-[0.07]"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
              <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-[60px] opacity-10 bg-cyan-500"></div>

              <div className="space-y-5.5 relative z-10 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-cyan-400 font-black tracking-widest uppercase bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                    SECTORS 02 & 03 • RESERVED
                  </span>
                  
                  {/* Notify Me Toggle button with Pulse animated states */}
                  <button
                    onClick={() => setTeaserNotified(!teaserNotified)}
                    className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-center ${
                      teaserNotified 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse' 
                        : 'bg-white/5 text-gray-500 hover:text-white border-white/10'
                    }`}
                    title={teaserNotified ? "Alert Registration Active" : "Notify Me on Launch"}
                  >
                    <Bell size={14} className={teaserNotified ? "text-amber-400 shrink-0 animate-[swing_1s_ease-in-out_infinite]" : "text-gray-400 shrink-0"} />
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider ml-1.5 hidden sm:inline-block">
                      {teaserNotified ? "Notified" : "Notify Me"}
                    </span>
                  </button>
                </div>

                {/* Rotating Tagline Display with state validation & Live Loading Pulse Dot */}
                <div className="bg-[#050912]/85 border border-[#38BDF8]/20 rounded-2xl p-4.5 min-h-[84px] flex items-center gap-3.5 transition-all">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <p className="text-gray-200 text-xs md:text-[13px] font-bold leading-relaxed font-sans select-text">
                    {rotatingTagline || "Unlocking Next-Gen Trade. Premium Ecosystems Loading."}
                  </p>
                </div>

                {/* "Upcoming More Alot" Scalable Grid with Neon Placeholders */}
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-mono block font-black mb-2">
                    RESERVED SYSTEM NODES (UPCOMING ECOSYSTEMS)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🏢", label: "Next-Gen Architecture", color: "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5", desc: "Sustainable residential villas and premium masterplans." },
                      { icon: "🏥", label: "Premium Wellness", color: "border-purple-500/30 text-purple-400 hover:bg-purple-500/5", desc: "Digital diagnostics systems and healthcare partner routing." },
                      { icon: "⚡", label: "Smart Living", color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5", desc: "High precision automated appliances and power-indexing." },
                      { icon: "📦", label: "Logistics Hub", color: "border-orange-500/30 text-orange-400 hover:bg-orange-500/5", desc: "Secure commercial vehicle routing and freight syncing." }
                    ].map((badge, idx) => (
                      <div 
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setComingSoonSector({
                            title: badge.label,
                            tagline: badge.desc,
                            desc: `A highly anticipated digital pipeline designed to integrate verified trade catalog architectures into our high-speed trade sandbox. Currently mapping local supply metrics.`,
                            icon: badge.icon,
                            spec: `Seeding community consensus indices. Access protocols scheduled under Phase II/III roadmap updates.`
                          });
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border ${badge.color} hover:border-[#38BDF8]/40 transition-all duration-200 cursor-pointer text-left`}
                      >
                        <span className="text-base shrink-0">{badge.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono font-black uppercase tracking-tight text-white truncate">{badge.label}</p>
                          <span className="text-[8px] text-gray-400 block leading-none font-mono font-bold mt-0.5">Pending Seeding</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Voting Footer interaction area */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4 relative z-10 w-full text-left">
                
                <div className="shrink-0">
                  <p className="text-[10px] uppercase font-mono font-extrabold text-gray-500 tracking-wider">
                    Community Interest Weight
                  </p>
                  <p className="text-sm font-mono font-black text-white mt-0.5">
                    🗳️ <span className="text-cyan-400 animate-pulse">{teaserVotes.toLocaleString()}</span> Verified Votes
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (userTeaserVoted) {
                      setTeaserVotes(prev => prev - 1);
                      setUserTeaserVoted(false);
                    } else {
                      setTeaserVotes(prev => prev + 1);
                      setUserTeaserVoted(true);
                    }
                  }}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-widest text-center transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${
                    userTeaserVoted
                      ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-950/45'
                      : 'bg-transparent text-[#38BDF8] border border-[#38BDF8]/40 hover:border-[#38BDF8] hover:bg-[#38BDF8]/10 shadow-lg'
                  }`}
                >
                  {userTeaserVoted ? "✓ Voted to Unlock" : "Vote to Unlock First"}
                </button>

              </div>
            </div>
          </div>

        </div>

        {/* Floating Custom Overlay Modal for Expansion Details */}
        {comingSoonSector && (
          <div className="fixed inset-0 bg-[#02050e]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
            <div className="bg-[#0c1322] border border-[#38BDF8]/30 max-w-lg w-full rounded-3xl p-6.5 space-y-4 shadow-2xl relative">
              <button 
                onClick={() => setComingSoonSector(null)} 
                className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="text-3xl bg-[#38BDF8]/10 p-3 rounded-2xl border border-[#38BDF8]/20">{comingSoonSector.icon}</div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">{comingSoonSector.title}</h3>
                  <p className="text-[#38BDF8] font-mono text-[10px] font-black uppercase tracking-widest">Active Development Channel</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-[#050912] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono block font-black mb-1">Target Mission Statement:</span>
                  <p className="text-white font-sans font-bold text-xs">{comingSoonSector.tagline}</p>
                </div>

                <div className="bg-[#050912] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#38BDF8] font-mono block font-black mb-1">Functional Outline:</span>
                  <p className="text-gray-300 text-xs font-sans leading-relaxed">{comingSoonSector.desc}</p>
                </div>

                <div className="bg-[#12221b]/40 border border-[#22c55e]/20 p-3 rounded-xl text-[10px] text-green-400 font-mono">
                  🚀 {comingSoonSector.spec}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button 
                  onClick={() => setComingSoonSector(null)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 font-mono font-black py-3 px-6 rounded-xl w-full text-xs uppercase hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] duration-100 cursor-pointer shadow-lg"
                >
                  Confirm Understanding & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-[10px] uppercase font-mono tracking-widest pb-[env(safe-area-inset-bottom)] md:pb-2 relative z-10">
          BAZAR360 Pakistan Enterprise &copy; 2026. SECURED THROUGH ADVANCED LOCAL BLUEPRINT.
        </div>
      </div>
    );
  }

  if (currentCategory === 'footwear') {
    return (
      <div className="bg-[#030712] text-white min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Header */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/5 pb-4 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👟</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase">BAZAR360 FOOTWEAR</h1>
              <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">Premium Footwear Vault</p>
            </div>
          </div>
          <button
            onClick={() => handleSetCategory('gateway')}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
          >
            ← Return to Gateway
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-6 relative z-10">
          <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 uppercase tracking-widest">
            Horizontal Footwear sector (Demo Channel)
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-white uppercase tracking-tight">
            Premium Leather Craftsmanship & Athletic Vault
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            You are currently viewing the horizontal Footwear storefront. BAZAR360 dynamically builds tailored indices for each trade tenant.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👞</span>
              <h3 className="font-bold text-white uppercase">Prestige Peshawari</h3>
              <p className="text-xs text-gray-400 font-sans">Hand-stitched premium Charsadda calf leather with dual-density high-grip rubber soles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 8,500</div>
            </div>
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">👟</span>
              <h3 className="font-bold text-white uppercase">Apex Wave Runners</h3>
              <p className="text-xs text-gray-400 font-sans">Breathable PrimeKnit mesh with high energy return reactive shock absorber midsoles.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 14,800</div>
            </div>
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-amber-500/25 duration-150">
              <span className="text-2xl">🥾</span>
              <h3 className="font-bold text-white uppercase">K2 Tactical Boots</h3>
              <p className="text-xs text-gray-400 font-sans">All-weather waterproof canvas with reinforced alloy toe caps for hardcore trekking.</p>
              <div className="text-amber-400 font-mono font-bold text-sm">Rs. 19,500</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-[10px] uppercase font-mono tracking-widest pt-8 relative z-10">
          BAZAR360 trade networks. All mock components verified on core.
        </div>
      </div>
    );
  }

  if (currentCategory === 'food') {
    return (
      <div className="bg-[#030712] text-white min-h-screen text-sm font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_1px,transparent_1px] pointer-events-none"></div>

        {/* Header */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/5 pb-4 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥦</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase">BAZAR360 FOOD</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Organic Fresh Food Mesh</p>
            </div>
          </div>
          <button
            onClick={() => handleSetCategory('gateway')}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 duration-100 rounded-xl text-xs uppercase cursor-pointer"
          >
            ← Return to Gateway
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-6 relative z-10">
          <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
            Horizontal Food sector (Demo Channel)
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-white uppercase tracking-tight">
            Direct Farm Access & Wholesale Consumables Grid
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            You are currently viewing the horizontal Food storefront. BAZAR360 dynamically builds tailored indices for each trade tenant.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-yellow-400">🍯</span>
              <h3 className="font-bold text-white uppercase">Organic Hunza Honey</h3>
              <p className="text-xs text-gray-400 font-sans">100% natural, unfiltered wild honey gathered directly from highland Hunza blossoms.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 3,200</div>
            </div>
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-amber-500">🌾</span>
              <h3 className="font-bold text-white uppercase">Premium Super Basmati</h3>
              <p className="text-xs text-gray-400 font-sans">5kg of aged super-kernel premium basmati rice, famed for non-sticky extra-long grains.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 1,950</div>
            </div>
            <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-3 shadow-xl hover:border-emerald-500/25 duration-150">
              <span className="text-2xl text-orange-400">🍊</span>
              <h3 className="font-bold text-white uppercase">Sargodha Citrus Crates</h3>
              <p className="text-xs text-gray-400 font-sans">Juicy hand-picked Sargodha Kinnu oranges delivered fresh in protected aeration crates.</p>
              <div className="text-emerald-400 font-mono font-bold text-sm">Rs. 850</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-[10px] uppercase font-mono tracking-widest pt-8 relative z-10">
          BAZAR360 trade networks. All mock components verified on core.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b121f] text-white min-h-screen text-sm font-sans flex flex-col pb-24 md:pb-8">
      
      {/* 🚀 FAST LIVE ENGINE TICKER MARQUEE */}
      {currentCategory === 'auto' && (
        <div className="fixed top-0 left-0 w-full h-8 bg-[#040812] border-b border-orange-500/10 z-50 flex items-center overflow-hidden select-none">
          <div className="absolute left-0 top-0 h-full bg-[#121c32] px-3.5 flex items-center gap-1.5 border-r border-[#38BDF8]/20 z-15 shadow-[10px_0_15px_rgba(0,0,0,0.8)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest font-mono">LIVE PRICES</span>
          </div>
          <div className="w-full pl-28 overflow-hidden relative">
            <div className="animate-fast-ticker flex items-center whitespace-nowrap gap-12 font-mono text-[9px] text-[#38BDF8]/90 font-bold tracking-tight uppercase">
              <span>🔥 SUZUKI ALTO VXR: Rs. 2,330,000 (LAC 23.3)</span>
              <span>⚡ BYD SEAL PREMIUM EV: Rs. 14,500,000 (LAC 145)</span>
              <span>🚀 TOYOTA FORTUNER LEGENDER: Rs. 18,500,000 (LAC 185)</span>
              <span>🔥 HONDA CIVIC RS TURBO: Rs. 9,800,000 (LAC 98)</span>
              <span>💥 CHANGAN OSHAN X7: Rs. 8,200,000 (LAC 82)</span>
              <span>⭐ MG HS ESSENCE SUV: Rs. 8,100,000 (LAC 81)</span>
              <span>🔥 TOYOTA COROLLA ALTIS GRANDE: Rs. 7,800,000 (LAC 78)</span>
              <span>⚡ DEEPAL S07 EV PREMIUM: Rs. 10,500,000 (LAC 105)</span>
              <span>⭐ KIA SPORTAGE AWD: Rs. 8,900,000 (LAC 89)</span>
              
              {/* Mirror values to ensure seamless loop */}
              <span>🔥 SUZUKI ALTO VXR: Rs. 2,330,000 (LAC 23.3)</span>
              <span>⚡ BYD SEAL PREMIUM EV: Rs. 14,500,000 (LAC 145)</span>
              <span>🚀 TOYOTA FORTUNER LEGENDER: Rs. 18,500,000 (LAC 185)</span>
              <span>🔥 HONDA CIVIC RS TURBO: Rs. 9,800,000 (LAC 98)</span>
              <span>💥 CHANGAN OSHAN X7: Rs. 8,200,000 (LAC 82)</span>
              <span>⭐ MG HS ESSENCE SUV: Rs. 8,100,000 (LAC 81)</span>
              <span>🔥 TOYOTA COROLLA ALTIS GRANDE: Rs. 7,800,000 (LAC 78)</span>
              <span>⚡ DEEPAL S07 EV PREMIUM: Rs. 10,500,000 (LAC 105)</span>
              <span>⭐ KIA SPORTAGE AWD: Rs. 8,900,000 (LAC 89)</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Top Navigation */}
      <TopAppBar
        currentTab={currentTab}
        setTab={setTab}
        onPostAdClick={() => setTab('sell')}
        currentUser={currentUser}
        onLogout={handleLogout}
        onBackToGateway={() => handleSetCategory('gateway')}
        isWithTicker={currentCategory === 'auto'}
      />

      {/* Super-Admin Multi-Role Gateway (Exclusive email interception) */}
      {currentUser?.email === 'amjid.bisconni@gmail.com' && (
        <div className={`bg-[#050b16] border-b-2 border-orange-500/80 px-5 py-3 sticky ${currentCategory === 'auto' ? 'top-24' : 'top-14'} z-40 shadow-xl shadow-black/40 transition-all`}>
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <div>
                <span className="text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider font-mono block">Multi-Role Gateway Intercept</span>
                <span className="text-xs text-white/90">Switch active session for owner <span className="font-black text-orange-400">amjid.bisconni@gmail.com</span>:</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRoleSwap('Admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-mono border transition-all cursor-pointer select-none ${
                  currentUser.role === 'Admin'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-[#121a2a] text-gray-400 border-white/5 hover:border-orange-500/35 hover:text-white'
                }`}
              >
                🛠 Super Admin
              </button>
              <button
                onClick={() => handleRoleSwap('Showroom Owner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-mono border transition-all cursor-pointer select-none ${
                  currentUser.role === 'Showroom Owner'
                    ? 'bg-[#38BDF8] text-black border-[#38BDF8] shadow-md shadow-[#38BDF8]/20'
                    : 'bg-[#121a2a] text-gray-400 border-white/5 hover:border-[#38BDF8]/35 hover:text-white'
                }`}
              >
                🏬 Dealer (Auto Choice)
              </button>
              <button
                onClick={() => handleRoleSwap('Private Seller')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider font-mono border transition-all cursor-pointer select-none ${
                  currentUser.role === 'Private Seller'
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-[#121a2a] text-gray-400 border-white/5 hover:border-emerald-500/35 hover:text-white'
                }`}
              >
                📣 Ad Poster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Core Shell */}
      <main className={`flex-grow max-w-[1440px] mx-auto w-full px-5 md:px-16 transition-all ${currentCategory === 'auto' ? 'pt-28' : 'pt-20'}`}>
        
        {activeIndustry !== 'Automotive' && (
          <div className="mb-6 bg-slate-950/90 backdrop-blur-md border border-[#38BDF8]/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-fade shadow-xl">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 uppercase tracking-widest">
                Dynamic Multi-Tenant Partition Activated
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                🛍️ BAZAR360 {activeIndustry} Showcase Channel (Demo Sandbox)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                You are currently viewing the horizontal {activeIndustry} expansion sector. BAZAR360 dynamically adapts its interface parameters, catalog filters, and pricing indices for this domain. The core system remains verified on 'Auto Choice'.
              </p>
            </div>
            <button
              onClick={() => setActiveIndustry('Automotive')}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 duration-150 text-slate-950 font-mono font-black text-[10px] uppercase py-2.5 px-4.5 rounded-xl block shrink-0 tracking-widest cursor-pointer"
            >
              Reset to Auto Choice
            </button>
          </div>
        )}

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
            {/* Show Moderation Dashboard to Admins or Showroom Owners on home page */}
            {currentTab === 'home' && (currentUser?.role === 'Admin' || currentUser?.role === 'Showroom Owner') && (
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
                listings={prioritizedListings}
                setTab={setTab}
                setSelectedCategory={setSelectedCategory}
                setSearchQuery={setSearchQuery}
                onSelectDealer={onSelectDealer}
                onSelectListing={setSelectedListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                currentCategory={currentCategory}
              />
            )}

            {(currentTab === 'inventory' || currentTab === 'search') && (
              <SearchExplorerView
                listings={prioritizedListings}
                dealers={dealers}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectListing={setSelectedListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
              />
            )}

            {currentTab === 'media' && (
              <MediaFeedView
                dealers={dealers}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'insights' && (
              <MarketInsightsView />
            )}

            {currentTab === 'concierge' && (
              <ConciergeView
                dealers={dealers}
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
                listings={prioritizedListings}
                reviews={reviewsMap[selectedDealerId] || []}
                onAddReview={handleAddReview}
                onSelectListing={setSelectedListing}
                onPublishActivity={handlePublishActivity}
                onApproveActivity={handleApproveActivity}
                currentUser={currentUser}
                onAddListing={handleAddListing}
              />
            )}

            {currentTab === 'sell' && (
              <SellWithAIView
                onAddListing={handleAddListing}
                setTab={setTab}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'portal' && (
              <div className="max-w-4xl mx-auto space-y-8 pb-16">
                <div className="border-b border-[#1e293b] pb-3">
                  <h2 className="font-sans font-bold text-xl md:text-2xl text-[#38bdf8] uppercase tracking-tight">BAZAR360 Portal & Forms</h2>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[#0b121f] border border-[#1e293b] rounded-2xl max-w-3xl w-full text-xs font-sans shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-scale-fade">
            
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
                      {renderPrice(selectedListing.price)}
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#1e293b] pb-1.5">Executive Presentation Description</h4>
                    <p className="text-gray-300 text-xs leading-relaxed font-sans pr-4">{selectedListing.description}</p>
                  </div>

                  {/* Adaptive deep-linking share block */}
                  <div className="bg-[#121a2a] border border-[#1e293b] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 font-mono">
                    <div className="text-left space-y-0.5">
                      <span className="text-[9.5px] uppercase font-black tracking-widest text-[#00a3ff] block">Adaptive Social Sharing</span>
                      <span className="text-[8px] text-gray-400 font-sans block">Share certified specifications directly</span>
                    </div>
                    <button
                      onClick={async () => {
                        const d = dealers.find((dl) => dl.id === selectedListing.dealerId);
                        const locationText = d?.location || "Alamas Car Village, Ring Road, Peshawar";
                        const shareUrl = `https://bazar360.pk/dealers/${selectedListing.dealerId}/listings/${selectedListing.id}`;
                        const shareTitle = selectedListing.title;
                        const sharePrice = `Rs. ${selectedListing.price.toLocaleString()}`;
                        const textPayload = `🏎️ Premium Sport Entry: *${shareTitle}*\n💰 Demand Price: *${sharePrice}*\n📌 Location Coordinates: *${locationText}*\n\nExplore complete high-resolution specifications and place custom bids directly on the digital showroom gateway here:\n🔗 ${shareUrl}`;

                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: shareTitle,
                              text: textPayload,
                              url: shareUrl
                            });
                          } catch (err) {
                            // ignore
                          }
                        } else {
                          const encodedText = encodeURIComponent(textPayload);
                          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                        }
                      }}
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-100 cursor-pointer shadow"
                    >
                      <span className="material-symbols-outlined text-[14px]">share</span> Share Spec Sheet
                    </button>
                  </div>
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

      {/* STICKY VEHICLE COMPARISON DRAWER BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-22 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[500px] bg-[#0c1221]/95 text-white border border-[#38BDF8]/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-[#38BDF8] text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-lg">
              {compareList.length}/2 MATCH
            </span>
            <div className="flex -space-x-2">
              {compareList.map((car) => (
                <div key={car.id} className="relative group">
                  <img
                    src={car.imageUrl}
                    alt={car.title}
                    className="w-8 h-8 rounded-full border border-[#0c1221] object-cover"
                  />
                  <button 
                    onClick={() => handleToggleCompare(car)}
                    className="absolute -top-1 -right-1 bg-red-500 p-0.5 rounded-full text-[6px] hover:bg-red-600 border border-[#0c1221] w-3.5 h-3.5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-sans hidden sm:block">Queue set for side-by-side comparison</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareList([])}
              className="text-[10px] text-gray-400 hover:text-white uppercase font-mono font-bold tracking-wider px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black font-mono text-[9px] uppercase px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-950/20 tracking-wider active:scale-95 cursor-pointer"
            >
              Compare Matchup &rarr;
            </button>
          </div>
        </div>
      )}

      {/* DUAL COMPARISON DRAWER SPECIFICATIONS TABLE MODAL */}
      {showComparisonModal && compareList.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[#0b121f] border border-[#1e293b] rounded-3xl max-w-3xl w-full text-xs font-sans shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-scale-fade">
            
            <div className="bg-[#121a2a] p-4 border-b border-[#1e293b] flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-sans font-black text-white text-sm uppercase tracking-tight">BAZAR360 Dynamic Comparison Deck</h3>
                <p className="text-[9px] text-gray-400 font-mono tracking-wider mt-0.5">Dual car matchup analyzer with active spec matching.</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-gray-400 hover:text-white bg-[#1e293b] p-1.5 rounded-xl border border-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* Product Comparison Header Grid */}
              <div className="grid grid-cols-2 gap-4">
                {compareList.map((car) => (
                  <div key={car.id} className="bg-[#121a2a] p-3 rounded-2xl border border-white/5 space-y-3 relative">
                    <img 
                      src={car.imageUrl} 
                      alt={car.title} 
                      className="w-full h-32 md:h-44 object-cover rounded-xl"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono tracking-widest text-[#38BDF8] font-bold uppercase">{car.make}</span>
                      <h4 className="font-extrabold text-[#F97316] text-xs uppercase truncate leading-none">{car.title}</h4>
                      <p className="font-mono text-white text-[13px] font-black mt-1">{renderPrice(car.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs Table Matrix */}
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#070c12]">
                {[
                  { label: "Production Year", key: "year" },
                  { label: "Brand Make", key: "make" },
                  { label: "Model Variant", key: "model" },
                  { label: "Mileage (km)", key: "mileage", format: (v: number) => `${v.toLocaleString()} km` },
                  { label: "Fuel Category", key: "fuelType" },
                  { label: "Transmission Line", key: "transmission" }
                ].map((spec) => {
                  return (
                    <div key={spec.label} className="grid grid-cols-3 border-b border-white/5 last:border-0 p-3 leading-relaxed">
                      <span className="text-gray-400 font-mono text-[9px] uppercase font-bold flex items-center">{spec.label}</span>
                      {compareList.map((car) => {
                        const rawVal = (car as any)[spec.key];
                        // Zero-Dummy-Data Guard: Avoid empty blanks
                        const valString = rawVal !== undefined && rawVal !== null && rawVal !== "" ? (spec.format ? spec.format(rawVal) : String(rawVal)) : "Not Listed";
                        return (
                          <span key={car.id} className="text-white font-sans text-xs flex items-center pr-2">
                            {valString}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Unique Ecosystem Service Badges comparison */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Showroom Certifications Matchup</p>
                <div className="grid grid-cols-2 gap-4">
                  {compareList.map((car) => (
                    <div key={car.id} className="p-3 bg-[#111928] rounded-xl border border-white/5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-[10px] text-white block uppercase font-mono">Verifier Status</span>
                        <div className="flex items-center gap-1 text-xs text-white/70">
                          {car.verified ? (
                            <span className="text-emerald-400 font-bold font-mono">✓ VETTED</span>
                          ) : (
                            <span className="text-orange-400 font-mono">PENDING DESK</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Share Overlay Section */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button
                  onClick={async () => {
                    const text = `Take a look at this digital car comparison matchup on BAZAR360:\n\n${compareList.map(c => `🏎️ ${c.title} (Rs. ${c.price.toLocaleString()})`).join('\n')}\n\nAnalyze specs side-by-side!`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'BAZAR360 Dynamic Matchup',
                          text: text,
                          url: window.location.href
                        });
                      } catch (e) {
                        // ignore
                      }
                    } else {
                      await navigator.clipboard.writeText(text);
                      const t = document.getElementById("compare_share_status");
                      if (t) {
                        t.innerText = "✓ Copy-loaded! Ready to paste into WhatsApp / Viber.";
                        setTimeout(() => {
                          t.innerText = "";
                        }, 5000);
                      }
                    }
                  }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  📣 Adaptive Share Matchup (Native / WhatsApp fallback)
                </button>
                <p id="compare_share_status" className="text-center font-mono text-[10px] text-[#38BDF8] font-bold"></p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
