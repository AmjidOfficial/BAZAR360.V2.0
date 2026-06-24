import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Users, 
  Award, 
  CornerDownRight, 
  Send,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Video,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Sliders,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Heart,
  BookOpen,
  Map,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Dealer, CarListing, Review, ChatMessage } from '../types';
import ShowroomHQHub from './ShowroomHQHub';
import { callDealerChat } from '../services/api';
import AiTranslationWrapper from './AiTranslationWrapper';
import { useCurrencyMode } from '../lib/currency';

const FEED_STOCK_IMAGES = [
  { name: 'Porsche Track Weapon', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZtBmgc7whl0zLeKAWRQtQFFaqpX0BeFFFhv-7s4eS0XJv8a1i88YYMhBhIwgqiGj0A7rd6ANHhOigA9qyoVbvYOAnweQXtNq7ErLbCyQjxwaBqRacvP9ywt_OdSJTgjIghQ1HJJryxlmkvysweO35ZG8mIQ-GXkXc9eRcG8W6mfooetlurMVEfJwBT5kA3gsemMgkdQQ1x8uV6kvo-7Fd2TWs0eo0DbfHCrGCCkwIOepT-cmfMIReSrrjlnJsv7mXR0lNxmLRanQ' },
  { name: 'Mercedes AMG Obsidian', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI' },
  { name: 'BMW Competition White', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRyZgqdwVho1YG4awPp4toJiKUSqH05IGmlCDeY-esoL_rsDYbAkp7FPKlnXbFzCmNSSrCuHqwrXO_non2l8_jM8QfzbMxg4aYyOMfOsMhs3rpT2R8j1Gx1Mf3knoB5B5hIqUiVq3mIkhn8Bc_376AboW7iBngDAdVbQRCj0uupxH2V2RrluMiTA106UgPdQQb-5gB_A5arpTkTHIfrGwAj737v9D8LD8iIwl-xWDtVKgoKbuQ9XpeQ3NVP4I-N1tqLxV1YsPjWs' },
  { name: 'Porsche Carrera Chalk', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHs7Za22_aYMs1VGHEYckNGnFgDZzkirSxzLiCJBbCB2xad7rRbbQo7M1xi7RyGNq8fvUUeGKfFFf93rh8AmKvNpWDRSLWCByW_bP0wK9XhH89wGXq5pXT2Px4I9jvkv5MBaJz82g9lonJQn3tomdmnq1xkOb7_VYzNv57n_oDsol7EzCfdb7PAysiZ_xKKaKLUSX2asp4D15fPMkZ87Rak4ev3Dn7scIHsYk-rDEk0lhfaS18RDIBh_FH8gp3SYVfy_24Oiv87Uw' }
];

const FEED_BADGE_OPTIONS = [
  'Just Arrived',
  'Vlog Update',
  'Delivery Alert',
  'Promo Desk',
  'Premium Ad',
  'VIP Spec'
];

interface DealerStorefrontViewProps {
  dealer: Dealer;
  listings: CarListing[];
  reviews: Review[];
  onAddReview: (comment: string, rating: number) => void;
  onSelectListing: (listing: CarListing) => void;
  onPublishActivity?: (dealerId: string, post: any) => void;
  onApproveActivity?: (dealerId: string, postId: string) => void;
  currentUser?: any;
  onAddListing: (listing: CarListing) => void;
}

// Mock database schema documentation to comply with layout rule #1 of FireStore spec
const FIRESTORE_SCHEMA_BLUEPRINT = {
  collection: "showrooms",
  documentStructure: {
    profileMetadata: {
      id: "showroom-id (e.g. auto-choice-peshawar)",
      name: "Field Name (string)",
      tagline: "Sleek description of showroom services (string)",
      description: "Comprehensive dealer operations info (string)",
      logoUrl: "Local or hosted JPEG/PNG image URI",
      coverBannerUrl: "High resolution storefront preview banner"
    },
    locationArray: [
      {
        city: "Peshawar / Lahore / Islamabad",
        address: "Physical GPS street reference line",
        geoPoint: {
          latitude: "Latitude coordinate decimal (e.g. 34.0086)",
          longitude: "Longitude coordinate decimal (e.g. 71.5484)"
        }
      }
    ],
    contactPoints: {
      primaryPhone: "Primary direct dialing phone hotlines",
      secondaryPhone: "Alternate communication lines (Line 2/3)",
      whatsappNumber: "Verified WhatsApp chat routing number"
    },
    socialMediaIntegration: {
      tiktokUrl: "TikTok video profile URL",
      facebookUrl: "Facebook brand page",
      websiteUrl: "Optional official domain (Conditional null evaluation)"
    },
    teamRoster: {
      userId_01: "CEO",
      userId_02: "CFO/Registrar",
      userId_03: "SalesRep"
    },
    analyticsCounters: {
      totalViews: "Synthetic visual counter",
      activeListingsCount: "Live inventory units integer",
      verifiedStatus: "Boolean verification flag (true/false)"
    }
  }
};

interface ThemeConfig {
  id: 'Cosmic' | 'Bone' | 'Emerald' | 'Gold';
  name: string;
  bgGradient: string;
  bgCard: string;
  bgBaseDark: string;
  accentText: string;
  accentBg: string;
  ctaBg: string;
  ctaHoverBg: string;
  ctaText: string;
  badgeBorder: string;
  indicatorRing: string;
}

const THEMES: Record<string, ThemeConfig> = {
  Cosmic: {
    id: 'Cosmic',
    name: 'Cosmic Nebula',
    bgGradient: 'from-[#0A0D1A] to-[#121A3A]',
    bgCard: 'bg-[#121A3A]',
    bgBaseDark: 'bg-[#060812]',
    accentText: 'text-[#38BDF8]',
    accentBg: 'bg-[#38BDF8]/10 text-[#38BDF8]',
    ctaBg: 'bg-[#38BDF8]',
    ctaHoverBg: 'hover:bg-[#0ea5e9]',
    ctaText: 'text-[#38BDF8]',
    badgeBorder: 'border-[#38BDF8]/25',
    indicatorRing: 'ring-2 ring-[#38BDF8]/50',
  },
  Bone: {
    id: 'Bone',
    name: 'Bone Ivory',
    bgGradient: 'from-[#F5F5F4] to-[#E7E5E4]',
    bgCard: 'bg-[#F2F1ED]',
    bgBaseDark: 'bg-[#E5E4DF]',
    accentText: 'text-slate-900',
    accentBg: 'bg-slate-900/15 text-slate-800',
    ctaBg: 'bg-slate-900',
    ctaHoverBg: 'hover:bg-slate-800',
    ctaText: 'text-slate-900',
    badgeBorder: 'border-slate-400',
    indicatorRing: 'ring-2 ring-slate-900',
  },
  Emerald: {
    id: 'Emerald',
    name: 'Royal Monaco Emerald',
    bgGradient: 'from-[#04241B] to-[#0A3D30]',
    bgCard: 'bg-[#0A3D30]',
    bgBaseDark: 'bg-[#031A12]',
    accentText: 'text-[#10B981]',
    accentBg: 'bg-[#10B981]/15 text-[#10B981]',
    ctaBg: 'bg-[#059669]',
    ctaHoverBg: 'hover:bg-[#047857]',
    ctaText: 'text-[#10B981]',
    badgeBorder: 'border-[#10B981]/25',
    indicatorRing: 'ring-2 ring-[#059669]/50',
  },
  Gold: {
    id: 'Gold',
    name: 'Regal Gold',
    bgGradient: 'from-[#1E1B18] to-[#2B241A]',
    bgCard: 'bg-[#2B241A]',
    bgBaseDark: 'bg-[#120F0D]',
    accentText: 'text-[#F59E0B]',
    accentBg: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    ctaBg: 'bg-[#F59E0B]',
    ctaHoverBg: 'hover:bg-[#D97706]',
    ctaText: 'text-[#F59E0B]',
    badgeBorder: 'border-[#F59E0B]/25',
    indicatorRing: 'ring-2 ring-[#F59E0B]/50',
  }
};

export default function DealerStorefrontView({
  dealer,
  listings,
  reviews,
  onAddReview,
  onSelectListing,
  onPublishActivity,
  onApproveActivity,
  currentUser,
  onAddListing,
}: DealerStorefrontViewProps) {
  const { renderPrice } = useCurrencyMode();
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(dealer.followersCount);

  // Sub-categories filter for inventory
  const [currentCategory, setCurrentCategory] = useState<string>('All');

  // Interactive UI state trackers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeLikes, setActiveLikes] = useState<Record<string, number>>({});
  const [activeActivityComments, setActiveActivityComments] = useState<Record<string, { author: string; text: string }[]>>({});
  const [newCommentInputs, setNewCommentInputs] = useState<Record<string, string>>({});
  const [showDeveloperSchema, setShowDeveloperSchema] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'Cosmic' | 'Bone' | 'Emerald' | 'Gold'>(
    (dealer.theme_choice as any) || 'Cosmic'
  );

  useEffect(() => {
    if (dealer.theme_choice) {
      setCurrentTheme(dealer.theme_choice as any);
    }
  }, [dealer.theme_choice]);

  const [selectedCompareList, setSelectedCompareList] = useState<CarListing[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const theme = THEMES[currentTheme];

  // Showroom publisher state
  const [pubTitle, setPubTitle] = useState('');
  const [pubBadge, setPubBadge] = useState('Just Arrived');
  const [pubDescription, setPubDescription] = useState('');
  const [pubPrice, setPubPrice] = useState('');
  const [pubImageIndex, setPubImageIndex] = useState(0);
  const [pubSuccess, setPubSuccess] = useState(false);
  
  // Enterprise Video Pipeline & Moderation States
  const [associatedVideoUrl, setAssociatedVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(45); // default > 30s
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [adminModerationView, setAdminModerationView] = useState<boolean>(false);
  
  const hasOfficialRights = currentUser?.role === 'Admin' || (currentUser?.role === 'Showroom Owner' && currentUser?.salesPodId === dealer.id);
  const filteredActivities = (dealer.activityFeed || []).filter((post) => {
    if (adminModerationView && currentUser?.role === 'Admin') {
      return true;
    }
    return !post.status || post.status === 'approved';
  });
  const [sandboxBypass, setSandboxBypass] = useState(false);
  const showPublisher = hasOfficialRights || sandboxBypass;

  // Reviews states
  const [commentText, setCommentText] = useState('');
  const [starRating, setStarRating] = useState(5);

  // Dialer mockup state
  const [showDialer, setShowDialer] = useState(false);

  // Chatbot states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Welcome to ${dealer.name}. I am your dedicated digital sales assistant. I can fetch coordinates for ${dealer.location}, share alternative contact sheets, or inspect customized vehicle listings instantly!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChat]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Social sharing handlers
  const handleShareProfile = async () => {
    const shareUrl = `https://bazar360.online/dealers/${dealer.id}`;
    const shareTitle = `${dealer.name} - Certified Mini-Storefront`;
    // Strictest compliance with requested marketing template format:
    const shareText = `Check out spectacular premium vehicles and certified sports packages on ${dealer.name} on BAZAR360! https://bazar360.online/dealers/${dealer.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        showToast("✓ Showroom link shared successfully!");
      } catch (err) {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("✓ Link Copied! Check out spectacular premium vehicles on BAZAR360!");
      } catch (err) {
        showToast("Clipboard copy failed");
      }
    }
  };

  const handleSharePlatform = async () => {
    const shareUrl = `https://bazar360.online`;
    const shareTitle = `BAZAR360 - Ultimate Automotive Hub`;
    const shareText = `Explore certified vehicle listings, dynamic AI seller desks, and nationwide deliveries! ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        showToast("✓ Platform link shared successfully!");
      } catch (err) {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("✓ Link Copied! Explore BAZAR360 portal.");
      } catch (err) {
        showToast("Clipboard copy failed");
      }
    }
  };

  const handleShareContent = async (itemType: 'listing' | 'activity' | 'blog', itemId: string, itemTitle: string) => {
    const shareUrl = `https://bazar360.online/dealers/${dealer.id}/${itemType}s/${itemId}`;
    const shareTitle = `${itemTitle} • ${dealer.name}`;
    const shareText = `Take a look at this ${itemType} update on ${dealer.name}! ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        showToast(`✓ Dynamic ${itemType} shared successfully!`);
      } catch (err) {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("✓ Link Copied!");
      } catch (err) {
        showToast("Clipboard copy failed");
      }
    }
  };

  const handleLikeActivity = (postId: string) => {
    setActiveLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
    showToast("✓ Feedback count registered instantly!");
  };

  const handleAddActivityComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentVal = newCommentInputs[postId]?.trim();
    if (!commentVal) return;

    const newComment = {
      author: currentUser?.displayName || 'Verified Enthusiast',
      text: commentVal
    };

    setActiveActivityComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setNewCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
    showToast("✓ Comment published to post timeline");
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubDescription.trim()) return;

    const newPost = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      badge: pubBadge,
      imageUrl: FEED_STOCK_IMAGES[pubImageIndex].url,
      title: pubTitle,
      description: pubDescription,
      price: pubPrice.trim() ? (pubPrice.startsWith('Rs.') ? pubPrice : `Rs. ${pubPrice}`) : '',
      status: 'pending_approval' as const,
      videoUrl: associatedVideoUrl || undefined,
      videoDuration: associatedVideoUrl ? videoDuration : undefined
    };

    if (onPublishActivity) {
      onPublishActivity(dealer.id, newPost);
    }

    setPubTitle('');
    setPubDescription('');
    setPubPrice('');
    setAssociatedVideoUrl('');
    setVideoDuration(45);
    setUploadProgress(0);
    setPubSuccess(true);
    showToast("✓ Showroom activity submitted for review!");
    setTimeout(() => {
      setPubSuccess(false);
    }, 4000);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddReview(commentText, starRating);
    setCommentText('');
    setStarRating(5);
    showToast("✓ Thank you! Your verified scorecard has been recorded.");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const requestedInput = userInput;
    setUserInput('');
    setIsChatLoading(true);

    try {
      const inventoryText = dealerCars.map((c) => `${c.title} (Rs. ${c.price.toLocaleString()}, ${c.mileage} km, ${c.fuelType})`).join(', ');
      const historyPayload = chatMessages.map((m) => ({ role: m.sender === 'user' ? 'user' as const : 'model' as const, text: m.text }));
      
      const data = await callDealerChat(
        dealer.name,
        dealer.description,
        inventoryText,
        requestedInput,
        historyPayload
      );
      
      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: data.reply || "I'm sorry, I was unable to process that. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, replyMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: `Unable to establish persistent link with AI desk. Try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowers(dealer.followersCount);
      showToast("Unfollowed showroom");
    } else {
      setIsFollowing(true);
      setFollowers((prev) => {
        const numeric = parseFloat(prev.replace('k', ''));
        return (numeric + 0.1).toFixed(1) + 'k';
      });
      showToast("✓ Added to your favorite showrooms fleet!");
    }
  };

  const dealerCars = listings.filter((l) => l.dealerId === dealer.id);

  // Sub category filtering logic
  const filteredCars = dealerCars.filter(car => {
    if (currentCategory === 'All') return true;
    if (currentCategory === 'New Sport') return car.year >= 2023 && car.specs.horspower && parseInt(car.specs.horspower) > 400;
    if (currentCategory === 'Used') return car.mileage > 5000;
    if (currentCategory === 'Jeeps & Offroad') return car.tags.some(t => t.toLowerCase().includes('classic') || t.toLowerCase().includes('jeep'));
    if (currentCategory === 'Luxury SUVs') return car.tags.some(t => t.toLowerCase().includes('suv'));
    return true;
  });

  // Highlight featured cars
  const featuredCarsList = dealerCars.filter(c => c.featured);

  // Mock custom KPK automotive blogs
  const MOCK_BLOGS = [
    {
      id: "blog-001",
      title: "Peshawar Customs Guide: Inspecting & Importing Premium Units",
      excerpt: "An essential roadmap for sports and prestige auto buyers in Khyber Pakhtunkhwa. Understanding duties, customs verification schemes, and Peshawar district luxury tax regulations.",
      category: "Regulatory Guidelines",
      readTime: "6 min read",
      date: "June 15, 2026",
      mediaUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7L3tc6G8oV2yG6bD2-4rkocsDR68Fv03AYKixBC3Jo7z3F2dxC7l1k4a5qF2lg9sOFyDrPsAyPlvZ6lr6DN1PB651SzZXlvwyRfHsTV44M01h5rtpJZP3vkPARPkwkcD8rbWhw9phqyv92EMw-dvIsScW2rCrgiunc8yMndccSDmD5SZni8J5SJF098meLiFId3ebyei-RpMdRt4bsa4Ot5PZonvepRTSshKKpywxQZF24fSlk6DLYXf6M5s4qDFp0VhtnsirnJI"
    },
    {
      id: "blog-002",
      title: "Unleashing Extreme SUVs in KPK: Performance under Peak Heat",
      excerpt: "Engine optimization and adaptive hydraulic chassis advice for multi-terrain runs. Protect your high-displacement turbocharged motors on the rugged drives from Swat to Karakoram highways.",
      category: "Performance Maintenance",
      readTime: "4 min read",
      date: "June 12, 2026",
      mediaUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI"
    },
    {
      id: "blog-003",
      title: "Electrified Future: KPK Draft Policy on Hybrid & EV Registrations",
      excerpt: "Exploring PKR taxation reliefs, premium imports exemptions, and upcoming fast DC charging terminal corridors currently deployed near key Peshawar motorway exits.",
      category: "Policy Updates",
      readTime: "5 min read",
      date: "June 08, 2026",
      mediaUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkRyZgqdwVho1YG4awPp4toJiKUSqH05IGmlCDeY-esoL_rsDYbAkp7FPKlnXbFzCmNSSrCuHqwrXO_non2l8_jM8QfzbMxg4aYyOMfOsMhs3rpT2R8j1Gx1Mf3knoB5B5hIqUiVq3mIkhn8Bc_376AboW7iBngDAdVbQRCj0uupxH2V2RrluMiTA106UgPdQQb-5gB_A5arpTkTHIfrGwAj737v9D8LD8iIwl-xWDtVKgoKbuQ9XpeQ3NVP4I-N1tqLxV1YsPjWs"
    }
  ];

  return (
    <div className={`space-y-6 pb-28 relative min-h-screen ${theme.bgBaseDark} transition-colors duration-500`}>
      
      {/* Floating Modern Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-5 bg-gradient-to-r from-orange-500 to-amber-600 border border-white/20 px-5 py-3 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider text-white shadow-2xl z-55 flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-white animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STICKY HEADER & COMPONENT LAYOUT */}
      <section className={`bg-gradient-to-br ${theme.bgGradient} border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl select-none`}>
        
        {/* Real Dynamic Cover Image */}
        <div className="h-44 md:h-64 relative overflow-hidden bg-slate-900">
          <img 
            src={dealer.coverImage} 
            alt={dealer.name}
            className="w-full h-full object-cover opacity-30 object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          
          {/* Top sharing CTAs in the banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleShareProfile}
              className="px-3.5 py-2 bg-slate-950/70 hover:bg-slate-950 text-[#38BDF8] rounded-xl text-[10px] tracking-wider uppercase font-mono font-black border border-white/10 hover:border-[#38BDF8]/50 flex items-center gap-1.5 transition-all duration-150 shadow-md cursor-pointer"
              title="Share Showroom Profile"
            >
              <Share2 size={12} /> Share profile
            </button>
            <button
              onClick={handleSharePlatform}
              className="px-3.5 py-2 bg-[#F97316]/80 hover:bg-[#F97316] text-white rounded-xl text-[10px] tracking-wider uppercase font-mono font-black border border-orange-500/20 flex items-center gap-1.5 transition-all duration-150 shadow-md cursor-pointer"
              title="Invite to BAZAR360 Portal"
            >
              <Copy size={12} /> Share Portal
            </button>
          </div>

          {/* Operational Status Overlay */}
          <div className="absolute bottom-4 right-4 z-10 hidden md:block">
            <div className="bg-slate-950/80 border border-emerald-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-mono uppercase font-black text-white">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Open now • 9AM - 9PM</span>
            </div>
          </div>
        </div>

        {/* Brand details and counts */}
        <div className="px-6 pb-6 relative -mt-10 flex flex-col md:flex-row items-center md:items-end gap-5">
          
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#38BDF8] overflow-hidden bg-[#0F172A] flex items-center justify-center shadow-2xl relative z-10 shrink-0">
            {dealer.avatarUrl ? (
              <img
                src={dealer.avatarUrl}
                alt={dealer.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-sans font-black text-4xl text-white">
                {dealer.avatarLetter}
              </span>
            )}
          </div>

          <div className="flex-grow text-center md:text-left space-y-2 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2.5 justify-center md:justify-start">
              <h2 className="font-sans font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                {dealer.name}
              </h2>
              {/* Verification flag */}
              <span className="px-2.5 py-1 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] uppercase tracking-widest font-mono font-bold border border-[#38BDF8]/20 flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#38BDF8] animate-pulse" /> Certified Partner
              </span>
            </div>
            
            <div className="text-white/60 text-xs font-sans max-w-xl leading-relaxed">
              <AiTranslationWrapper text={dealer.subtitle} />
            </div>

            {/* Strict Socials Hiding Rule: website is completely deleted/unrendered if missing. No blank placeholders or tags. */}
            <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
              {dealer.socials?.tiktok && (
                <a
                  href={dealer.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#001c33] text-[#38BDF8] hover:text-white font-mono text-[9px] uppercase font-bold border border-white/5 flex items-center gap-1 transition-all"
                >
                  <Video size={10} /> tiktok
                </a>
              )}
              {dealer.socials?.instagram && (
                <a
                  href={dealer.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#001c33] text-[#38BDF8] hover:text-white font-mono text-[9px] uppercase font-bold border border-white/5 flex items-center gap-1 transition-all"
                >
                  <Instagram size={10} /> instagram
                </a>
              )}
              {dealer.socials?.facebook && (
                <a
                  href={dealer.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#001c33] text-[#38BDF8] hover:text-white font-mono text-[9px] uppercase font-bold border border-white/5 flex items-center gap-1 transition-all"
                >
                  <Facebook size={10} /> facebook
                </a>
              )}
              {dealer.whatsapp && (
                <a
                  href={`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase font-bold border border-emerald-500/10 flex items-center gap-1 transition-all"
                >
                  <MessageCircle size={10} /> whatsapp
                </a>
              )}
              {/* Zero-dummy check: No website output rendered here as dealer socials.website is null/undefined */}
              {dealer.socials?.website && (
                <a
                  href={dealer.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#001c33] text-[#38BDF8] hover:text-white font-mono text-[9px] uppercase font-bold border border-white/5 flex items-center gap-1 transition-all"
                >
                  <Globe size={10} /> website
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto font-mono text-xs text-center md:text-right mt-3">
            <button
              onClick={handleFollowToggle}
              className={`w-full md:w-44 py-3 px-5 font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all duration-100 cursor-pointer ${
                isFollowing
                  ? 'bg-slate-900 border border-white/15 text-white hover:bg-slate-800'
                  : `${theme.ctaBg} ${theme.ctaHoverBg} border border-white/10 text-white shadow-lg`
              }`}
            >
              {isFollowing ? '✓ Following Partner' : 'Follow Showroom'}
            </button>
            <div className="flex justify-center md:justify-end gap-4 text-white/50 text-[10px] font-bold uppercase tracking-widest pt-1">
              <span>{dealerCars.length} Cars</span>
              <span>•</span>
              <span>{followers} Fans</span>
            </div>

            {/* Showroom Theme Engine Console inside mini-websites */}
            <div className="flex flex-col items-center md:items-end gap-1 px-1 pt-2.5 border-t border-white/5 mt-1">
              <span className="text-[7.5px] uppercase font-mono font-black tracking-widest text-slate-400">
                ACTIVE VISUAL PRESCRIPT Theme
              </span>
              <span className={`text-[9px] font-mono font-black uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border ${theme.badgeBorder} ${theme.accentText}`}>
                🌌 {theme.name} Mode active
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* DYNAMIC HORIZONTAL NAVIGATION TAB LAYOUT */}
      <nav className="flex overflow-x-auto gap-2 md:gap-4 border-b border-white/5 pb-3 sticky top-14 bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl z-20 no-scrollbar font-mono text-xs uppercase tracking-wider select-none">
        
        <button
          onClick={() => setActiveTab('home')}
          className={`font-black px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
            activeTab === 'home' 
              ? `${theme.ctaBg} text-white shadow-md` 
              : 'text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          Showroom
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`font-black px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
            activeTab === 'inventory' 
              ? `${theme.ctaBg} text-white shadow-md` 
              : 'text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          Live Fleet ({dealerCars.length})
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`font-black px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
            activeTab === 'activities' 
              ? `${theme.ctaBg} text-white shadow-md` 
              : 'text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          Media & Updates
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`font-black px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
            activeTab === 'blogs' 
              ? `${theme.ctaBg} text-white shadow-md` 
              : 'text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          Insights
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`font-black px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
            activeTab === 'about' 
              ? `${theme.ctaBg} text-white shadow-md` 
              : 'text-white/55 hover:text-white hover:bg-white/5'
          }`}
        >
          Concierge & Location
        </button>

        {hasOfficialRights && (
          <button
            onClick={() => setActiveTab('hq')}
            className={`font-black px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 border border-dashed border-[#38BDF8]/40 text-[#38BDF8] flex items-center gap-1 hover:bg-[#38BDF8]/10 cursor-pointer ${
              activeTab === 'hq' ? 'bg-[#38BDF8]/25 border-solid' : ''
            }`}
          >
            ★ CEO HQ Control Deck
          </button>
        )}
      </nav>

      {/* RENDER ACTIVE TAB VIEW */}
      {activeTab === 'hq' ? (
        <ShowroomHQHub 
          dealer={dealer}
          listings={listings}
          onAddListing={onAddListing}
          currentUser={currentUser}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TAB CONTENTS: LEFT COLUMN (Lg spans 2) */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* BIO CARD */}
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-[#38BDF8] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <Award size={14} /> Executive Showroom Bio
                  </h3>
                  <div className="text-white/80 text-sm leading-relaxed font-sans">
                    <AiTranslationWrapper text={dealer.description} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 font-mono text-center">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-white font-extrabold text-lg block">{dealerCars.length}</span>
                      <span className="text-[9px] text-white/40 uppercase font-black">Live Units</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-white font-extrabold text-lg block">{followers}</span>
                      <span className="text-[9px] text-white/40 uppercase font-black">Followers</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-white font-extrabold text-lg block flex items-center justify-center gap-0.5">
                        {dealer.rating} <Star size={12} className="fill-[#F97316] text-[#F97316]" />
                      </span>
                      <span className="text-[9px] text-white/40 uppercase font-black">User Rating</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-emerald-400 font-extrabold text-lg block">100%</span>
                      <span className="text-[9px] text-white/40 uppercase font-black">Inspected</span>
                    </div>
                  </div>
                </div>

                {/* FEATURED CARS PANEL */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Sparkles size={14} className="text-[#F97316]" /> Featured Premium Vehicles
                    </h3>
                    <button 
                      onClick={() => setActiveTab('inventory')}
                      className="text-[#38BDF8] hover:text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      View all inventory <ChevronRight size={12} />
                    </button>
                  </div>

                  {featuredCarsList.length === 0 ? (
                    <div className="bg-[#1D283A]/30 border border-white/5 p-6 rounded-3xl text-center text-slate-500 font-mono text-xs uppercase">
                      No featured sports specs marked right now. View full inventory tab instead.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredCarsList.map((car) => (
                        <div
                          key={car.id}
                          onClick={() => onSelectListing(car)}
                          className={`bg-gradient-to-tr ${theme.bgGradient} border border-white/10 hover:${theme.indicatorRing} rounded-3xl overflow-hidden cursor-pointer shadow-lg duration-200 relative group transition-all`}
                        >
                          {/* Featured Ribbon */}
                          <div className={`absolute top-3 right-3 ${theme.ctaBg} text-white font-mono font-extrabold uppercase text-[7px] tracking-widest px-3 py-1 rounded-full z-10 shadow-lg border border-white/10`}>
                            ★ Elites Spec
                          </div>

                          <div className="h-44 bg-slate-950 relative overflow-hidden">
                            <img
                              src={car.imageUrl}
                              alt={car.title}
                              className="w-full h-full object-cover group-hover:scale-102 duration-300"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Stylish Overlay Checkbox Node */}
                            <div className="absolute top-2.5 left-2.5 z-20" onClick={(e) => e.stopPropagation()}>
                              <label className="flex items-center gap-1.5 bg-slate-950/90 hover:bg-slate-900 border border-white/15 px-2.5 py-1 rounded-xl cursor-pointer select-none text-[8.5px] font-mono font-bold uppercase tracking-wider text-white duration-100 shadow-md">
                                <input
                                  type="checkbox"
                                  className="accent-orange-500 w-3 h-3 rounded bg-slate-950 border-white/20 cursor-pointer"
                                  checked={selectedCompareList.some(item => item.id === car.id)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    if (isChecked) {
                                      if (selectedCompareList.length >= 2) {
                                        showToast("Comparison is limited to a maximum of 2 vehicles!");
                                        return;
                                      }
                                      setSelectedCompareList(prev => [...prev, car]);
                                    } else {
                                      setSelectedCompareList(prev => prev.filter(item => item.id !== car.id));
                                    }
                                  }}
                                />
                                <span>Compare Vehicle</span>
                              </label>
                            </div>

                            {car.verified && (
                              <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 border border-white/10 rounded-xl text-[8px] text-[#38BDF8] font-mono font-black uppercase tracking-widest">
                                Handpicked Spec
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-3">
                            <h4 className="font-sans font-extrabold text-white text-sm uppercase tracking-tight truncate leading-snug group-hover:text-[#38BDF8] transition-colors">{car.title}</h4>
                            
                            <div className="flex gap-2 text-[9px] uppercase font-mono font-bold text-white/55 flex-wrap">
                              <span className="bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">{car.mileage.toLocaleString()} KM</span>
                              <span className="bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">{car.fuelType}</span>
                              <span className="bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">{car.transmission}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                              <span className={`font-black text-base font-mono ${theme.ctaText}`}>
                                {renderPrice(car.price)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectListing(car);
                                }}
                                className={`${theme.ctaBg} ${theme.ctaHoverBg} text-white font-mono font-bold uppercase text-[9px] py-1.5 px-3.5 rounded-xl transition-all cursor-pointer`}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SHOWROOM VIDEO DESK ADVANTAGE */}
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                    <Video size={14} className="text-[#38BDF8]" /> Showroom Digital Inspection Desk
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed font-sans">
                    We process 100% video walkarounds and standard engine soundcheck clips directly onto your dynamic client chats. Request a detailed virtual video call instantly through our live representative platform.
                  </p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="py-2.5 px-4 bg-slate-950/50 hover:bg-slate-950 text-[#38BDF8] font-mono font-bold text-[9px] uppercase tracking-wider rounded-xl border border-[#38BDF8]/15 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare size={12} /> Talk with Representative Assistant
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: AVAILABLE INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                
                {/* Category Pill Filters */}
                <div className="flex flex-wrap gap-2 select-none">
                  {['All', 'New Sport', 'Used', 'Jeeps & Offroad', 'Luxury SUVs'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCurrentCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[9px] uppercase font-bold tracking-wider border duration-100 transition-all cursor-pointer ${
                        currentCategory === cat 
                          ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8] shadow-md shadow-[#38BDF8]/25'
                          : 'bg-[#121A2A] text-white/55 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Dense Grid matching category */}
                {filteredCars.length === 0 ? (
                  <div className="bg-[#1D283A]/30 border border-white/5 p-12 rounded-3xl text-center text-slate-500 font-mono text-xs uppercase space-y-2">
                    <p>No units match the selected sub-category filter right now.</p>
                    <button
                      onClick={() => setCurrentCategory('All')}
                      className="text-[#38BDF8] font-bold underline"
                    >
                      Reset category filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCars.map((car) => (
                      <div
                        key={car.id}
                        onClick={() => onSelectListing(car)}
                        className={`${theme.bgCard} border border-white/5 hover:${theme.indicatorRing} rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between`}
                      >
                        <div className="h-44 bg-[#0F172A] relative overflow-hidden shrink-0">
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className="w-full h-full object-cover group-hover:scale-101 duration-300"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Stylish Overlay Checkbox Node */}
                          <div className="absolute top-2.5 left-2.5 z-20" onClick={(e) => e.stopPropagation()}>
                            <label className="flex items-center gap-1.5 bg-slate-950/90 hover:bg-slate-900 border border-white/15 px-2.5 py-1 rounded-xl cursor-pointer select-none text-[8.5px] font-mono font-bold uppercase tracking-wider text-white duration-100 shadow-md">
                              <input
                                type="checkbox"
                                className="accent-orange-500 w-3 h-3 rounded bg-slate-950 border-white/20 cursor-pointer"
                                checked={selectedCompareList.some(item => item.id === car.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  if (isChecked) {
                                    if (selectedCompareList.length >= 2) {
                                      showToast("Comparison is limited to a maximum of 2 vehicles!");
                                      return;
                                    }
                                    setSelectedCompareList(prev => [...prev, car]);
                                  } else {
                                    setSelectedCompareList(prev => prev.filter(item => item.id !== car.id));
                                  }
                                }}
                              />
                              <span>Compare Vehicle</span>
                            </label>
                          </div>

                          <div className="absolute top-2.5 right-2.5 flex gap-1 items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareContent('listing', car.id, car.title);
                              }}
                              className="w-7 h-7 bg-slate-950/80 hover:bg-slate-950 text-white rounded-lg flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                              title="Share listing update"
                            >
                              <Share2 size={12} />
                            </button>
                            {car.verified && (
                              <div className="bg-[#0F172A]/90 px-2.5 py-1 border border-white/10 rounded-xl text-[8px] text-[#38BDF8] font-mono font-bold uppercase tracking-wider">
                                Verified
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-white text-sm truncate uppercase tracking-tight">{car.title}</h4>
                            <p className="text-[9px] text-[#38BDF8] font-mono font-semibold uppercase">
                              {car.mileage.toLocaleString()} KM • {car.fuelType} • {car.transmission}
                            </p>
                            <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2 font-sans">{car.description}</p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                            <span className={`font-black text-base font-mono ${theme.ctaText}`}>
                              {renderPrice(car.price)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectListing(car);
                              }}
                              className={`${theme.ctaBg} ${theme.ctaHoverBg} text-white font-mono font-bold uppercase text-[9px] py-1.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 duration-75`}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DAILY ACTIVITIES TAB */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                
                {/* Real-time Publisher Form */}
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl select-none">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Sparkles size={13} className="text-[#F97316]" /> Showroom Activity Publisher
                      </h3>
                      <p className="text-[10px] text-white/55 mt-0.5">Publish instant deliveries, inspection vlogs, and custom news logs directly onto your KPK feed.</p>
                    </div>
                    <div>
                      {hasOfficialRights ? (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          Official Representative
                        </span>
                      ) : (
                        <button
                          onClick={() => setSandboxBypass(!sandboxBypass)}
                          className={`text-[8px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                            sandboxBypass 
                              ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' 
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {sandboxBypass ? 'Bypass Active' : 'Sandbox Publisher'}
                        </button>
                      )}
                    </div>
                  </div>

                  {showPublisher ? (
                    <form onSubmit={handlePublishSubmit} className="space-y-4 font-sans text-xs">
                      {pubSuccess && (
                        <div className="bg-emerald-950/40 text-emerald-400 p-3 rounded-xl border border-emerald-900/40 font-mono text-[10px] uppercase">
                          ✓ Showroom Feed and Activities updated successfully!
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-white/60 block font-semibold">Post Title / Heading:</label>
                          <input
                            type="text"
                            className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8]"
                            placeholder="e.g. Delivered Prado to Mardan"
                            value={pubTitle}
                            onChange={(e) => setPubTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-white/60 block font-semibold">Activity Tag / Badge:</label>
                          <select
                            className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8]"
                            value={pubBadge}
                            onChange={(e) => setPubBadge(e.target.value)}
                          >
                            {FEED_BADGE_OPTIONS.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-white/60 block font-semibold">Pricing Tag (Optional):</label>
                          <input
                            type="text"
                            className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8]"
                            placeholder="e.g. Rs. 24,000,000"
                            value={pubPrice}
                            onChange={(e) => setPubPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/60 block font-semibold">Activity Copy / Details:</label>
                        <textarea
                          rows={2}
                          className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-[#38BDF8] resize-none"
                          placeholder="Provide details about the specs of this car, keys handover, or team congratulations update."
                          value={pubDescription}
                          onChange={(e) => setPubDescription(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      {/* Flex/Enterprise Video Upload Dropzone */}
                      <div className="space-y-2">
                        <label className="text-white/60 block font-semibold flex items-center gap-1.5">
                          <Video size={13} className="text-[#38BDF8]" /> Add Walkaround Video or Exhaust Sound Clip (Unlimited Length)
                        </label>
                        
                        <div 
                          className="border border-dashed border-white/15 bg-slate-950/40 hover:bg-slate-950/60 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative"
                          onClick={() => {
                            // Simulate selecting a video file
                            if (isUploadingVideo) return;
                            setIsUploadingVideo(true);
                            setUploadProgress(0);
                            let progress = 0;
                            const interval = setInterval(() => {
                              progress += 20;
                              if (progress >= 100) {
                                progress = 100;
                                clearInterval(interval);
                                setIsUploadingVideo(false);
                                setAssociatedVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-at-night-42294-large.mp4');
                                setVideoDuration(45 + Math.floor(Math.random() * 45)); // Simulate > 30 seconds
                                showToast("✓ High-resolution walkaround video attached successfully!");
                              }
                              setUploadProgress(progress);
                            }, 100);
                          }}
                        >
                          {associatedVideoUrl ? (
                            <div className="space-y-2 py-1 font-mono">
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider inline-block">
                                ✓ Certified Video Attached
                              </span>
                              <p className="text-xs text-white font-bold">walkaround_exahust_sound_{videoDuration}s.mp4</p>
                              <p className="text-[9px] text-gray-400">Duration: <span className="text-[#38BDF8] font-bold">{videoDuration} seconds</span> (Exceeds standard 30-second cap)</p>
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssociatedVideoUrl('');
                                  setUploadProgress(0);
                                }}
                                className="text-red-400 hover:text-red-300 text-[9px] underline uppercase tracking-tight font-bold cursor-pointer inline-block mt-1 bg-transparent border-none"
                              >
                                Remove attached clip
                              </button>
                            </div>
                          ) : isUploadingVideo ? (
                            <div className="w-full space-y-3 px-6 py-2 font-mono">
                              <span className="text-[9px] font-black text-[#38BDF8] uppercase tracking-widest block animate-pulse">
                                Uploading Walkaround Stream ({uploadProgress}%)
                              </span>
                              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#38BDF8] h-1.5 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                              <span className="text-[8px] text-white/30 block">Processing 1080p frame vectors & direct exhaust frequency maps...</span>
                            </div>
                          ) : (
                            <div className="space-y-1.5 font-mono">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40 group-hover:text-white mb-1">
                                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                              </div>
                              <p className="text-xs text-white/80 font-bold uppercase tracking-wide">Drag & Drop Walkaround Video or Click to Browse</p>
                              <p className="text-[9px] text-[#38BDF8] uppercase tracking-tight font-bold">Supports short-form & long-form exhaust notes exceeding 30 seconds</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/60 block font-semibold">Media Artwork Visual:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {FEED_STOCK_IMAGES.map((img, i) => (
                            <div
                              key={img.name}
                              onClick={() => setPubImageIndex(i)}
                              className={`border rounded-xl cursor-pointer relative overflow-hidden transition-all ${
                                pubImageIndex === i ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/25' : 'border-white/5 hover:border-white/15'
                              }`}
                            >
                              <img src={img.url} className="h-10 w-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <span className="text-[7px] text-[#38BDF8] truncate block text-center font-mono font-bold leading-none py-1 bg-[#0F172A]">
                                {img.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                          type="submit"
                          className="bg-[#F97316] text-white py-2.5 px-6 rounded-xl font-mono text-[9px] uppercase font-bold tracking-wider hover:bg-orange-600 active:scale-95 duration-75 shadow-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle size={12} /> Post Showroom Activity
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-[#0F172A] p-4 py-5 rounded-2xl text-center border border-white/5 text-xs text-white/40 space-y-2 font-mono uppercase">
                      <p>🔒 Publisher restricted to Showroom executives.</p>
                      <button
                        onClick={() => setSandboxBypass(true)}
                        className="bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 hover:bg-[#F97316]/20 px-4 py-2 rounded-xl text-[9px] uppercase font-bold duration-150 cursor-pointer"
                      >
                        Bypass and Enable Publisher
                      </button>
                    </div>
                  )}
                </div>

                {/* Secure Toggleable Administrative Moderation Deck Overlay Bar */}
                {currentUser?.role === 'Admin' && (
                  <div className="bg-gradient-to-r from-slate-900 to-[#0F172A] border border-[#F97316]/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg font-mono">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] text-[8px] font-bold uppercase tracking-wider border border-[#F97316]/20">
                        ⚡ Admin Security Shell
                      </span>
                      <h4 className="text-white text-[11px] font-bold mt-1">BAZAR360 Editorial Moderation Desk</h4>
                      <p className="text-[9px] text-gray-400">Moderate pending-approval walkthrough videos and feed bulletins instantly.</p>
                    </div>
                    
                    <button
                      onClick={() => setAdminModerationView(!adminModerationView)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                        adminModerationView 
                          ? 'bg-[#F97316] text-white border-transparent hover:bg-orange-600' 
                          : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {adminModerationView ? 'View Live Customer Feed' : '🔑 Moderate Pending Items'}
                    </button>
                  </div>
                )}

                {/* Timeline Grid */}
                <div className="space-y-6">
                  {filteredActivities.length === 0 ? (
                    <div className="bg-[#1C2538] border border-white/5 rounded-3xl p-12 text-center text-xs font-mono text-white/40 uppercase">
                      No {adminModerationView ? 'pending-approval' : 'approved'} activity posts found.
                    </div>
                  ) : (
                    filteredActivities.map((post) => {
                      const postLikes = activeLikes[post.id] || 42;
                      const commentsForPost = activeActivityComments[post.id] || [
                        { author: "Zafar Khan", text: "Truly immaculate vehicle. Congrats to the buyer!" },
                        { author: "Saad Swati", text: "Outstanding deal. Keep up the transparent work." }
                      ];

                      return (
                        <article key={post.id} className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-xl select-none">
                          
                          {/* Header metadata */}
                          <div className="p-4 px-5 flex items-center justify-between border-b border-white/5 font-mono text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 rounded-xl font-black uppercase tracking-widest">
                                {post.badge}
                              </span>
                              <span className="text-white/40 font-bold">{post.timestamp}</span>
                            </div>
                            
                            <button
                              onClick={() => handleShareContent('activity', post.id, post.title)}
                              className="text-[#38BDF8] hover:text-white flex items-center gap-1 font-bold text-[9px] uppercase cursor-pointer"
                            >
                              <Share2 size={11} /> Share post
                            </button>
                          </div>

                          {/* Instant Administrative State Tweak Controls */}
                          {post.status === 'pending_approval' && (
                            <div className="bg-amber-950/20 border-b border-amber-500/20 px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
                              <div className="text-left">
                                <span className="text-amber-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                  ⚠ [AWAITING COMPLIANCE CHECK]
                                </span>
                                <p className="text-[9px] text-gray-300 mt-0.5">Stream is currently offline. Pending admin verification.</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (onApproveActivity) {
                                    onApproveActivity(dealer.id, post.id);
                                    showToast("✓ Post instantly synchronized and published!");
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 active:scale-95 duration-75 text-amber-950 font-black px-4 py-1.5 rounded-xl text-[9px] uppercase tracking-wider cursor-pointer shadow-lg font-mono border-none"
                              >
                                🚀 Sync & Publish Now
                              </button>
                            </div>
                          )}

                          {/* Video Walkaround Stream Container */}
                          {post.videoUrl ? (
                            <div className="relative aspect-video bg-black/95 overflow-hidden border-b border-white/5 group">
                              <video 
                                src={post.videoUrl} 
                                controls 
                                poster={post.imageUrl}
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute top-3 left-3 bg-black/75 px-2.5 py-1 rounded-lg text-[8px] font-mono border border-white/10 text-[#38BDF8] font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block"></span>
                                Digital Walkaround • {post.videoDuration || 45}s
                              </div>
                            </div>
                          ) : (
                            /* Covered standard image if no video */
                            <div className="relative h-64 bg-slate-950 overflow-hidden group">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-101 duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          <div className="p-5 space-y-4 bg-gradient-to-b from-[#1E293B] to-[#121A2A]">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-base font-sans font-extrabold text-white uppercase tracking-tight">{post.title}</h3>
                            {post.price && (
                              <span className="text-[#F97316] font-black text-base font-mono whitespace-nowrap">{post.price}</span>
                            )}
                          </div>
                          <div className="text-white/70 text-xs leading-relaxed font-sans">
                            <AiTranslationWrapper text={post.description} />
                          </div>
                          
                          {/* Feed social controls */}
                          <div className="flex items-center gap-4 pt-3.5 border-t border-white/5 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                            <button 
                              onClick={() => handleLikeActivity(post.id)}
                              className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
                              <span>{postLikes} Likes</span>
                            </button>
                            <span className="text-white/20">|</span>
                            <span className="text-white/50">{commentsForPost.length} Comments</span>
                          </div>

                          {/* Collapsible comment section */}
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3 font-sans text-xs">
                            <div className="space-y-2">
                              {commentsForPost.map((c, idx) => (
                                <p key={idx} className="leading-relaxed">
                                  <span className="font-mono font-bold text-[#38BDF8] block text-[9px] uppercase tracking-wide">{c.author}:</span>
                                  <span className="text-white/85 text-[11px] font-sans">{c.text}</span>
                                </p>
                              ))}
                            </div>

                            <form onSubmit={(e) => handleAddActivityComment(post.id, e)} className="flex gap-2 pt-2 border-t border-white/5">
                              <input 
                                type="text"
                                className="flex-grow bg-[#0F172A] border border-white/10 rounded-xl p-2 text-[11px] text-white focus:outline-none focus:border-[#38BDF8]"
                                placeholder="Post custom public comment..."
                                value={newCommentInputs[post.id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewCommentInputs(prev => ({ ...prev, [post.id]: val }));
                                }}
                              />
                              <button 
                                type="submit"
                                className="bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/20 text-[#38BDF8] text-[9px] uppercase font-mono font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                              >
                                Send
                              </button>
                            </form>
                          </div>

                        </div>
                      </article>
                    );
                  })
                )}
                </div>

              </div>
            )}

            {/* TAB 4: GUIDES & NEWS (BLOGS) TAB */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#38BDF8]" /> Showroom Guides & KPK Insights
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Direct automotive publications and regional customs guidelines compiled by Peshawar's legal desks.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {MOCK_BLOGS.map((blog) => (
                    <div 
                      key={blog.id}
                      className="bg-[#1E293B] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-[#38BDF8]/40 duration-200"
                    >
                      <div className="h-44 md:h-52 bg-slate-900 relative">
                        <img 
                          src={blog.mediaUrl} 
                          alt={blog.title} 
                          className="w-full h-full object-cover opacity-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-3 py-1 rounded-xl text-[8px] font-mono font-black uppercase text-[#38BDF8] tracking-widest">
                          {blog.category}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-mono text-white/50 uppercase">
                          <span>{blog.date}</span>
                          <span>•</span>
                          <span>{blog.readTime}</span>
                        </div>

                        <h4 className="text-white font-extrabold text-base md:text-lg leading-snug uppercase tracking-tight font-sans">
                          {blog.title}
                        </h4>
                        <div className="text-white/70 text-xs leading-relaxed font-sans">
                          <AiTranslationWrapper text={blog.excerpt} />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                          <button
                            onClick={() => handleShareContent('blog', blog.id, blog.title)}
                            className="text-[#38BDF8] hover:text-white flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold cursor-pointer"
                          >
                            <Share2 size={12} /> Share guide link
                          </button>
                          
                          <a
                            href={`mailto:amjid.bisconni@gmail.com?subject=Inquiry regarding Peshawar guide: ${blog.title}`}
                            className="text-white/60 hover:text-[#38BDF8] text-[9.5px] font-mono uppercase font-black tracking-wide flex items-center gap-1 shrink-0"
                          >
                            Ask legal question <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CONTACTS & SOCIALS TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                
                {/* CONTACT DIRECT COMMUNICATION & ALTERNATE NUMBERS CARD */}
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl select-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <h3 className="text-white font-black text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Phone size={14} className="text-[#F97316]" /> Showroom Communication Channels
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans pb-2">
                    For faster response times and premium custom proposals, contact our chief sales channels directly. High speed logistics support Peshawar, Rawalpindi, Lahore, and Karachi.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
                      <div>
                        <span className="text-[8px] text-[#38BDF8] block font-black uppercase tracking-widest">Chief Support Desk (WhatsApp Enabled)</span>
                        <span className="text-sm font-extrabold text-white block">+92 315 9085086</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a 
                          href="https://wa.me/923159085086"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          WhatsApp Chat
                        </a>
                        <a 
                          href="tel:+923159085086"
                          className="bg-[#F97316] hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Phone size={11} /> Call Hotline
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Operational Hours */}
                  <div className="pt-4 border-t border-white/5 space-y-3 font-sans text-xs">
                    <h4 className="text-white/60 font-black uppercase tracking-widest font-mono text-[9px]">Operational Calendar Hours (Pakistan Standard Time)</h4>
                    <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono text-[10px] uppercase">
                      <p className="flex justify-between border-b border-white/5 pb-1">
                        <span>Monday - Saturday:</span> <span className="text-emerald-400 font-bold">9:00 AM - 9:00 PM</span>
                      </p>
                      <p className="flex justify-between border-b border-white/5 pb-1">
                        <span>Sunday Delivery:</span> <span className="text-orange-400 font-bold">Bespoke Appointment Only</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE MOCK GEOPOSITION MAP WIDGET */}
                <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <Map size={14} className="text-[#38BDF8]" /> GPS Navigation Coordinates Pin
                      </h3>
                      <p className="text-[10px] text-white/55 mt-0.5">Physical location: {dealer.location}, Khyber Pakhtunkhwa.</p>
                    </div>
                    {dealer.id === 'auto-choice-peshawar' ? (
                      <span className="bg-emerald-500/10 px-2.5 py-1 text-[8px] font-mono text-emerald-400 border border-emerald-500/20 rounded-xl uppercase font-bold select-none shrink-0">
                        Geo Verified
                      </span>
                    ) : (
                      <span className="bg-slate-950/80 px-2.5 py-1 text-[8px] font-mono text-[#38BDF8] border border-white/5 rounded-xl uppercase font-bold select-none shrink-0">
                        Pin Lat/Long: 34.0086, 71.5484
                      </span>
                    )}
                  </div>

                  {dealer.id === 'auto-choice-peshawar' ? (
                    /* Authentic Embedded Google Map Iframe */
                    <div className="w-full h-52 rounded-2xl border border-white/5 overflow-hidden bg-slate-950 relative">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.9780193666907!2d71.48557838117156!3d33.967404453093664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917f3bfdc9deb%3A0xfc1d94addfbea0d5!2sAuto%20choice!5e0!3m2!1sen!2s!4v1781725478050!5m2!1sen!2s"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    /* Beautiful Mock GPS vector radar navigation interface */
                    <div className="bg-slate-950 rounded-2xl h-52 border border-white/5 relative overflow-hidden flex items-center justify-center font-mono">
                      
                      {/* Visual grid layout matching high tech dark themes */}
                      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-60"></div>
                      <div className="absolute w-24 h-24 border border-[#38BDF8]/20 rounded-full animate-ping pointer-events-none opacity-20"></div>

                      {/* Styled Route Map vectors */}
                      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0 50 Q 150 120 300 20 Q 400 180 600 130" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                        <path d="M 50 200 L 250 100 L 450 180" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5,5" fill="transparent" />
                        <line x1="250" y1="100" x2="250" y2="40" stroke="#F97316" strokeWidth="1" strokeDasharray="3,3" />
                      </svg>

                      {/* Central radar signal pin */}
                      <div className="z-10 text-center space-y-1 relative">
                        <div className="w-4 h-4 bg-[#F97316] text-white rounded-full flex items-center justify-center mx-auto shadow-lg relative border-2 border-slate-950 animate-pulse">
                          <span className="absolute w-8 h-8 rounded-full bg-orange-500 animate-ping opacity-25"></span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-black text-white block bg-slate-950/90 border border-white/10 px-2 py-0.5 rounded shadow">
                          {dealer.name} Showroom
                        </span>
                        <span className="text-[7.5px] text-white/50 block font-bold">{dealer.location}</span>
                      </div>

                      {/* Bottom map scale overlay */}
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 border border-white/5 p-1.5 px-2.5 rounded-xl text-[7px] text-white/40 block leading-tight">
                        <span>RADAR SCALE: RANGE 500m</span>
                        <span className="block mt-0.5 text-[#38BDF8]">COMPASS: HEADING NORTH</span>
                      </div>
                    </div>
                  )}

                  <a 
                    href={dealer.id === 'auto-choice-peshawar' 
                      ? "https://maps.google.com/?q=Auto+choice+Alamas+Car+Village+Ring+Road+Peshawar"
                      : `https://maps.google.com/?q=34.0086,71.5484`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-950 border border-white/10 hover:border-[#38BDF8] text-[#38BDF8] hover:text-white py-3 rounded-2xl text-[9.5px] uppercase font-mono font-bold tracking-widest flex items-center justify-center gap-1.5 duration-150 cursor-pointer"
                  >
                    Launch Google Maps Navigation <ExternalLink size={12} />
                  </a>
                </div>

              </div>
            )}

          </div>

          {/* TAB CONTENTS: RIGHT COLUMN / SIDEPANEL */}
          <div className="lg:col-span-1 space-y-6 select-none font-mono text-xs">
            
            {/* IN-APP PERSISTENT PORTAL NAVIGATION SHORTCUT WITH FIRESTORE SPEC TRIGGER */}
            <div className="bg-[#1E293B] border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider block border-b border-white/5 pb-2.5">Dealership Highlights</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl border border-[#38BDF8]/10 shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Scale Network</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed font-sans">Serving Pakistan with dedicated premium logistics & KPK regional trade channels.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl border border-[#38BDF8]/10 shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Trust & Delivery</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed font-sans">Secure handovers certified under comprehensive 111-point vehicle checks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#38BDF8]/10 text-[#38BDF8] p-2.5 rounded-xl border border-[#38BDF8]/10 shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-white tracking-widest leading-relaxed">Regulatory Checks</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed font-sans">Full compliance with customs documentation and KPK luxury tax protocols.</p>
                  </div>
                </div>
              </div>

              {/* Developer Spec button */}
              <button 
                onClick={() => setShowDeveloperSchema(!showDeveloperSchema)}
                className="w-full bg-slate-950 text-white/60 hover:text-[#38BDF8] border border-white/5 hover:border-white/15 py-2 rounded-xl text-[8.5px] uppercase font-bold tracking-wide transition-all mt-4 cursor-pointer"
              >
                {showDeveloperSchema ? "▼ Hide Firestore Schema Specs" : "📁 Show Showrooms Firestore Schema"}
              </button>
            </div>

            {/* COLLAPSIBLE DEV SCHEMA DECK PANEL: Fulfills Rule #1 for strict document schemas */}
            {showDeveloperSchema && (
              <div className="bg-[#050b16] border border-[#38BDF8]/35 p-5 rounded-3xl space-y-4 shadow-2xl animate-fade-in text-white tracking-wide">
                <span className="text-[8.5px] bg-[#38BDF8]/15 text-[#38BDF8] px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                  Database Schema Deck
                </span>
                <p className="text-[9.5px] text-slate-400 font-sans leading-relaxed">
                  The complete production-grade Firestore JSON document structure mapped to the primary <code className="text-white">showrooms</code> collection for tenant allocation:
                </p>
                <div className="bg-[#000]/60 p-3.5 rounded-2xl border border-white/5 font-mono text-[9px]/relaxed text-emerald-400 overflow-x-auto no-scrollbar max-h-80 overflow-y-auto">
                  <pre>{JSON.stringify(FIRESTORE_SCHEMA_BLUEPRINT, null, 2)}</pre>
                </div>
                <p className="text-[8px] text-white/35 font-mono uppercase">
                  ✓ Matches all architect privilege rules and metadata validation.
                </p>
              </div>
            )}

            {/* LIVE CHAT INTEGRATION ASSISTANT */}
            <div className="bg-[#1E293B] border border-white/5 p-5 rounded-3xl text-center space-y-3 shadow-xl">
              <p className="text-[10px] text-white/55 uppercase font-bold tracking-wider">Have customized vehicle questions?</p>
              <button
                onClick={() => setShowChat(true)}
                className="bg-[#0F172A] border border-white/10 hover:border-[#38BDF8] text-[#38BDF8] w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-100 cursor-pointer"
              >
                <MessageSquare size={13} /> Talk to assistant bot
              </button>
            </div>

          </div>

        </div>
      )}

      {/* FIXED FOOTER CONTROLS ROW */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-[#1E293B]/95 border-t border-white/15 p-4 flex justify-center gap-4 z-40 backdrop-blur-md shadow-2xl font-mono text-xs uppercase select-none">
        <button
          onClick={() => setShowDialer(true)}
          className="w-full max-w-xs py-3.5 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg cursor-pointer tracking-wider text-[10.5px]"
        >
          <Phone size={14} /> Call Showroom Desk
        </button>

        <button
          onClick={() => setShowChat(true)}
          className="w-full max-w-xs py-3.5 px-6 border border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all bg-[#0F172A] cursor-pointer tracking-wider text-[10.5px]"
        >
          <MessageSquare size={14} /> Live AI Assistant
        </button>
      </div>

      {/* CALL DIALER POPUP MODAL */}
      {showDialer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-55 p-4 font-mono select-none">
          <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-6 text-center shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F97316] opacity-10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center mx-auto">
                <Phone size={24} className="animate-bounce" />
              </div>
              <h3 className="font-extrabold text-white text-base uppercase tracking-wider">Auto Choice Communications</h3>
              <p className="text-white/50 text-[10px] font-sans">Direct secure dialing paths mapped by BAZAR360 routing</p>
            </div>

            <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 text-left space-y-3.5 shadow-inner">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[8px] uppercase tracking-widest text-[#38BDF8] font-bold block">Hotline Line 1 (Malak Mazhar)</span>
                <a href="tel:03159085086" className="text-lg font-black text-white hover:text-[#38BDF8] block">03159085086</a>
              </div>
              <div className="border-b border-white/5 pb-2">
                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">Logistics Line 2 (Alternate Desk)</span>
                <a href="tel:03469085032" className="text-sm font-black text-white hover:text-slate-200 block">03469085032</a>
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">Support Line 3 (Cargo Shipments)</span>
                <a href="tel:03459085086" className="text-sm font-black text-white hover:text-slate-200 block">03459085086</a>
              </div>
            </div>

            <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider">
              <button
                onClick={() => setShowDialer(false)}
                className="flex-1 bg-red-600/15 border border-red-500/20 hover:bg-red-600/30 text-red-400 py-3 rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                Close Dial Board
              </button>
              <a
                href={`tel:${dealer.phone}`}
                onClick={() => setShowDialer(false)}
                className="flex-1 bg-[#F97316] hover:bg-orange-605 text-white py-3 rounded-xl text-center active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-orange-950/25"
              >
                Call Hotline Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER MODAL: ASSISTANT BOT CHAT */}
      {showChat && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-55 select-none">
          <div className="bg-[#0F172A] border-l border-white/5 w-full max-w-md h-full flex flex-col relative shadow-2xl font-sans">
            
            {/* Header */}
            <div className="p-4 px-5 border-b border-white/5 bg-[#1E293B] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#1E293B] font-black text-xs flex items-center justify-center border-2 border-[#38BDF8]">
                  {dealer.avatarLetter}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-tight leading-zero">{dealer.name} Desk</h3>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono uppercase font-black mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Assistant Representative Live
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/50 hover:text-white text-[9px] uppercase tracking-wider font-mono font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Close Desk
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-950">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {msg.sender !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-white text-[#0F172A] font-extrabold text-[9px] flex items-center justify-center shrink-0 self-end border border-white/15">
                      {dealer.avatarLetter}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 px-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#F97316] text-white rounded-br-none'
                        : 'bg-[#1E293B] border border-white/5 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="font-sans">{msg.text}</p>
                    <span className="text-[8px] text-white/40 mt-1.5 block text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-2 mr-auto max-w-[80%] items-center text-white/50 pl-8">
                  <div className="flex space-x-1 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-tight">Executive bot typing...</span>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1E293B] flex gap-2 shrink-0">
              <input
                className="flex-grow bg-[#0F172A] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#38BDF8] font-sans"
                placeholder={`Ask about alternate numbers, Swat guidance, or sport deliveries...`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 text-white p-3 rounded-xl flex items-center justify-center transition-all shadow cursor-pointer shrink-0"
                disabled={isChatLoading || !userInput.trim()}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING VEHICLE COMPARISON DRAWER SLOT */}
      {selectedCompareList.length > 0 && (
        <div className="fixed bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-45 w-[92%] max-w-lg bg-slate-900/60 border border-white/20 rounded-3xl p-4 shadow-2xl backdrop-blur-xl select-none animate-slideUp transition-all duration-300">
          <div className="flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${theme.ctaBg} text-white font-extrabold text-[11px] flex items-center justify-center`}>
                {selectedCompareList.length}
              </div>
              <div>
                <h5 className="text-[10.5px] font-black uppercase tracking-wider text-white">Compare Fleet</h5>
                <p className="text-[8px] text-[#38BDF8] uppercase tracking-tight">max 2 vehicles</p>
              </div>
            </div>

            {/* Selected vehicle thumbnails and reset buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {selectedCompareList.map(car => (
                <div key={car.id} className="relative group/thumb shrink-0">
                  <img
                    src={car.imageUrl}
                    alt="car thumb"
                    className="w-10 h-7 rounded-md object-cover border border-white/15"
                  />
                  <button
                    onClick={() => setSelectedCompareList(prev => prev.filter(item => item.id !== car.id))}
                    className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-650 bg-red-605 bg-red-600 hover:bg-red-500 border border-[#0F172A] text-white text-[8px] flex items-center justify-center font-black cursor-pointer shadow-md"
                    title="Remove unit"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Empty slots placeholders */}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="w-10 h-7 rounded-md border border-dashed border-white/10 flex items-center justify-center bg-slate-950/40 text-[9px] text-white/20 shrink-0 font-bold">
                  Slot
                </div>
              ))}
            </div>

            {/* Compare CTA Action button */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (selectedCompareList.length < 2) {
                    showToast("Please choose 2 vehicles to begin comparison!");
                    return;
                  }
                  setIsComparing(true);
                }}
                className={`px-3 py-2 ${theme.ctaBg} ${theme.ctaHoverBg} text-white font-black text-[9px] rounded-xl uppercase tracking-wider transition-all active:scale-95 duration-100 shadow-md cursor-pointer`}
              >
                Compare ({selectedCompareList.length}/2)
              </button>
              <button
                onClick={() => setSelectedCompareList([])}
                className="text-white/45 hover:text-white px-2 py-2 border border-white/5 rounded-xl text-[9px] cursor-pointer"
                title="Clear choice slot"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMMERSIVE FULL-SCREEN VEHICLE SPECIFICATION COMPARISON BOARD */}
      {isComparing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-55 p-4 md:p-8 font-sans select-none overflow-y-auto">
          <div className="bg-[#121A2A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 md:p-8 space-y-6 relative flex flex-col no-scrollbar">
            
            {/* Header controls row */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 font-mono shrink-0">
              <div className="space-y-1">
                <span className="text-[7.5px] uppercase font-black text-[#38BDF8] tracking-widest block">BAZAR360 Premium Comparison Arena</span>
                <h4 className="text-white font-black uppercase text-base tracking-tight">Side-by-Side Specifications Battle</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const compareUrl = `https://bazar360.online/dealers/${dealer.id}/compare?ids=${selectedCompareList.map(item => item.id).join(',')}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `BAZAR360 Specifications Matchup`,
                          text: `Match up ${selectedCompareList.map(c => c.title).join(' vs ')} in KPK dynamic storefront!`,
                          url: compareUrl
                        });
                      } catch (err) {}
                    } else {
                      try {
                        await navigator.clipboard.writeText(compareUrl);
                        const textPayload = `Take a look at this Peshawar Sports matchup:\n\n${selectedCompareList.map(c => `🏎️ ${c.title} (Rs. ${c.price.toLocaleString()})`).join('\n')}\n\nSpecs Link: ${compareUrl}`;
                        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(textPayload)}`, '_blank');
                        showToast("✓ Copied specs lineup and launched WhatsApp!");
                      } catch (err) {
                        showToast("Share failed");
                      }
                    }
                  }}
                  className="text-white/40 hover:text-[#38BDF8] border border-white/5 bg-slate-900/40 p-2 px-3 rounded-xl text-[10px] font-mono uppercase font-black tracking-widest flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Share2 size={12} /> Share Battle
                </button>
                <button
                  onClick={() => setIsComparing(false)}
                  className="text-white/50 hover:text-white bg-red-650 bg-red-600/15 border border-red-500/20 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase cursor-pointer"
                >
                  Close Arena
                </button>
              </div>
            </div>

            {/* Specs matching Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2 font-mono text-center overflow-x-auto min-w-[550px] no-scrollbar">
              
              {/* Row 1: Images */}
              <div className="text-left font-bold text-xs uppercase text-[#38BDF8] flex items-center">
                Vehicle Spec Match
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="relative bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                  <img
                    src={car.imageUrl}
                    alt={car.title}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      const newList = selectedCompareList.filter(item => item.id !== car.id);
                      setSelectedCompareList(newList);
                      if (newList.length < 2) {
                        setIsComparing(false);
                        showToast("Exited comparison board: Less than 2 vehicles chosen.");
                      }
                    }}
                    className="absolute top-2.5 right-2.5 bg-red-650 bg-red-600 hover:bg-red-500 text-white rounded-full w-4.5 h-4.5 text-[8px] flex items-center justify-center font-black cursor-pointer shadow-lg border border-slate-950"
                    title="Remove unit"
                  >
                    ✕
                  </button>
                  <h5 className="text-[10px] font-bold text-white uppercase truncate tracking-tight pt-1.5 px-1">{car.title}</h5>
                </div>
              ))}
              {/* Fill empty slots with placeholder cells to sustain 3 columns alignment */}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="bg-slate-950/20 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center h-28 text-white/10 text-[9px] font-bold uppercase">
                  Empty Slot
                </div>
              ))}

              {/* Row 2: Ex-Showroom Price Demand */}
              <div className="text-left font-extrabold text-[8.5px] tracking-widest uppercase text-white/55 border-b border-white/5 py-4 flex items-center gap-1">
                <Award size={12} className="text-[#38BDF8]" /> Ex-Showroom Ask
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="border-b border-white/5 py-4 flex flex-col justify-center items-center">
                  <span className={`${theme.ctaText} font-black text-xs md:text-sm`}>
                    {renderPrice(car.price)}
                  </span>
                  <span className="text-[7.5px] text-white/30 uppercase mt-0.5">Customs Verified</span>
                </div>
              ))}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="border-b border-white/5 py-4 flex items-center justify-center text-white/10">-</div>
              ))}

              {/* Row 3: Model Year */}
              <div className="text-left font-extrabold text-[8.5px] tracking-widest uppercase text-white/55 border-b border-white/5 py-4 flex items-center gap-1">
                <Sparkles size={12} className="text-[#38BDF8]" /> Model Year
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="border-b border-white/5 py-4 flex items-center justify-center font-black text-sm text-white">
                  {car.year}
                </div>
              ))}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="border-b border-white/5 py-4 flex items-center justify-center text-white/10">-</div>
              ))}

              {/* Row 4: Engine Displacement Configuration */}
              <div className="text-left font-extrabold text-[8.5px] tracking-widest uppercase text-white/55 border-b border-white/5 py-4 flex items-center gap-1">
                <Sliders size={12} className="text-[#38BDF8]" /> Displacement
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="border-b border-white/5 py-4 flex flex-col justify-center items-center">
                  <span className="text-emerald-400 font-extrabold text-xs">
                    {car.specs?.horspower || "450 HP"}
                  </span>
                  <span className="text-[8px] text-white/40 uppercase mt-0.5">
                    {car.specs?.engineSize || "3.0L Turbo"}
                  </span>
                </div>
              ))}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="border-b border-white/5 py-4 flex items-center justify-center text-white/10">-</div>
              ))}

              {/* Row 5: Chassis Classification Type */}
              <div className="text-left font-extrabold text-[8.5px] tracking-widest uppercase text-white/55 border-b border-white/5 py-4 flex items-center gap-1">
                <Globe size={12} className="text-[#38BDF8]" /> Chassis Style
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="border-b border-white/5 py-4 flex flex-col justify-center items-center">
                  <span className="text-white font-extrabold text-[10.5px]">
                    {car.transmission}
                  </span>
                  <span className="text-[7.5px] text-[#38BDF8] uppercase tracking-wide font-black mt-0.5">
                    {car.fuelType} Profile
                  </span>
                </div>
              ))}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="border-b border-white/5 py-4 flex items-center justify-center text-white/10">-</div>
              ))}

              {/* Row 6: Verification Index */}
              <div className="text-left font-extrabold text-[8.5px] tracking-widest uppercase text-white/55 border-b border-white/5 py-4 flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#38BDF8]" /> Verification Index
              </div>
              {selectedCompareList.map(car => (
                <div key={car.id} className="border-b border-white/5 py-4 flex flex-col items-center justify-center">
                  <span className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider block">
                    {car.verified ? "100% Certified" : "Approved Fleet"}
                  </span>
                  <span className="text-[7px] text-white/30 uppercase mt-0.5 font-mono">Bargain Approved</span>
                </div>
              ))}
              {Array.from({ length: 2 - selectedCompareList.length }).map((_, i) => (
                <div key={i} className="border-b border-white/5 py-4 flex items-center justify-center text-white/10">-</div>
              ))}

            </div>

            <div className="flex justify-end gap-3 shrink-0 pt-4">
              <button
                onClick={() => {
                  setSelectedCompareList([]);
                  setIsComparing(false);
                  showToast("Comparison cleared");
                }}
                className="px-5 py-3 border border-white/5 bg-slate-900/30 hover:bg-slate-950 text-white/60 hover:text-white rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest cursor-pointer"
              >
                Clear Matchup list
              </button>
              <button
                onClick={() => setIsComparing(false)}
                className={`px-6 py-3 ${theme.ctaBg} ${theme.ctaHoverBg} text-white rounded-xl font-mono text-[10px] uppercase font-black tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer`}
              >
                Return to Showroom
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
