import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Gauge, Fuel, Milestone, Star, Award, DollarSign, Send, Hourglass, Bell, Sparkles, Car } from 'lucide-react';
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
  seedDatabaseIfEmpty,
  dbSaveSuggestion,
  dbTrackLeadAction
} from './lib/dbService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCurrencyMode } from './lib/currency';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import ThemeEngine from './components/ThemeEngine';

import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import DealerStorefrontView from './components/DealerStorefrontView';
import SearchExplorerView from './components/SearchExplorerView';
import RegistrationPortal from './components/RegistrationPortal';
import DetailedVehiclePostingPage from './components/DetailedVehiclePostingPage';
import AdminModerationDeck from './components/AdminModerationDeck';
import AutoServicesView from './components/AutoServicesView';
import ContactView from './components/ContactView';
import { motion } from 'motion/react';
import { initializeVisitorTracking, trackSearchQuery, trackVehicleView } from './lib/visitorTracking';

const METRIC_TABS_DATA = {
  Design: [
    { label: "Aerodynamic Drag Coefficient", value: "0.24 Cd" },
    { label: "Chassis Composition", value: "High-Tensile Carbon-Infused Steel Ring" },
    { label: "Ground Physics", value: "Underbody Ground-Effect Venturi Tunnels" }
  ],
  Safety: [
    { label: "ADAS Autonomous Level", value: "Level 2+ Lidar lane-keep" },
    { label: "Structural anchors", value: "Isofix rigid alloy bindings" },
    { label: "Collision Mitigation", value: "Dynamic automated front & rear braking" }
  ],
  Luxury: [
    { label: "Acoustic Insulation", value: "Triple-pane laminated quiet-glass" },
    { label: "Climate Diffuser", value: "Ionized active forest breezer module" },
    { label: "Showroom Audio Setup", value: "Burmester 3D Surround sound structure" }
  ],
  Performance: [
    { label: "0-100 Speed Sprint", value: "3.8 seconds" },
    { label: "Torque Vectoring", value: "Dual-motor active traction differential" },
    { label: "Gearbox Synchro Ratio", value: "8-speed twin-clutch direct-shift" }
  ]
};

const HOTSPOTS_LIST = [
  { id: 'engine', name: 'Piston block & Engine layout', text: 'Dual overhead cam 24-valve configuration optimized for PKR fuel gradients.', x: '25%', y: '45%' },
  { id: 'suspension', name: 'Suspension compression ratio', text: 'Adaptive pneumatic damping ring with dynamic rebound control on broken roads.', x: '65%', y: '55%' },
  { id: 'exhaust', name: 'Exhaust airflow channel', text: 'Quad low-back-pressure active exhaust ports with carbon acoustic resonators.', x: '88%', y: '65%' },
];

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ShowroomProfile from './pages/ShowroomProfile';

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <ThemeEngine />
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dealers/:showroomSlug" element={<App />} />
          <Route path="/dealers/:showroomSlug/listings/:listingId" element={<App />} />
          <Route path="/showroom/:showroomSlug" element={<ShowroomProfile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  const { renderPrice } = useCurrencyMode();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Bilingual support state with automatic browser detection
  const [lang, setLang] = useState<'en' | 'ur'>(() => {
    try {
      const savedLang = localStorage.getItem('bazar360_lang');
      if (savedLang === 'en' || savedLang === 'ur') {
        return savedLang;
      }
      // Check system/browser language
      const browserLang = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';
      if (browserLang.startsWith('ur')) {
        return 'ur';
      }
    } catch (e) {
      console.warn('Locale storage access restricted, reverting to default English locale.');
    }
    return 'en';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('bazar360_lang', nextLang);
    } catch (e) {}
  };

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem('bazar360_install_dismissed') === 'true';
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Installation outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem('bazar360_install_dismissed', 'true');
    setShowInstallBanner(false);
  };

  const [currentTab, setTab] = useState<string>('home');
  const [showroomSearch, setShowroomSearch] = useState<string>('');
  const [selectedDealerId, setSelectedDealerId] = useState<string>('auto-choice-peshawar');
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'Design' | 'Safety' | 'Luxury' | 'Performance'>('Design');
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<CarListing[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [activeIndustry, setActiveIndustry] = useState<'Automotive' | 'Footwear' | 'Apparel' | 'Electronics'>('Automotive');
  const [currentCategory, setCurrentCategory] = useState<'gateway' | 'auto' | 'footwear' | 'food'>('auto');
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
    try { localStorage.setItem('bazar360_votes', JSON.stringify(votes)); } catch (e) { /* ignore */ }
  }, [votes]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_user_voted', JSON.stringify(userVoted)); } catch (e) { /* ignore */ }
  }, [userVoted]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_notifications', JSON.stringify(notifications)); } catch (e) { /* ignore */ }
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_teaser_votes', teaserVotes.toString()); } catch (e) { /* ignore */ }
  }, [teaserVotes]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_user_teaser_voted', userTeaserVoted ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }, [userTeaserVoted]);

  useEffect(() => {
    try { localStorage.setItem('bazar360_teaser_notified', teaserNotified ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }, [teaserNotified]);

  // Dynamic Tagline Rotation Logic with Variant Titles & Sub-Taglines
  const [activeTaglineVariant, setActiveTaglineVariant] = useState<{title: string, sub: string}>({
    title: "COMING SOON: A LOT MORE",
    sub: "We are expanding from elite cars to everything you need. A complete mega marketplace is just around the corner."
  });
  // Suggestion Engine States
  const [suggestionText, setSuggestionText] = useState<string>('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState<boolean>(false);
  const [suggestionMessage, setSuggestionMessage] = useState<{ text: string, isError: boolean } | null>(null);

  const handleOnSubmitSuggestion = async () => {
    if (!suggestionText.trim()) return;
    setIsSubmittingSuggestion(true);
    setSuggestionMessage(null);
    try {
      const suggestionId = 'sug-' + Math.random().toString(36).substring(2, 11);
      const userId = auth.currentUser?.uid || null;
      await dbSaveSuggestion({
        id: suggestionId,
        user_id: userId,
        suggestion_text: suggestionText.trim(),
        submitted_at: new Date().toISOString()
      });
      setSuggestionText('');
      setSuggestionMessage({ text: 'Thank you! Your marketplace suggestion has been logged.', isError: false });
    } catch (e: any) {
      console.error(e);
      setSuggestionMessage({ text: 'Failed to submit suggestion. Please try again.', isError: true });
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  useEffect(() => {
    const variants = [
      {
        title: "COMING SOON: A LOT MORE",
        sub: "We are expanding from elite cars to everything you need. A complete mega marketplace is just around the corner."
      },
      {
        title: "THE ULTIMATE MEGA BAZAR",
        sub: "Moving fast beyond vehicles. Get ready to browse retail, wholesale, and daily essentials all under one roof."
      },
      {
        title: "FUTURE SECTORS UNLOCKING",
        sub: "Your favorite stores are moving digital. Vote for your favorite category below to speed up the launch."
      }
    ];
    // Select exactly one variant tagline object upon page load/visit
    const randomIndex = Math.floor(Math.random() * variants.length);
    setActiveTaglineVariant(variants[randomIndex]);
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

  const handleSelectListing = (car: CarListing) => {
    setSelectedListing(car);
  };

  // Dynamic States
  const [listings, setListings] = useState<CarListing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Bidirectional SPA Routing and browser history synchronization engine
  useEffect(() => {
    // 1. Compute target pathname based on current state variables
    let targetPath = '/';
    if (selectedListing) {
      targetPath = `/dealers/${selectedListing.dealerId || 'private'}/listings/${selectedListing.id}`;
    } else if (currentTab === 'dealer-storefront' && selectedDealerId) {
      targetPath = `/dealers/${selectedDealerId}`;
    } else if (currentTab !== 'home') {
      targetPath = `/${currentTab}`;
    }

    // 2. Reflect state changes in browser URL bar if needed
    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState(null, '', targetPath);
      } catch (e) {
        // Suppress security block warnings inside restricted sandbox contexts
        console.warn('Navigation state sync bypassed due to sandbox restrictions:', e);
      }
    }
  }, [currentTab, selectedDealerId, selectedListing]);

  useEffect(() => {
    // 3. Handle back/forward buttons (popstate event) or direct links and match state to URL
    const parseUrl = () => {
      const path = window.location.pathname;
      const activeListings = listings.length > 0 ? listings : INITIAL_LISTINGS;
      
      if (path === '/' || path === '') {
        setTab('home');
        setSelectedListing(null);
      } else if (path.startsWith('/dealers/')) {
        const segments = path.split('/').filter(Boolean);
        const dId = segments[1];
        if (dId) {
          if (segments[2] === 'listings' && segments[3]) {
            const lId = segments[3];
            const found = activeListings.find(l => l.id === lId);
            if (found) {
              setSelectedListing(found);
              setSelectedDealerId(dId);
            } else {
              setSelectedDealerId(dId);
              setTab('dealer-storefront');
              setSelectedListing(null);
            }
          } else {
            setSelectedDealerId(dId);
            setTab('dealer-storefront');
            setSelectedListing(null);
          }
        }
      } else {
        const tName = path.slice(1);
        const validTabs = ['inventory', 'media', 'insights', 'concierge', 'dealers', 'sell', 'portal', 'search'];
        if (validTabs.includes(tName)) {
          setTab(tName);
          setSelectedListing(null);
        }
      }
    };

    window.addEventListener('popstate', parseUrl);
    
    // Parse on initial load or transition when database listings/dealers populate
    parseUrl();

    return () => window.removeEventListener('popstate', parseUrl);
  }, [listings, dealers]);

  // Active Session User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    let saved = null;
    try { saved = localStorage.getItem('bazar360_user'); } catch (e) { /* ignore */ }
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

  // Automated Visitor clickstream tracking for vehicle views
  useEffect(() => {
    if (selectedListing) {
      trackVehicleView(selectedListing.id).catch(err => console.warn('Vehicle view track bypass:', err));
    }
  }, [selectedListing]);

  // Automated Visitor debounced clickstream tracking for search keywords
  useEffect(() => {
    if (searchQuery.trim().length > 3) {
      const timer = setTimeout(() => {
        trackSearchQuery(searchQuery.trim()).catch(err => console.warn('Search query track bypass:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Bid interaction state inside Detail modal
  const [offerInput, setOfferInput] = useState('');
  const [offerSuccessMessage, setOfferSuccessMessage] = useState('');

  // Sync session profile to standard storage
  useEffect(() => {
    if (currentUser) {
      try { localStorage.setItem('bazar360_user', JSON.stringify(currentUser)); } catch (e) { /* ignore */ }
      // Save profile to database
      dbSaveUserProfile(currentUser).catch(err => console.warn('Bypass profile save:', err));
    } else {
      try { localStorage.removeItem('bazar360_user'); } catch (e) { /* ignore */ }
    }
  }, [currentUser]);

  // Initial Sync and Seed workflow
  useEffect(() => {
    async function initDatabase() {
      setDbLoading(true);
      
      // Fast connection race-timer to guarantee instant rendering even if connection is firewalled or slow
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout - loading high speed local layout')), 2500)
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
    initDatabase().then(() => {
      initializeVisitorTracking().catch(err => console.warn('Visitor tracking engine bypass:', err));
    });
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
    try { localStorage.removeItem('bazar360_user'); } catch (e) { /* ignore */ }
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

    // Save persistent Bargain Bid in real-time to Firestore database
    import('./lib/dbService').then(({ dbSaveBargain }) => {
      if (selectedListing) {
        dbSaveBargain({
          id: `offer-${Date.now()}`,
          listingId: selectedListing.id,
          vehicleTitle: selectedListing.title,
          bidAmount,
          buyerName: currentUser?.displayName || 'Guest Bargain Bidder',
          buyerPhone: currentUser?.phoneNumber || '+92 314 3601212',
          buyerEmail: currentUser?.email || 'prospect.buyer@bazar360.online',
          dealerId: selectedListing.dealerId || 'private',
          status: 'Pending',
          createdAt: new Date().toISOString()
        });
      }
    });

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
      <div className="bg-[#0B0F19] text-[#E2E8F0] min-h-screen text-sm font-sans flex flex-col justify-start py-6 px-4 md:px-8 relative overflow-y-auto select-none">
        {/* Subtle, Sophisticated Background Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none opacity-85"></div>

        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}
        <header className="w-full flex items-center justify-between py-3 border-b border-white/5 relative z-20 mb-3 max-w-7xl mx-auto shrink-0">
          {/* Core Branding */}
          <div className="flex items-center space-x-3 cursor-pointer select-none">
            <svg className="w-11 h-11 select-none flex-shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Top dark blue/white arching bracket/arrow */}
              <path d="M 45 70 C 45 32, 135 32, 135 70" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" fill="none" className="stroke-[#00E5FF]" />
              {/* 2 white rivets on the left of upper arc */}
              <circle cx="62" cy="54" r="3.5" fill="#FFFFFF" />
              {/* Bottom orange arrow arc */}
              <path d="M 35 105 C 40 152, 128 152, 142 118" stroke="#F97316" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Arrow head for orange arc */}
              <path d="M 132 112 L 148 112 L 144 126 Z" fill="#F97316" stroke="#F97316" strokeWidth="3" strokeLinejoin="round" />

              {/* Number 360 in emblem */}
              <text x="32" y="112" fill="#FFFFFF" className="font-sans font-black" fontSize="64" letterSpacing="-4">360</text>

              {/* Orange filled circle with shopping cart icon */}
              <circle cx="132" cy="90" r="24" fill="url(#orangeLogoGradApp)" />
              {/* White shopping cart path */}
              <path d="M 118 80 L 122 80 L 126 94 L 140 94 L 144 84 L 124 84" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="127" cy="101" r="3" fill="#FFFFFF" />
              <circle cx="139" cy="101" r="3" fill="#FFFFFF" />

              <defs>
                <linearGradient id="orangeLogoGradApp" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black text-white tracking-wider leading-none">BAZAR<span className="text-orange-500 font-extrabold">360</span><span className="text-xs font-black text-[#38BDF8] ml-0.5 lowercase">.online</span></span>
              <span className="text-[7.5px] font-bold text-slate-400 tracking-[0.18em] uppercase pt-1 font-sans">
                BUY <span className="text-orange-500 font-black">|</span> SELL <span className="text-orange-500 font-black">|</span> CONNECT
              </span>
            </div>
          </div>

          {/* Primary Live Division Quick Access */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSetCategory('auto')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 rounded-xl text-xs font-mono font-black tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md shadow-orange-500/10 active:scale-[0.98]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>Auto Choice [Live]</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </header>

        {/* Hero Console (Redesigned with Premium Dark Pairings) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center mt-1 mb-4 space-y-2 relative z-10 max-w-2xl mx-auto shrink-0"
        >
          <span className="text-[9px] uppercase font-mono font-black tracking-[0.25em] text-[#38BDF8] bg-[#38BDF8]/10 px-3.5 py-1.5 rounded-full border border-sky-500/20 shadow-sm">
            ★ Pakistan’s Premier Automotive & Multi-Tenant Trade Network
          </span>
          <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-black tracking-tight text-white uppercase leading-tight md:leading-snug">
            Unified Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-orange-500">Ecosystem Gateway</span>
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xl">
            Seamless access to certified dealer inventories, direct buyer-seller chat routes, visitor intelligence models, and localized financial pipelines.
          </p>
        </motion.div>

        {/* Redesigned 2-Column Responsive Layout Grid (Polished Dark Slate Cards) */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch relative z-10 px-4 mb-6 animate-fade-in">
          
          {/* Column 1: FLAGSHIP AUTOMOTIVE SECTOR */}
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] uppercase font-black">
                ● FLAGSHIP DIVISION LIVE
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2.5 py-0.5 border border-emerald-500/20 rounded-md font-black tracking-widest uppercase">
                100% Verified
              </span>
            </div>

            <div 
              onClick={() => handleSetCategory('auto')}
              className="flex-1 bg-[#1E293B] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#38BDF8]/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer group select-none relative overflow-hidden"
            >
              {/* Decorative Subtle Overlay Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-orange-400 font-black tracking-widest uppercase bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
                    SECTOR 01 • ACTIVE MARKET
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#38BDF8] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1,452 Connected Sellers</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center border border-sky-500/20 shadow-sm bg-slate-900/40">
                    <img 
                      src="/auto_choice_logo_1781509565476.jpg" 
                      alt="Auto Choice Flagship Logo" 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-black font-sans text-white uppercase tracking-tight">Auto Choice</h2>
                    <p className="text-[#38BDF8] font-mono text-[10px] font-black tracking-wider uppercase mt-0.5">Automotive division</p>
                  </div>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed font-sans text-left flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
                  Experience Pakistan’s elite digitized automotive platform. Browse certified SUVs, premium electric sedans, and high-performance imports with live valuation matrices, secure direct trade options, and instant spot-inspection alignments in Peshawar.
                </p>

                {/* Styled Vehicle Vector Graphic in premium dark colors */}
                <div className="py-2 opacity-85 group-hover:opacity-100 transition-opacity duration-300 shrink-0 hidden sm:block">
                  <svg className="w-full h-12 text-[#38BDF8]/15 group-hover:text-[#38BDF8]/25 transition-colors" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 28 C 10 24, 25 24, 30 18 L 45 10 C 50 8, 70 8, 75 14 L 90 20 C 105 20, 110 24, 110 28 Z" />
                    <circle cx="30" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <circle cx="85" cy="28" r="5" fill="#1E293B" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 28 L 115 28" strokeWidth="0.8" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3 relative z-10 w-full shrink-0">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase group-hover:text-[#38BDF8] transition-colors">
                  Tap anywhere to launch portal
                </span>
                <div className="bg-[#2563EB] text-white rounded-xl px-4 py-2 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/10 group-hover:bg-[#3B82F6] transition-all active:scale-[0.98]">
                  <span>Access Showroom</span>
                  <span className="text-base">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: FUTURE DIVISION PIPELINES (BENTO CARD OVERHAUL) */}
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-black flex items-center gap-1.5">
                ★ SECURED SATELLITE PIPELINES
              </span>
              <span className="text-[9px] bg-orange-500/10 text-orange-400 font-mono px-2.5 py-0.5 border border-orange-500/20 rounded-md font-black tracking-widest uppercase">
                Nationwide Expansion
              </span>
            </div>

            <div 
              className="flex-1 bg-[#1E293B] border border-white/5 rounded-3xl p-5 md:p-6.5 flex flex-col justify-between transition-all duration-300 hover:border-orange-500/30 hover:shadow-2xl relative overflow-hidden group select-none"
            >
              {/* Backdrops */}
              <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1E293B]/50 to-transparent pointer-events-none"></div>

              <div className="space-y-4.5 relative z-10 text-left flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-mono text-[#38BDF8] font-black tracking-widest uppercase bg-[#38BDF8]/10 px-3 py-1 rounded-lg border border-sky-500/20">
                    Bazar360 Interactive Labs
                  </span>
                  
                  {/* Notify Me Toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeaserNotified(!teaserNotified);
                    }}
                    className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-center ${
                      teaserNotified 
                        ? 'bg-amber-500 text-stone-900 border-amber-500 shadow-md shadow-amber-500/10' 
                        : 'bg-[#111827] text-gray-400 hover:text-white border-white/5'
                    }`}
                    title={teaserNotified ? "Alert Registration Active" : "Notify Me on Launch"}
                  >
                    <Bell size={14} className={teaserNotified ? "text-stone-900 shrink-0 animate-bounce-subtle" : "text-gray-400 shrink-0"} />
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider ml-1.5 hidden sm:inline-block">
                      {teaserNotified ? "Notified" : "Notify Me"}
                    </span>
                  </button>
                </div>

                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <h2 className="text-lg font-black font-sans text-white uppercase tracking-tight">
                      {activeTaglineVariant.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans">
                    {activeTaglineVariant.sub}
                  </p>
                </div>

                {/* SUGGESTION ENGINE BOX (Sophisticated input fields) */}
                <div className="pt-1.5 space-y-2.5 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text"
                      id="community-suggestion-input"
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder="Propose custom tools (e.g. smart appraisers)..."
                      className="flex-1 bg-[#111827] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:bg-[#111827] transition-all"
                    />
                    <button
                      id="submit-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnSubmitSuggestion();
                      }}
                      disabled={isSubmittingSuggestion || !suggestionText.trim()}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-[#111827] disabled:text-gray-600 text-white font-sans font-black text-xs rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0"
                    >
                      {isSubmittingSuggestion ? "Sending..." : "Submit Proposal"}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-gray-500 font-mono font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Peshawar Almas Car Valley location listings filter"); }}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#111827]/85 text-[8px] font-mono text-gray-300 border border-white/5 cursor-pointer transition-all"
                    >
                      + Almas Valley Filters
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSuggestionText("Smart inspection sheet uploading module"); }}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#111827]/85 text-[8px] font-mono text-gray-300 border border-white/5 cursor-pointer transition-all"
                    >
                      + Verified Sheets
                    </button>
                  </div>

                  {suggestionMessage && (
                    <p className={`text-[10px] font-semibold font-sans mt-1 ${suggestionMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {suggestionMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Voting Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-3 mt-4 relative z-10 w-full text-left shrink-0">
                <div className="shrink-0">
                  <p className="text-[9px] uppercase font-mono font-black text-gray-500 tracking-wider">
                    Community Endorsement Weighted
                  </p>
                  <p className="text-xs font-mono font-black text-gray-200 mt-0.5">
                    🗳️ <span className="text-orange-400 font-extrabold">{teaserVotes.toLocaleString()}</span> Community Votes
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
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-center transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${
                    userTeaserVoted
                      ? 'bg-[#2563EB] text-white shadow-md shadow-sky-600/10'
                      : 'bg-transparent text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8]/50 hover:bg-sky-500/5 shadow-sm'
                  }`}
                >
                  {userTeaserVoted ? "✓ Voted successfully" : "Upvote Channel"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Custom Overlay Modal for Expansion Details (Redesigned in Luxury Professional Mode) */}
        {comingSoonSector && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
            <div className="bg-[#1E293B] border border-white/5 max-w-lg w-full rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative text-white text-left animate-slide-up">
              <button 
                onClick={() => setComingSoonSector(null)} 
                className="absolute top-4 right-4 bg-[#111827] hover:bg-[#111827]/80 text-gray-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer border border-white/5"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="text-3xl bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-[#38BDF8] font-sans">{comingSoonSector.icon}</div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">{comingSoonSector.title}</h3>
                  <p className="text-[#38BDF8] font-mono text-[10px] font-black uppercase tracking-widest">Active Development Channel</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] uppercase tracking-wider text-orange-400 font-mono block font-black mb-1">Target Mission Statement:</span>
                  <p className="text-white font-sans font-bold text-xs leading-relaxed">{comingSoonSector.tagline}</p>
                </div>

                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] uppercase tracking-wider text-[#38BDF8] font-mono block font-black mb-1">Functional Outline:</span>
                  <p className="text-gray-400 text-xs font-sans leading-relaxed">{comingSoonSector.desc}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-[10.5px] text-emerald-400 font-mono font-medium leading-relaxed">
                  🚀 Compliance: {comingSoonSector.spec}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button 
                  onClick={() => setComingSoonSector(null)}
                  className="bg-[#2563EB] hover:bg-[#3B82F6] text-white font-mono font-black py-3.5 px-6 rounded-xl w-full text-xs uppercase active:scale-[0.98] duration-100 cursor-pointer shadow-lg"
                >
                  Dismiss & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-[9px] md:text-[10px] uppercase font-mono tracking-widest pb-[env(safe-area-inset-bottom)] md:pb-1 mt-1 shrink-0 relative z-10 border-t border-white/5 pt-3">
          Founder: Muhammad Amjid &bull; Helpline Connect: <a href="tel:03149198403" className="text-orange-500 hover:underline font-bold">03149198403</a> &bull; BAZAR360 Pakistan Enterprise &copy; 2026. SECURED THROUGH ADVANCED LOCAL BLUEPRINT.
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
    <div className="bg-[var(--brand-bg)] text-slate-800 dark:text-stone-100 min-h-screen text-sm font-sans flex flex-col pb-24 md:pb-8 overflow-x-hidden">
      
      {/* 🚀 FAST LIVE ENGINE TICKER MARQUEE */}
      {currentCategory === 'auto' && (
        <div className="fixed top-16 left-0 w-full h-8 bg-white dark:bg-[#040812] border-b border-slate-200 dark:border-orange-500/10 z-40 flex items-center overflow-hidden select-none">
          <div className="absolute left-0 top-0 h-full bg-slate-100 dark:bg-[#121c32] px-3.5 flex items-center gap-1.5 border-r border-slate-200 dark:border-[#38BDF8]/20 z-15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest font-mono">LIVE PRICES</span>
          </div>
          <div className="w-full pl-28 overflow-hidden relative">
            <div className="animate-fast-ticker flex items-center whitespace-nowrap gap-12 font-mono text-[9px] text-sky-700 dark:text-[#38BDF8]/90 font-bold tracking-tight uppercase">
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
        currentTheme={theme}
        onThemeChange={setTheme}
        isWithTicker={currentCategory === 'auto'}
        currentCategory={currentCategory}
        onCategoryChange={handleSetCategory}
        lang={lang}
        onLanguageToggle={toggleLanguage}
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

        {dbLoading && currentTab !== 'home' && currentTab !== 'inventory' && currentTab !== 'search' ? (
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
                dbLoading={dbLoading}
                setTab={setTab}
                setSelectedCategory={setSelectedCategory}
                setSearchQuery={setSearchQuery}
                onSelectDealer={onSelectDealer}
                onSelectListing={handleSelectListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                currentCategory={currentCategory}
                currentUser={currentUser}
                lang={lang}
              />
            )}

            {(currentTab === 'inventory' || currentTab === 'search') && (
              <SearchExplorerView
                listings={prioritizedListings}
                dealers={dealers}
                dbLoading={dbLoading}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectListing={handleSelectListing}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                currentCategory={currentCategory}
                currentUser={currentUser}
                lang={lang}
              />
            )}

            {currentTab === 'dealers' && (() => {
              const showT = {
                en: {
                  title: "Verified Showrooms",
                  subtitle: "Select an elite showroom partner to inspect dedicated inventories and talk with experts",
                  placeholder: "Search showrooms by name or city...",
                  activeListings: "Active Listings",
                  userScore: "User Score",
                  noShowrooms: "No showrooms found. Try adjusting your search query."
                },
                ur: {
                  title: "تصدیق شدہ شورومز",
                  subtitle: "خصوصی انوینٹریز اور گاڑیوں کی خریداری کے لیے بہترین شوروم کا انتخاب کریں",
                  placeholder: "نام یا شہر سے شوروم تلاش کریں...",
                  activeListings: "فعال اشتہارات",
                  userScore: "صارفین کی درجہ بندی",
                  noShowrooms: "کوئی شوروم نہیں ملا۔ اپنی تلاش تبدیل کریں۔"
                }
              }[lang];

              const filteredDealers = dealers.filter((d) => {
                if (!showroomSearch) return true;
                const s = showroomSearch.toLowerCase();
                return d.name.toLowerCase().includes(s) || d.location.toLowerCase().includes(s);
              });

              const isRtl = lang === 'ur';

              return (
                <div className={`space-y-8 animate-fade-in text-white font-sans ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                  {/* Showrooms Header with Search Bar */}
                  <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#38BDF8]">{showT.title}</h2>
                      <p className="text-xs text-gray-400 mt-1">{showT.subtitle}</p>
                    </div>

                    <div className="relative w-full md:w-80">
                      <input
                        type="text"
                        value={showroomSearch}
                        onChange={(e) => setShowroomSearch(e.target.value)}
                        placeholder={showT.placeholder}
                        className={`w-full bg-[#0b0f19] border border-white/5 text-xs rounded-xl p-3 focus:border-[#38bdf8] outline-none text-white ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                      {showroomSearch && (
                        <button
                          onClick={() => setShowroomSearch('')}
                          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-white ${isRtl ? 'left-3' : 'right-3'}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredDealers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDealers.map((dealer) => (
                        <div
                          key={dealer.id}
                          onClick={() => onSelectDealer(dealer.id)}
                          className="bg-[#0b0f19] border border-white/5 rounded-3xl overflow-hidden group hover:-translate-y-1 cursor-pointer relative shadow-xl duration-200 hover:border-[#38bdf8]"
                        >
                          <div className="h-32 bg-[#030712] relative flex items-center justify-center overflow-hidden">
                            <img
                              alt={dealer.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                              src={dealer.coverImage}
                              referrerPolicy="no-referrer"
                            />
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center z-10 shadow-lg border-4 border-[#0b0f19]">
                              <span className="font-sans font-black text-xl text-black">
                                {dealer.avatarLetter}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 space-y-4 text-left">
                            <div>
                              <h3 className="font-sans font-black text-[#38bdf8] text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                {dealer.name}
                              </h3>
                              <p className="text-gray-400 text-[10px] mt-1 flex items-center gap-1 font-sans uppercase tracking-wider">
                                <MapPin size={11} className="text-[#38bdf8]" /> {dealer.location}
                              </p>
                            </div>

                            <p className="text-[#a3b3cc] text-xs leading-relaxed line-clamp-2 pr-2 font-sans">
                              {dealer.description}
                            </p>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[9px] uppercase tracking-wider">
                              <div className="flex items-center gap-1 font-sans text-gray-400 font-extrabold">
                                <Star size={11} className="fill-amber-500 text-amber-500" /> {dealer.rating} {showT.userScore}
                              </div>
                              <span className="font-sans text-gray-400 font-extrabold">
                                {listings.filter((l) => l.dealerId === dealer.id).length} {showT.activeListings}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
                      <Car size={36} className="text-gray-600 animate-pulse" />
                      <p className="text-gray-400 text-xs font-sans">
                        {showT.noShowrooms}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {currentTab === 'services' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <AutoServicesView lang={lang} />
              </div>
            )}

            {currentTab === 'contact' && (
              <div className="max-w-7xl mx-auto pb-16 px-4 md:px-8">
                <ContactView lang={lang} />
              </div>
            )}

            {currentTab === 'dealer-storefront' && currentDealer && (
              <DealerStorefrontView
                dealer={currentDealer}
                listings={prioritizedListings}
                reviews={reviewsMap[selectedDealerId] || []}
                onAddReview={handleAddReview}
                onSelectListing={handleSelectListing}
                onPublishActivity={handlePublishActivity}
                onApproveActivity={handleApproveActivity}
                currentUser={currentUser}
                onAddListing={handleAddListing}
              />
            )}

            {currentTab === 'portal' && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-16 px-1.5 sm:px-4 md:px-8 text-left">
                {/* Secondary Registration Portal and Submissions forms */}
                <div className="border border-white/5 rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 bg-[#0a0a0c] text-left">
                  <div className="border-b border-white/5 pb-3 mb-6">
                    <h2 className="font-sans font-extrabold text-lg md:text-xl text-zinc-400 uppercase tracking-wider">Multi-Role Registration & Onboarding Suite</h2>
                    <p className="text-[10px] text-zinc-500 mt-1">Simulate secure customer registration, detailed car posting schema outputs, and regional dealership signups.</p>
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
              </div>
            )}

            {currentTab === 'sell' && (
              <div className="max-w-7xl mx-auto pb-16 px-1.5 sm:px-4 md:px-8 text-left">
                <DetailedVehiclePostingPage
                  lang={lang}
                  currentUser={currentUser}
                  onPostCreated={(newL) => {
                    setListings((prev) => [newL, ...prev]);
                    setTab('search');
                  }}
                />
              </div>
            )}
          </>
        )}
        <Footer />
      </main>

      {/* Bottom Nav Bar (Mobile Only) */}
      <BottomNavBar 
        currentTab={currentTab} 
        setTab={setTab} 
        currentCategory={currentCategory} 
        onCategoryChange={handleSetCategory} 
        lang={lang}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* DYNAMIC LISTING DETAILS FULL SCREEN MODAL */}
      {selectedListing && (
        <div id="fullscreen-spec-modal" className="fixed inset-0 bg-[#0F172A] z-50 overflow-y-auto animate-fade-in animate-once">
          <div className="min-h-screen w-full text-xs font-sans text-white flex flex-col relative max-w-full px-4 md:px-12 py-6">
            
            {/* Header banner */}
            <div className="bg-[#1E293B] p-4 border border-white/5 rounded-2xl flex justify-between items-center shrink-0 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold text-[9px] uppercase tracking-wider border border-sky-500/20 flex items-center gap-1">
                  <ShieldCheck size={10} /> Certified Spec Sheet
                </span>
                <span className="text-[10px] text-gray-400 font-mono">ID: {selectedListing.id}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setOfferSuccessMessage('');
                }}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Core Content with Asymmetrical Columns - truly full-screen and scrollable */}
            <div className="flex-grow pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 items-start">
                
                {/* LEFT COLUMN: Visual Media Showcase (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Brand Watermark editorial backdrop around the vehicle profile */}
                  <div className="relative bg-gradient-to-b from-[#0c1425] to-[#040810] rounded-2xl border border-white/5 p-4 overflow-hidden h-80 md:h-[390px] flex items-center justify-center shadow-inner">
                    
                    {/* Massive Model Heading Overlay */}
                    <div className="absolute top-4 left-6 select-none pointer-events-none text-left z-0">
                      <h1 className="text-4xl md:text-5xl font-sans font-black tracking-tighter text-white/[0.03] uppercase leading-none select-none">
                        {selectedListing.title}
                      </h1>
                    </div>

                    {/* Faded Editorial Manufacturer Vector Watermark Backdrop */}
                    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03] z-0">
                      <svg className="w-64 h-64 md:w-80 md:h-80 animate-[spin_120s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                        <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="3 3" className="text-sky-400" />
                        <circle cx="50" cy="50" r="37" strokeWidth="0.5" className="text-white" />
                        <circle cx="50" cy="50" r="25" strokeWidth="1" strokeDasharray="5 5" className="text-sky-400" />
                        <path d="M 50 10 L 50 90 M 10 50 L 90 50" strokeWidth="0.5" className="text-white/40" />
                        <text x="50" y="44" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="currentColor" letterSpacing="1.5" className="text-sky-400 font-mono">AUTO</text>
                        <text x="50" y="61" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="currentColor" letterSpacing="1.5" className="text-sky-400 font-mono">CHOICE</text>
                      </svg>
                    </div>

                    {/* Left-Aligned Vertical Feature Pill Stack on the stage margin */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                      <span className="text-[7px] text-gray-400 font-mono uppercase tracking-widest text-center select-none block pb-1 border-b border-white/5">Aspects</span>
                      {(['Design', 'Safety', 'Luxury', 'Performance'] as const).map((tab) => (
                        <button
                          type="button"
                          key={tab}
                          onClick={() => setActiveDetailTab(tab)}
                          onMouseEnter={() => setActiveDetailTab(tab)}
                          className={`w-20 py-1.5 px-2 rounded-lg text-left text-[8px] font-mono uppercase tracking-wide transition-all duration-150 cursor-pointer border flex items-center gap-1 shrink-0 ${
                            activeDetailTab === tab
                              ? 'bg-[#38bdf8] text-slate-950 font-black border-[#38bdf8] shadow-md shadow-[#38bdf8]/20'
                              : 'bg-black/60 text-gray-400 border-white/5 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Contextual dynamic highlights notes panel */}
                    <div className="absolute right-3 top-3 max-w-[150px] p-2 rounded-xl bg-black/75 border border-cyan-500/20 text-left z-20 pointer-events-none animate-fade-in">
                      <p className="text-[7px] text-sky-400 font-mono font-bold tracking-widest uppercase">Aspect Focus</p>
                      <p className="text-[9px] text-white font-sans font-black uppercase mt-0.5">{activeDetailTab}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5 font-sans leading-tight">
                        {activeDetailTab === 'Design' && "Active aerodynamics optimized to reduce drag coeff."}
                        {activeDetailTab === 'Safety' && "Autonomous Level 2+ lidar radar safety protocols."}
                        {activeDetailTab === 'Luxury' && "Premium Burmester audio paired with acoustic quiet-glass."}
                        {activeDetailTab === 'Performance' && "Optimized gear twin-clutch ratios with active differential."}
                      </p>
                    </div>

                    {/* Thin Perspective Ring / Soft Radial Floor Reflection to ground vehicle */}
                    <div className="absolute bottom-10 w-[75%] h-[15%] rounded-full bg-cyan-500/5 border border-cyan-400/20 blur-sm transform scale-x-110 -skew-x-12 z-0"></div>
                    <div className="absolute bottom-8 w-[60%] h-[10%] rounded-full bg-black/70 blur-[4px] z-0"></div>

                    {/* Profile image with canvas hotspots */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src={selectedListing.imageUrl}
                        className="max-w-[75%] max-h-[75%] object-contain rounded-xl drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)]"
                        alt={selectedListing.title}
                        referrerPolicy="no-referrer"
                      />

                      {/* Interactive 360 Hotspots overlays */}
                      {HOTSPOTS_LIST.map((h) => (
                        <div
                          key={h.id}
                          className="absolute"
                          style={{ left: h.x, top: h.y }}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveHotspotId(activeHotspotId === h.id ? null : h.id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-black border uppercase shadow-lg transition-all duration-200 cursor-pointer ${
                              activeHotspotId === h.id 
                                ? 'bg-orange-500 text-white border-orange-400 rotate-45 scale-110 shadow-orange-500/30' 
                                : 'bg-black/80 text-[#38bdf8] hover:text-white border-cyan-500/40 hover:border-cyan-400 scale-100 hover:scale-105'
                            }`}
                            title={h.name}
                          >
                            ⊙
                          </button>

                          {/* Callout box overlay */}
                          {activeHotspotId === h.id && (
                            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl bg-slate-950/95 border border-orange-500 text-left text-[9px] z-30 font-sans shadow-xl leading-relaxed animate-fade-in text-white shrink-0">
                              <p className="font-mono font-black text-orange-400 uppercase tracking-wider text-[8px] border-b border-white/5 pb-1 mb-1">{h.name}</p>
                              <p className="text-gray-300">{h.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Overlapping Call To Action Loop on lower right flank of stage */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <button
                        type="button"
                        onClick={() => {
                          const d = dealers.find((dl) => dl.id === selectedListing.dealerId);
                          if (d) {
                            setSelectedDealerId(d.id);
                            setSelectedListing(null);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-sans font-black uppercase text-[9px] tracking-wider py-2 px-3.5 rounded-xl shadow-[0_4px_12px_rgba(249,115,22,0.35)] flex items-center gap-1.5 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_6px_18px_rgba(249,115,22,0.5)] border border-orange-400"
                      >
                        <span className="material-symbols-outlined text-[12px]">store</span>
                        Connect with Showroom
                        <span className="text-white/60 font-mono font-normal">→</span>
                      </button>
                    </div>

                  </div>

                  {/* Base filmstrips slider */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-gray-500 uppercase font-mono font-bold tracking-widest block text-left">Scrolling Showcase Filmstrips</span>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                      {[
                        selectedListing.imageUrl,
                        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300",
                        "https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=300",
                        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300"
                      ].map((url, idx) => (
                        <div key={idx} className="w-20 md:w-28 h-14 md:h-20 bg-slate-950 rounded-lg overflow-hidden border border-white/10 shrink-0 hover:border-cyan-400 cursor-pointer duration-150">
                          <img src={url} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="filmstrip" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High-Impact Base Hero Spec Cards at Left Column Footer - Mathematically derived layout */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {/* CARD 1: Fuel Economy */}
                    <div className="relative overflow-hidden backdrop-blur-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-3 rounded-xl flex flex-col justify-between text-left transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-[14px] md:text-base font-sans font-black text-[#38bdf8] block tracking-tight">
                          11.8 - 10.1
                        </span>
                        <span className="text-[8px] text-gray-400 font-mono block leading-none">km/l</span>
                      </div>
                      <span className="text-[7.5px] text-gray-500 font-sans tracking-wide block mt-1">Fuel consumption, combined</span>
                    </div>
                    
                    {/* CARD 2: Powertrain Configuration */}
                    <div className="relative overflow-hidden backdrop-blur-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-3 rounded-xl flex flex-col justify-between text-left transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-[14px] md:text-base font-sans font-black text-white block tracking-tight uppercase truncate">
                          {selectedListing.fuelType || "Gasoline"}
                        </span>
                        <span className="text-[8px] text-sky-400 font-mono block leading-none">High Efficiency</span>
                      </div>
                      <span className="text-[7.5px] text-gray-500 font-sans tracking-wide block mt-1">Engine and Fuel Type</span>
                    </div>

                    {/* CARD 3: Absolute Purchase Price */}
                    <div className="relative overflow-hidden backdrop-blur-md bg-white/[0.02] hover:bg-orange-500/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between text-left transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-[14px] md:text-base font-mono font-black text-orange-400 block tracking-tight truncate">
                          {renderPrice(selectedListing.price).replace(' PKR', '')}
                        </span>
                        <span className="text-[8px] text-orange-500 font-mono block leading-none">PKR Value</span>
                      </div>
                      <span className="text-[7.5px] text-gray-500 font-sans tracking-wide block mt-1">Certified Purchase Price</span>
                    </div>
                  </div>

                  {/* Executive Presentation description */}
                  <div className="bg-[#0c1425] border border-white/5 p-4.5 rounded-xl space-y-2 text-left">
                    <h4 className="text-[#38bdf8] font-black text-xs uppercase tracking-wider border-b border-white/5 pb-1.5">Executive Presentation Description</h4>
                    <p className="text-gray-300 text-xs leading-relaxed font-sans pr-4">{selectedListing.description}</p>
                  </div>

                </div>

                {/* RIGHT COLUMN: Sticky Pricing & Feature Tabs (5/12) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-0 text-left">
                  
                  {/* Title Panel */}
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase">
                      {selectedListing.title}
                    </h2>
                    <p className="text-[#38bdf8] text-xs font-mono font-bold flex items-center gap-1">
                      <MapPin size={11} /> Peshawar Motorway Corridor Hub (Active Delivery)
                    </p>
                  </div>

                  {/* Illumination Valuation panel */}
                  <div className="bg-[#0c1425] border-2 border-white/5 p-4 rounded-2xl relative overflow-hidden shadow-lg space-y-3.5">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[8.5px] text-[#38bdf8] font-mono uppercase font-black tracking-widest">Pricing Matrix Index</span>
                      <span className="text-[8px] bg-orange-500/10 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/25 uppercase font-bold">Standard Value</span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Current Market Demand</span>
                      <h3 className="text-2xl md:text-3xl font-black text-orange-400 tracking-tight">
                        {renderPrice(selectedListing.price)}
                      </h3>
                    </div>

                    {/* Competitive Leasing calculations placeholder */}
                    <div className="bg-[#050912] p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-left">
                      <div>
                        <span className="text-[7.5px] text-gray-500 font-mono uppercase block font-bold leading-none">Est. Leasing PKR</span>
                        <span className="text-[10px] font-mono font-bold text-white leading-none">Rs. {(selectedListing.price * 0.021).toLocaleString(undefined, {maximumFractionDigits: 0})} / Month</span>
                      </div>
                      <span className="text-[7.5px] text-[#38bdf8] bg-sky-500/10 rounded border border-cyan-500/30 px-1.5 py-0.5 font-mono uppercase font-black shrink-0">
                        3 Year @ 15% Down
                      </span>
                    </div>
                  </div>

                  {/* Left Aligned Metric Feature Tabs */}
                  <div className="bg-[#0c1425] border border-white/5 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[8.5px] text-[#38bdf8] font-mono font-black uppercase tracking-wider">Metrics Groups Exploration</span>
                      <span className="text-[8px] text-gray-500 font-mono">Select telemetry group</span>
                    </div>

                    {/* Dual segment: Left Buttons list, Right output details */}
                    <div className="grid grid-cols-12 gap-3.5">
                      
                      {/* Left pillar list of buttons */}
                      <div className="col-span-4 flex flex-col gap-1.5 border-r border-white/5 pr-2.5">
                        {(['Design', 'Safety', 'Luxury', 'Performance'] as const).map((tab) => (
                          <button
                            type="button"
                            key={tab}
                            onClick={() => setActiveDetailTab(tab)}
                            className={`w-full py-1.5 px-2 rounded-lg text-left text-[9px] font-mono uppercase transition-all duration-150 cursor-pointer ${
                              activeDetailTab === tab
                                ? 'bg-[#38bdf8] text-slate-950 font-black shadow shadow-[#38bdf8]/40'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            ● {tab}
                          </button>
                        ))}
                      </div>

                      {/* Right output detail block without jumpiness */}
                      <div className="col-span-8 space-y-2 text-left">
                        {((activeDetailTab === 'Design' ? METRIC_TABS_DATA.Design :
                           activeDetailTab === 'Safety' ? METRIC_TABS_DATA.Safety :
                           activeDetailTab === 'Luxury' ? METRIC_TABS_DATA.Luxury :
                           METRIC_TABS_DATA.Performance) || []).map((metric, midx) => (
                          <div key={midx} className="border-b border-white/5 pb-1 last:border-0 leading-tight">
                            <p className="text-[7.5px] text-gray-500 font-mono uppercase">{metric.label}</p>
                            <p className="text-[9.5px] font-sans font-bold text-white truncate">{metric.value}</p>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Technical Telemetry Metrics Grid (1px border cards) */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-gray-500 uppercase font-mono font-bold tracking-widest block">Technical Aspect Telemetry</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#0a1425] border border-white/10 p-3 rounded-xl hover:border-cyan-500/50 transition-colors">
                        <span className="text-[7.5px] text-gray-500 font-mono uppercase block">Engine Displacement</span>
                        <span className="text-[11px] font-mono font-bold text-white block mt-0.5">{selectedListing.specs.engineSize || '2,981 cc'}</span>
                      </div>
                      <div className="bg-[#0a1425] border border-white/10 p-3 rounded-xl hover:border-cyan-500/50 transition-colors">
                        <span className="text-[7.5px] text-gray-500 font-mono uppercase block">Peak Power HP Unit</span>
                        <span className="text-[11px] font-mono font-bold text-white block mt-0.5">{selectedListing.specs.horspower || '450 Horsepower'}</span>
                      </div>
                      <div className="bg-[#0a1425] border border-white/10 p-3 rounded-xl hover:border-cyan-500/50 transition-colors">
                        <span className="text-[7.5px] text-gray-500 font-mono uppercase block">Outer Paint Body</span>
                        <span className="text-[11px] font-mono font-bold text-white block mt-0.5">{selectedListing.specs.color || 'Aurora Black Met.'}</span>
                      </div>
                      <div className="bg-[#0a1425] border border-white/10 p-3 rounded-xl hover:border-cyan-500/50 transition-colors">
                        <span className="text-[7.5px] text-gray-500 font-mono uppercase block">Specs standard</span>
                        <span className="text-[11px] font-mono font-bold text-white block mt-0.5">{selectedListing.specs.regionalSpecs || 'KPK Provincial Spec'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deep linking share block */}
                  <div className="bg-[#0c1425] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 font-mono">
                    <div className="text-left space-y-0.5">
                      <span className="text-[9.5px] uppercase font-black tracking-widest text-[#38bdf8] block">Adaptive Sharing</span>
                      <span className="text-[8px] text-gray-400 font-sans block">Share certified specifications directly</span>
                    </div>
                    <button
                      onClick={async () => {
                        const d = dealers.find((dl) => dl.id === selectedListing.dealerId);
                        const locationText = d?.location || "Alamas Car Village, Ring Road, Peshawar";
                        const shareUrl = `https://bazar360.online/dealers/${selectedListing.dealerId}/listings/${selectedListing.id}`;
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

                  {/* Bid/Offer tool integrates */}
                  <div className="bg-[#0c1425] border border-white/5 p-4 rounded-xl space-y-3 font-sans">
                    <span className="text-[9.5px] uppercase font-mono font-black text-[#38bdf8] block tracking-wider">Dynamic Offer Pipeline</span>
                    
                    {offerSuccessMessage ? (
                      <div className="p-3 bg-green-950/40 text-green-400 font-bold text-xs rounded border border-green-900 leading-relaxed font-sans shadow-inner">
                        {offerSuccessMessage}
                      </div>
                    ) : (
                      <form onSubmit={handleOfferSubmit} className="flex gap-2">
                        <div className="bg-[#051020] border border-white/10 p-2 rounded-lg flex items-center flex-grow">
                          <DollarSign size={14} className="text-[#38bdf8] mr-1 shrink-0" />
                          <input
                            type="number"
                            placeholder="Place custom offer in PKR..."
                            className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-xs w-full font-mono font-bold"
                            value={offerInput}
                            onChange={(e) => setOfferInput(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-[#38bdf8] hover:bg-[#299ecf] text-slate-950 font-mono font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 duration-75 text-xs select-none cursor-pointer"
                        >
                          <Send size={11} /> Submit
                        </button>
                      </form>
                    )}
                    <span className="text-[8.5px] text-gray-500 block leading-tight">Offers transmitted are non-binding but unlock priority validation within associated micro-showrooms.</span>
                  </div>

                  {/* 🔍 SUGGESTIONS AS PER SEARCH SECTION */}
                  <div className="mt-12 border-t border-white/5 pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-orange-500 animate-pulse" /> SUGGESTIONS AS PER SEARCH
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                          Smart match recommendations mapped by category, price range, and custom metrics.
                        </p>
                      </div>
                      <span className="text-[8.5px] font-mono bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded border border-orange-500/20 uppercase font-black">
                        {selectedListing.fuelType?.toUpperCase() || 'AUTO'} Portal Fits
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {prioritizedListings
                        .filter((car) => car.id !== selectedListing.id)
                        .sort((a, b) => {
                          // Prioritize same fuelType first, then same make
                          if (a.fuelType === selectedListing.fuelType && b.fuelType !== selectedListing.fuelType) return -1;
                          if (a.fuelType !== selectedListing.fuelType && b.fuelType === selectedListing.fuelType) return 1;
                          if (a.make === selectedListing.make && b.make !== selectedListing.make) return -1;
                          return 0;
                        })
                        .slice(0, 4)
                        .map((car) => {
                          const dealerName = dealers.find((d) => d.id === car.dealerId)?.name || 'Premium Showroom';
                          return (
                            <div
                              key={car.id}
                              onClick={() => {
                                setSelectedListing(car);
                                setOfferSuccessMessage('');
                                // Scroll the modal content to top
                                const modalContainer = document.getElementById('fullscreen-spec-modal');
                                if (modalContainer) {
                                  modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              }}
                              className="bg-[#1E293B] hover:bg-[#2d3a4f] border border-white/5 hover:border-orange-500/30 p-3 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-150 group text-left select-none"
                            >
                              <div className="space-y-2">
                                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950">
                                  <img
                                    src={car.imageUrl}
                                    alt={car.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold text-[#38bdf8] border border-white/5 uppercase">
                                    {car.condition}
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[7.5px] font-mono text-slate-400 uppercase">{car.make} • {car.year}</span>
                                  <h4 className="font-extrabold text-xs text-white truncate group-hover:text-orange-400 transition-colors uppercase leading-none">{car.title}</h4>
                                  <p className="text-[8px] text-[#38bdf8] font-mono truncate">{dealerName}</p>
                                </div>
                              </div>
                              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="font-mono text-orange-400 font-bold text-[10.5px]">
                                  {renderPrice(car.price)}
                                </span>
                                <span className="text-[7.5px] font-mono text-slate-400 uppercase group-hover:text-white transition-colors">
                                  View Spec →
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Bottom converted Action CTA Bar */}
            <div className="p-4 border border-white/5 rounded-2xl bg-[#1E293B] flex gap-3 shrink-0 mt-8">
              <button
                onClick={() => {
                  const d = dealers.find((dl) => dl.id === selectedListing.dealerId);
                  if (d) {
                    onSelectDealer(d.id);
                    setSelectedListing(null);
                  }
                }}
                className="flex-1 bg-transparent border border-sky-400 text-sky-400 hover:bg-sky-400/10 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-all duration-75 cursor-pointer"
              >
                <span className="material-symbols-outlined shrink-0 text-base">store</span> Contact Showroom Profile
              </button>
              
              <a
                href={`mailto:amjid.bisconni@gmail.com?subject=Inquiry on ${selectedListing.title}&body=Hello, I am interested in checking vehicle specifications on the ${selectedListing.title} listed under id ${selectedListing.id}.`}
                className="flex-1 bg-orange-500 hover:bg-orange-600 border border-orange-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center active:scale-97 transition-all duration-75 shadow cursor-pointer"
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

      {/* 📱 PWA SMART FLOATING INSTALLATION DESK */}
      {showInstallBanner && (
        <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 left-0 md:left-auto px-4 md:px-0 z-[100] max-w-sm w-full animate-fade-in">
          <div className="bg-[#0F172A]/95 dark:bg-[#030712]/95 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-800 dark:text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                {/* Brand Logo inside Install Card */}
                <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-sky-500/20 flex items-center justify-center">
                  <svg className="w-9 h-9 select-none" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 40 50 H 60 C 75 25, 110 25, 125 50" 
                      stroke="#FFFFFF" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    <circle cx="46" cy="45" r="2.5" fill="#0F2E59" />
                    <circle cx="54" cy="45" r="2.5" fill="#0F2E59" />
                    <path 
                      d="M 35 95 C 45 130, 95 130, 115 105" 
                      stroke="#FF6B00" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    <path d="M 110 106 L 122 102 L 118 114 Z" fill="#FF6B00" />
                    <text 
                      x="18" 
                      y="96" 
                      className="font-sans font-black fill-white" 
                      fontSize="70" 
                      letterSpacing="-4"
                    >
                      36
                    </text>
                    <circle cx="115" cy="75" r="24" fill="url(#orangeLogoGradInstall)" />
                    <circle cx="115" cy="75" r="18" fill="#FFFFFF" />
                    <path 
                      d="M 103 66 L 107 66 L 110 78 L 123 78 L 126 69 L 109 69" 
                      stroke="#FF6B00" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill="none" 
                    />
                    <circle cx="113" cy="84" r="2.5" fill="#FF6B00" />
                    <circle cx="121" cy="84" r="2.5" fill="#FF6B00" />
                    <defs>
                      <linearGradient id="orangeLogoGradInstall" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF8A00" />
                        <stop offset="100%" stopColor="#FF5200" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black font-sans uppercase tracking-tight text-white">Install Bazar360</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Access certified vehicles, instant dealer chats, and live price indices directly from your homescreen.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDismissInstall}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDismissInstall}
                className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 transition-all uppercase tracking-wider"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90 active:scale-[0.98] rounded-xl text-xs font-black text-white transition-all uppercase tracking-wider shadow"
              >
                Install App
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    );
  }
