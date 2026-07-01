import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Star, 
  Building2, 
  Users, 
  Car, 
  ChevronRight, 
  PlusCircle,
  Quote,
  CheckCircle2,
  ChevronDown,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
  Mail,
  Smartphone,
  Info,
  PhoneCall,
  Check,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { UserProfile } from '../lib/dbService';
import { VehicleCard } from './VehicleCard';
import { VehicleSkeletonCard } from './VehicleSkeletonCard';

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  dbLoading?: boolean;
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentCategory?: string;
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
}

const HERO_SLIDES = [
  {
    id: 'slide-mg',
    brand: 'MG MOTORS PAKISTAN',
    title: 'MG HS Essence Redefines SUV Comfort',
    subtitle: 'British automotive heritage meets modern safety features and luxury interiors.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
    color: '#EF4444'
  },
  {
    id: 'slide-audi',
    brand: 'AUDI PAKISTAN',
    title: 'Audi e-tron GT Progressive luxury',
    subtitle: 'Experience fully electric sports performance with zero emission engineering.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
    color: '#38BDF8'
  },
  {
    id: 'slide-suzuki',
    brand: 'SUZUKI PAKISTAN',
    title: 'Virtual 360° Showroom Experience',
    subtitle: 'Browse the entire new Suzuki inventory online from the comfort of your couch.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    color: '#10B981'
  }
];

const BODY_TYPES = [
  { id: 'sedan', name: 'Sedan', icon: '🚗', desc: 'Premium 3-box luxury passenger cars with excellent fuel economy.' },
  { id: 'suv', name: 'SUV', icon: '🚙', desc: 'Robust multi-terrain family utility vehicles with spacious cabins.' },
  { id: 'hatchback', name: 'Hatchback', icon: '🚘', desc: 'Compact, agile, and fuel-efficient commuters perfect for cities.' },
  { id: 'crossover', name: 'Crossover', icon: '🏎️', desc: 'Sleek, high-riding utility vehicles with sporty performance.' },
  { id: 'coupe', name: 'Coupe', icon: '🏎️', desc: 'Two-door high-performance sports models with aerodynamic lines.' },
  { id: 'pickup', name: 'Pickup Truck', icon: '🛻', desc: 'Rugged open-bed loading utility vehicles with immense power.' },
  { id: 'van', name: 'Minivan / Carrier', icon: '🚐', desc: 'Multi-row passenger carriers built for supreme family comfort.' }
];

const POPULAR_BRANDS = [
  { name: 'Suzuki', logo: '🚙' },
  { name: 'Toyota', logo: '🚗' },
  { name: 'Honda', logo: '🏎️' },
  { name: 'Kia', logo: '精' },
  { name: 'Hyundai', logo: '🚘' },
  { name: 'Changan', logo: '🚘' },
  { name: 'MG', logo: '🚗' },
  { name: 'Haval', logo: '🚙' },
  { name: 'Audi', logo: '🏎️' },
  { name: 'BMW', logo: '🏎️' },
  { name: 'Mercedes-Benz', logo: '🚘' },
  { name: 'Nissan', logo: '🏎️' },
  { name: 'BYD', logo: '⚡' },
  { name: 'Tesla', logo: '⚡' },
  { name: 'Lexus', logo: '🚗' },
  { name: 'Porsche', logo: '🏎️' },
  { name: 'Isuzu', logo: '🛻' },
  { name: 'Mitsubishi', logo: '🛻' },
  { name: 'Peugeot', logo: '🚗' },
  { name: 'Volvo', logo: '🛡️' },
  { name: 'Land Rover', logo: '🚙' },
  { name: 'Jeep', logo: '🚙' },
  { name: 'Ford', logo: '🚙' },
  { name: 'Chevrolet', logo: '🚗' }
];

function renderInlineFallback(name: string) {
  switch (name) {
    case 'Toyota':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="6" stroke="#EF4444" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="6" ry="6" stroke="#EF4444" strokeWidth="1.5" />
          <ellipse cx="12" cy="10" rx="3" ry="4" stroke="#EF4444" strokeWidth="1.5" />
        </svg>
      );
    case 'Honda':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="4" stroke="#38BDF8" strokeWidth="2" />
          <path d="M7 6v12M17 6v12M7 12h10" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'Suzuki':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M17 5H9.5L7 9.5l7.5 5L17 19H7.5" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Hyundai':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="7" stroke="#3B82F6" strokeWidth="2" transform="rotate(-15 12 12)" />
          <path d="M8 8v8M16 8v8M8 12h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" transform="rotate(-15 12 12)" />
        </svg>
      );
    case 'Kia':
    case 'KIA':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 60 20" fill="none">
          <path d="M5 2l7 8-7 8M14 2v16M22 18l6-16 6 16M25 12h6" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'MG':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="4" stroke="#EF4444" strokeWidth="2" />
          <text x="12" y="14" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MG</text>
        </svg>
      );
    case 'Audi':
      return (
        <svg className="w-14 h-8 animate-fade-in" viewBox="0 0 40 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="16" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="24" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="32" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
        </svg>
      );
    case 'BMW':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="#94A3B8" strokeWidth="1" />
          <path d="M12 6a6 6 0 016 6h-6zM12 12v6a6 6 0 01-6-6z" fill="#3B82F6" />
        </svg>
      );
    case 'Mercedes-Benz':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2" />
          <path d="M12 3v9M12 12l7 5M12 12L5 17" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'Nissan':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="2" y="10" width="20" height="4" rx="1" fill="#94A3B8" />
        </svg>
      );
    case 'Ford':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <ellipse cx="20" cy="10" rx="18" ry="8" stroke="#3B82F6" strokeWidth="2" />
          <text x="20" y="13" fill="#3B82F6" fontSize="7" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">Ford</text>
        </svg>
      );
    case 'Chevrolet':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <path d="M15 6h10v2h4v4h-4v2H15v-2h-4V8h4V6z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        </svg>
      );
    case 'BYD':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <rect x="2" y="4" width="36" height="12" rx="3" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="20" y="12" fill="#3B82F6" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">BYD</text>
        </svg>
      );
    case 'Tesla':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M12 4c2.5 0 4.5 1.5 5 3.5h-10C7.5 5.5 9.5 4 12 4zM12 8c0 3.5-1.5 6.5-3.5 8h7c-2-1.5-3.5-4.5-3.5-8zM12 17c1.5 1.5 2.5 2.5 3 3.5H9c.5-1 1.5-2 3-3.5z" fill="#EF4444" />
        </svg>
      );
    case 'Lexus':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="7" stroke="#94A3B8" strokeWidth="2" />
          <path d="M6 16V8h3s3 0 3 2.5-1.5 2.5-3 2.5h-3M9 13l5 3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Porsche':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h12l-2 12-4 4-4-4L6 4z" stroke="#F59E0B" strokeWidth="2" />
          <text x="12" y="12" fill="#F59E0B" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PORSCHE</text>
        </svg>
      );
    case 'Isuzu':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <text x="20" y="13" fill="#EF4444" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">ISUZU</text>
        </svg>
      );
    case 'Mitsubishi':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l4 7h-8zM16 9l4 7h-8zM8 9l-4 7h8z" fill="#EF4444" />
        </svg>
      );
    case 'Changan':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <path d="M7 9l5 6 5-6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Haval':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <rect x="2" y="4" width="36" height="12" rx="2" fill="#EF4444" />
          <text x="20" y="12" fill="#FFFFFF" fontSize="6" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">HAVAL</text>
        </svg>
      );
    case 'Peugeot':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M12 6a6 6 0 016 6h-6z" fill="#3B82F6" />
        </svg>
      );
    case 'Volvo':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="13" r="7" stroke="#3B82F6" strokeWidth="2" />
          <path d="M16 8l4-4M15 4h5v5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Land Rover':
      return (
        <svg className="w-14 h-8 animate-fade-in" viewBox="0 0 44 20" fill="none">
          <ellipse cx="22" cy="10" rx="20" ry="9" stroke="#10B981" strokeWidth="2" />
          <text x="22" y="13" fill="#10B981" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ROVER</text>
        </svg>
      );
    case 'Jeep':
      return (
        <svg className="w-12 h-6 animate-fade-in" viewBox="0 0 40 20" fill="none">
          <text x="20" y="14" fill="#94A3B8" fontSize="10" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">Jeep</text>
        </svg>
      );
    case 'Mazda':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="2" />
          <path d="M5 10c3 2 5 5 7 5s4-3 7-5c-2 2-4 3-7 3s-5-1-7-3z" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'DFSK':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
          <path d="M8 8h4a3 3 0 010 6H8V8z" stroke="#EF4444" strokeWidth="2" />
          <path d="M14 14l3 3" stroke="#EF4444" strokeWidth="2" />
        </svg>
      );
    case 'Proton':
      return (
        <svg className="w-10 h-10 animate-fade-in" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
          <path d="M9 15l4-6 3 4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return <span className="text-2xl">🚗</span>;
  }
}

function BrandLogo({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  const slug = name.toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

  // Fast loading jsDelivr CDN for filippofonseca/car-logos
  const imageUrl = `https://cdn.jsdelivr.net/gh/filippofonseca/car-logos@master/logos/svg/${slug}.svg`;

  if (failed) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        {renderInlineFallback(name)}
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
      <img
        src={imageUrl}
        alt={`${name} official logo`}
        className="w-10 h-10 object-contain dark:brightness-110 transition-all duration-200"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function renderBrandLogo(name: string) {
  return <BrandLogo name={name} />;
}

export default function HomeView({
  dealers,
  listings,
  setTab,
  setSelectedCategory,
  setSearchQuery,
  onSelectDealer,
  onSelectListing,
  onToggleCompare,
  compareList = [],
  currentUser,
  lang = 'en',
  dbLoading = false
}: HomeViewProps) {
  // Modular toggle flags to hide unrequested sections as instructed
  const ENABLE_TRUST_METRICS = false;
  const ENABLE_DOWNLOAD_APP = false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Fallback beautiful slides if dynamic inventory is empty
  const fallbackSlides = useMemo<CarListing[]>(() => [
    {
      id: 'fallback-mg',
      title: 'MG HS Essence 1.5 Turbo',
      make: 'MG',
      model: 'HS Essence',
      year: 2023,
      price: 8200000,
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
      registrationCity: 'Islamabad',
      mileage: 12000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      featured: true,
      verified: true,
      dealerId: 'dealer-mg',
      description: 'The MG HS Essence 1.5 Turbo is a premium compact crossover SUV.',
      createdAt: new Date().toISOString(),
      tags: ['Premium', 'SUV', 'Verified'],
      specs: {
        color: 'White',
        engineSize: '1.5L Turbo',
        horspower: '160 hp',
        regionalSpecs: 'Local'
      },
      condition: 'Used',
      engineCC: 1500,
      exteriorColor: 'White',
      bodyCondition: 'Total Genuine',
      documentType: 'Smart Card',
      tokenTaxPaid: true
    },
    {
      id: 'fallback-audi',
      title: 'Audi e-tron GT Quattro',
      make: 'Audi',
      model: 'e-tron GT',
      year: 2022,
      price: 38500000,
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
      images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200'],
      registrationCity: 'Lahore',
      mileage: 8000,
      fuelType: 'Electric',
      transmission: 'Automatic',
      featured: true,
      verified: true,
      dealerId: 'dealer-audi',
      description: 'The spectacular pure electric grand tourer with Quattro all-wheel drive.',
      createdAt: new Date().toISOString(),
      tags: ['Electric', 'Premium', 'Verified'],
      specs: {
        color: 'Tactical Green',
        engineSize: 'Dual Electric Motors',
        horspower: '522 hp',
        regionalSpecs: 'Imported'
      },
      condition: 'Used',
      engineCC: 0,
      exteriorColor: 'Tactical Green',
      bodyCondition: 'Total Genuine',
      documentType: 'Smart Card',
      tokenTaxPaid: true
    }
  ], []);

  // Use live Firebase listings that are featured or premium. Fallback to pre-packaged slides if empty.
  const activeSlides = useMemo<CarListing[]>(() => {
    const approvedOnly = listings.filter(l => l.approved !== false && !l.isSold);
    const featured = approvedOnly.filter(l => l.featured || l.price >= 4000000);
    if (featured.length > 0) return featured.slice(0, 5);
    if (approvedOnly.length > 0) return approvedOnly.slice(0, 5);
    return fallbackSlides;
  }, [listings, fallbackSlides]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs. ${(price / 10000000).toFixed(2)} Crore`;
    }
    return `Rs. ${(price / 100000).toFixed(1)} Lakh`;
  };

  // Advanced Smart Search States
  const [localQuery, setLocalQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'used' | 'new'>('all');
  const [searchCity, setSearchCity] = useState<string>('All');
  const [searchPrice, setSearchPrice] = useState<string>('All');
  const [searchTransmission, setSearchTransmission] = useState<string>('All');
  const [searchFuel, setSearchFuel] = useState<string>('All');
  const [searchYear, setSearchYear] = useState<string>('All');
  const [searchSeller, setSearchSeller] = useState<'all' | 'showroom' | 'individual'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic Tabs (Featured, Latest, Premium)
  const [inventoryTab, setInventoryTab] = useState<'featured' | 'latest' | 'premium'>('featured');



  // 200-Point Inspection Booking State
  const [inspectName, setInspectName] = useState('');
  const [inspectPhone, setInspectPhone] = useState('');
  const [inspectCarModel, setInspectCarModel] = useState('');
  const [inspectCity, setInspectCity] = useState('Peshawar');
  const [inspectDate, setInspectDate] = useState('');
  const [inspectSuccess, setInspectSuccess] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // FAQ Active State
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Auto Slider Effect
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  // Filter listings based on inventory tab
  const filteredInventoryListings = useMemo(() => {
    const approvedOnly = listings.filter(l => l.approved !== false);
    if (inventoryTab === 'featured') {
      const feat = approvedOnly.filter(l => l.featured);
      return feat.length > 0 ? feat.slice(0, 6) : approvedOnly.slice(0, 6);
    } else if (inventoryTab === 'latest') {
      return approvedOnly.slice().sort((a, b) => b.year - a.year).slice(0, 6);
    } else {
      // Premium listings (over 50 Lakhs / 5M PKR)
      const prem = approvedOnly.filter(l => l.price >= 5000000);
      return prem.length > 0 ? prem.slice(0, 6) : approvedOnly.slice().sort((a, b) => b.price - a.price).slice(0, 6);
    }
  }, [listings, inventoryTab]);



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let combined = localQuery.trim();
    if (searchCity !== 'All') combined += ' ' + searchCity;
    if (searchType !== 'all') combined += ' ' + searchType;
    if (searchPrice !== 'All') combined += ' ' + searchPrice;
    if (searchTransmission !== 'All') combined += ' ' + searchTransmission;
    if (searchFuel !== 'All') combined += ' ' + searchFuel;
    if (searchYear !== 'All') combined += ' ' + searchYear;
    if (searchSeller !== 'all') combined += ' ' + searchSeller;
    
    setSearchQuery(combined);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory(brandName);
    setSearchQuery(brandName);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBodyTypeClick = (bodyType: string) => {
    setSelectedCategory(bodyType);
    setSearchQuery(bodyType);
    setTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectName || !inspectPhone || !inspectCarModel) return;
    setInspectSuccess(true);
    setTimeout(() => {
      setInspectSuccess(false);
      setInspectName('');
      setInspectPhone('');
      setInspectCarModel('');
    }, 5000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterSuccess(false);
      setNewsletterEmail('');
    }, 5000);
  };

  const isRtl = lang === 'ur';

  // Translation mapping
  const t = {
    en: {
      tagline: "★ PAKISTAN'S PREMIER AUTOMOTIVE PORTAL",
      searchHeader: "Discover Premium Vehicles",
      postAdBadge: "⚡ List In 60 Seconds",
      whySubtitle: "Redefining the automotive classified experience through transparency, security, and digital tools.",
      statsHeading: "BAZAR360 Trust Metrics",
      downloadHeading: "Download BAZAR360 App",
      downloadText: "Get real-time biometrics, premium inspect tools, and live vehicle pricing trackers on the go."
    },
    ur: {
      tagline: "★ پاکستان کا ممتاز ترین آٹوموٹو پورٹل",
      searchHeader: "شاندار گاڑیاں تلاش کریں",
      postAdBadge: "اشتہار صرف 60 سیکنڈز میں",
      whySubtitle: "سیکیورٹی، شفافیت اور جدید ترین ٹیکنالوجی کے ذریعے گاڑیوں کی خرید و فروخت کا بہترین تجربہ۔",
      statsHeading: "بازار360 اعتماد کی علامات",
      downloadHeading: "بازار360 موبائل ایپ ڈاؤن لوڈ کریں",
      downloadText: "ریئل ٹائم بائیومیٹرکس، انشورنس ٹریکرز اور لائیو قیمتوں کے تجزیے موبائل پر حاصل کریں۔"
    }
  }[lang];

  return (
    <div 
      id="bazar360-home-viewport" 
      className={`flex flex-col space-y-16 pb-16 animate-fade-in text-text-main font-sans ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* SECTION 1: AUTO SLIDER HERO BANNER */}
      <section 
        className="relative rounded-2xl md:rounded-[32px] overflow-hidden border border-border-main bg-bg-secondary shadow-2xl h-[320px] sm:h-[420px] md:h-[560px] flex flex-col justify-end cursor-pointer group/hero select-none"
        onClick={() => {
          if (activeSlides[currentSlide]) {
            onSelectListing(activeSlides[currentSlide]);
          }
        }}
      >
        {/* Dynamic Image Slideshow with Fade */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeSlides.map((slide, index) => {
              if (index !== currentSlide) return null;
              return (
                <motion.div
                  key={slide.id || index}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.imageUrl || slide.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-90 md:opacity-85 transition-transform duration-700 group-hover/hero:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Premium Ambient Overlays for perfect legibility in the empty space */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Slidable Content Text Controls overlay - Positioned beautifully in the empty top-left sky/background space, clear of the car body */}
        <div className="absolute top-6 sm:top-8 md:top-12 left-5 sm:left-8 md:left-12 z-10 max-w-xl text-left flex flex-col space-y-2">
          {(() => {
            const slide = activeSlides[currentSlide];
            if (!slide) return null;
            const dealer = dealers.find(d => d.id === slide.dealerId);
            const showroomName = dealer ? dealer.name : 'Individual Seller';
            const showroomInitials = dealer ? (dealer.avatarLetter || dealer.name[0]) : 'P';
            return (
              <div className="space-y-2">
                {/* Simplified Showroom Name Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
                    <div className="w-5 h-5 rounded-full bg-accent-main text-bg-primary flex items-center justify-center font-black text-[9px] uppercase shadow-sm">
                      {showroomInitials}
                    </div>
                    <span className="text-white text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider">
                      {showroomName}
                    </span>
                  </div>
                </div>

                {/* Title (Car Name only, stylized with responsive spacing and strong drop shadow to match background aesthetic) */}
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                    {slide.title}
                  </h1>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Dots Indicator - Positioned at bottom-left */}
        <div className="absolute bottom-4 left-5 sm:left-8 md:left-12 z-10 flex gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-6 bg-accent-main' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: SMART ADVANCED SEARCH PANEL */}
      <section className="relative z-20 max-w-5xl mx-auto w-full -mt-8 sm:-mt-14 md:-mt-20 px-4">
        <div className="bg-bg-secondary/95 backdrop-blur-md border border-border-main/60 rounded-2xl p-3 sm:p-4 md:p-4 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.45)] relative overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-main/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleSearchSubmit} className="space-y-2.5 relative z-10 text-text-main">
            {/* Header and Type Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-wider text-text-main flex items-center gap-1">
                  <span className="h-3 w-1 bg-accent-main rounded-full"></span>
                  {t.searchHeader}
                </h3>
              </div>

              <div className="flex items-center gap-0.5 bg-bg-primary p-0.5 rounded-lg border border-border-main/50 shrink-0 self-start sm:self-auto">
                {(['all', 'used', 'new'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSearchType(type)}
                    className={`px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      searchType === type
                        ? 'bg-accent-main text-bg-primary shadow-sm font-extrabold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {type === 'all' ? (lang === 'en' ? 'ALL VEHICLES' : 'تمام گاڑیاں') : 
                     type === 'used' ? (lang === 'en' ? 'USED' : 'استعمال شدہ') : 
                     (lang === 'en' ? 'NEW' : 'نئی')}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Search Bar Row */}
            <div className="flex flex-col sm:flex-row gap-1.5">
              {/* Search input */}
              <div className="flex-grow flex items-center gap-2 bg-bg-primary border border-border-main/60 rounded-xl px-2.5 py-1.5 focus-within:border-accent-main transition-all">
                <Search className="text-text-muted shrink-0" size={13} />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder={lang === 'en' ? "Search make, model, variant, keyword..." : "برانڈ، ماڈل یا گاڑی تلاش کریں..."}
                  className="bg-transparent text-[11px] border-none outline-none focus:ring-0 text-text-main placeholder-text-muted/40 w-full font-sans py-0"
                />
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 flex items-center justify-center gap-1"
              >
                <Search size={11} />
                {lang === 'en' ? 'SEARCH' : 'تلاش کریں'}
              </button>
            </div>

            {/* Default Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0.5">
              {/* City Selection */}
              <div>
                <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                  {lang === 'en' ? 'CHOOSE CITY' : 'شہر کا انتخاب'}
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg px-2.5 py-1.5 text-[11px] text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ALL PAKISTAN' : 'پورا پاکستان'}</option>
                  <option value="Peshawar">PESHAWAR</option>
                  <option value="Islamabad">ISLAMABAD</option>
                  <option value="Lahore">LAHORE</option>
                  <option value="Karachi">KARACHI</option>
                </select>
              </div>

              {/* Budget Range Selection */}
              <div>
                <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                  {lang === 'en' ? 'MAX BUDGET' : 'زیادہ سے زیادہ بجٹ'}
                </label>
                <select
                  value={searchPrice}
                  onChange={(e) => setSearchPrice(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg px-2.5 py-1.5 text-[11px] text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY PRICE' : 'کوئی بھی قیمت'}</option>
                  <option value="Under 15 Lakhs">{lang === 'en' ? 'UNDER 1.5 MILLION (15 LAKH)' : '15 لاکھ سے کم'}</option>
                  <option value="15-35 Lakhs">{lang === 'en' ? '1.5M - 3.5M (15-35 LAKH)' : '15 سے 35 لاکھ'}</option>
                  <option value="35-75 Lakhs">{lang === 'en' ? '3.5M - 7.5M (35-75 LAKH)' : '35 سے 75 لاکھ'}</option>
                  <option value="75+ Lakhs">{lang === 'en' ? 'ABOVE 7.5 MILLION (75 LAKH)' : '75 لاکھ سے اوپر'}</option>
                </select>
              </div>

              {/* Fuel Selection */}
              <div>
                <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                  {lang === 'en' ? 'FUEL CATEGORY' : 'فیول کی قسم'}
                </label>
                <select
                  value={searchFuel}
                  onChange={(e) => setSearchFuel(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg px-2.5 py-1.5 text-[11px] text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY FUEL' : 'تمام فیول'}</option>
                  <option value="Petrol">PETROL</option>
                  <option value="Diesel">DIESEL</option>
                  <option value="Hybrid">HYBRID</option>
                  <option value="Electric">ELECTRIC</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                  {lang === 'en' ? 'GEARBOX TRANSMISSION' : 'ٹرانسمیشن'}
                </label>
                <select
                  value={searchTransmission}
                  onChange={(e) => setSearchTransmission(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg px-2.5 py-1.5 text-[11px] text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'ANY TRANSMISSION' : 'تمام ٹرانسمیشن'}</option>
                  <option value="Automatic">AUTOMATIC</option>
                  <option value="Manual">MANUAL</option>
                </select>
              </div>
            </div>

            {/* Toggle Advanced Button */}
            <div className="flex justify-between items-center pt-2 border-t border-border-main mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-mono font-black text-accent-main hover:text-accent-hover flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvanced ? '➖ CLOSE ADVANCED FILTERS' : '➕ CHOOSE MORE ADVANCED FILTERS'}</span>
              </button>
            </div>

            {/* Advanced Filters Expandable block */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border-main/5"
              >
                {/* Year range option */}
                <div>
                  <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                    {lang === 'en' ? 'YEAR MODEL' : 'ماڈل سال'}
                  </label>
                  <select
                    value={searchYear}
                    onChange={(e) => setSearchYear(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main rounded-lg px-2.5 py-1.5 text-[11px] text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                  >
                    <option value="All">ANY YEAR</option>
                    <option value="2025">2025 & Above</option>
                    <option value="2023">2023 & Above</option>
                    <option value="2020">2020 & Above</option>
                    <option value="2015">2015 & Above</option>
                  </select>
                </div>

                {/* Seller Type filter */}
                <div>
                  <label className="text-[8px] font-mono font-black uppercase text-accent-main tracking-widest block mb-0.5">
                    {lang === 'en' ? 'SELLER TYPE' : 'بیچنے والے کی قسم'}
                  </label>
                  <div className="flex gap-1 bg-bg-primary border border-border-main p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSearchSeller('all')}
                      className={`flex-1 py-1 rounded text-[10px] font-bold ${searchSeller === 'all' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchSeller('showroom')}
                      className={`flex-1 py-1 rounded text-[10px] font-bold ${searchSeller === 'showroom' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      DEALER
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchSeller('individual')}
                      className={`flex-1 py-1 rounded text-[10px] font-bold ${searchSeller === 'individual' ? 'bg-accent-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                      PRIVATE
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary/50 border border-border-main rounded-lg text-[9px] text-text-muted">
                  <Info size={14} className="text-accent-main shrink-0" />
                  <span>Verified Badging filter will be applied to listings instantly upon searching.</span>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </section>



      {/* SECTION 3: BROWSE BY BODY TYPE */}
      <section className="space-y-6 max-w-7xl mx-auto w-full px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main">
            {lang === 'en' ? 'Browse by Body Type' : 'گاڑی کی باڈی ٹائپ منتخب کریں'}
          </h2>
          <p className="text-xs text-text-muted max-w-lg mx-auto">
            {lang === 'en' ? 'Pick a body profile matching your daily lifestyle, utility requirements, or seating preference.' : 'اپنی روزمرہ ضروریات کے مطابق گاڑی کا سائز اور باڈی منتخب کریں۔'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {BODY_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleBodyTypeClick(type.id)}
              className="bg-bg-secondary border border-border-main hover:border-accent-main p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 select-none"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                {type.icon}
              </div>
              <div>
                <span className="text-xs font-sans font-black text-text-main group-hover:text-accent-main transition-colors uppercase tracking-tight block">
                  {type.name}
                </span>
                <span className="text-[9px] text-text-muted/70 leading-tight block mt-1 line-clamp-2 max-w-xs px-1">
                  {type.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 4: POPULAR BRANDS GRID */}
      <section className="space-y-6 max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-between items-baseline border-b border-border-main pb-3">
          <div className="text-left">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
              <span className="h-5 w-1 bg-accent-main rounded-full"></span>
              {lang === 'en' ? 'Popular Brands' : 'مقبول برانڈز'}
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5 font-mono uppercase tracking-wider">
              {lang === 'en' ? 'Certified Regional Partners & Auto Makers' : 'پاکستان کے معروف کار برانڈز'}
            </p>
          </div>
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="text-xs font-sans font-black text-accent-main hover:text-accent-hover transition-colors cursor-pointer uppercase tracking-wider"
          >
            {showAllBrands 
              ? (lang === 'en' ? 'Show Less ↑' : 'کم دکھائیں ↑') 
              : (lang === 'en' ? 'See All Brands ↓' : 'تمام برانڈز دیکھیں ↓')}
          </button>
        </div>

        {/* Responsive grid showing top 8 in exactly 1 line on desktop, or fully expanded list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 transition-all duration-300">
          {(showAllBrands ? POPULAR_BRANDS : POPULAR_BRANDS.slice(0, 8)).map((brand, i) => (
            <button
              key={i}
              onClick={() => handleBrandClick(brand.name)}
              className="bg-bg-secondary border border-border-main hover:border-accent-main/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all active:scale-95 duration-150 cursor-pointer group hover:shadow-md select-none"
              style={{ minHeight: '96px' }}
            >
              <div className="h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {renderBrandLogo(brand.name)}
              </div>
              <span className="text-xs font-sans font-black text-text-main group-hover:text-accent-main transition-colors uppercase tracking-tight">
                {brand.name}
              </span>
            </button>
          ))}
          {!showAllBrands && (
            <button
              onClick={() => setShowAllBrands(true)}
              className="bg-bg-secondary border border-dashed border-border-main hover:border-accent-main/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all active:scale-95 duration-150 cursor-pointer group hover:shadow-md select-none lg:hidden"
              style={{ minHeight: '96px' }}
            >
              <span className="text-xl text-accent-main group-hover:scale-110 transition-transform font-bold">+</span>
              <span className="text-[10px] font-sans font-bold text-text-muted group-hover:text-accent-main transition-colors uppercase tracking-tight">
                {lang === 'en' ? 'More' : 'مزید'}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* SECTION 5: PREMIUM DYNAMIC INVENTORY HUB */}
      <section className="max-w-7xl mx-auto w-full px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Category-Segmented Vehicles (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border-main pb-2">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
              <span className="h-5 w-1 bg-accent-main rounded-full"></span>
              {lang === 'en' ? 'Explore Collections' : 'گاڑیاں تلاش کریں'}
            </h2>

            {/* Custom Tab Toggles */}
            <div className="flex items-center gap-1 bg-bg-secondary border border-border-main p-1 rounded-xl">
              {(['featured', 'latest', 'premium'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setInventoryTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    inventoryTab === tab
                      ? 'bg-accent-main text-bg-primary shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab === 'featured' ? (lang === 'en' ? 'FEATURED' : 'نمایاں') :
                   tab === 'latest' ? (lang === 'en' ? 'LATEST' : 'جدید ترین') :
                   (lang === 'en' ? 'PREMIUM' : 'مہنگی گاڑیاں')}
                </button>
              ))}
            </div>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VehicleSkeletonCard key={i} />
              ))}
            </div>
          ) : filteredInventoryListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filteredInventoryListings.map((car) => (
                <VehicleCard
                  key={car.id}
                  car={car}
                  dealer={dealers.find((d) => d.id === car.dealerId)}
                  onSelect={onSelectListing}
                  onToggleCompare={onToggleCompare}
                  isComparing={compareList.some((c) => c.id === car.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-bg-secondary border border-border-main rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
              <Car size={36} className="text-text-muted animate-pulse" />
              <p className="text-text-muted text-sm font-sans">No vehicles match this section.</p>
              <button
                onClick={() => setTab('sell')}
                className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {lang === 'en' ? 'Post Your Ad Free' : 'اشتہار لگائیں'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Elite Dealerships list (1 col wide) */}
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-baseline border-b border-border-main pb-3">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-text-main flex items-center gap-2">
              <span className="h-5 w-1 bg-accent-main rounded-full"></span>
              {lang === 'en' ? 'Verified Showrooms' : 'تصدیق شدہ شورومز'}
            </h2>
            <button
              onClick={() => setTab('dealers')}
              className="text-xs font-sans font-extrabold text-accent-main hover:text-accent-hover transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'VIEW ALL' : 'سب دیکھیں'}
            </button>
          </div>

          <div className="space-y-4">
            {dbLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg-secondary border border-border-main p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-bg-primary shrink-0"></div>
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="h-3.5 bg-bg-primary rounded w-1/2"></div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 bg-bg-primary rounded w-8"></div>
                      <div className="h-2.5 bg-bg-primary rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : dealers.slice(0, 4).map((showroom) => (
              <div
                key={showroom.id}
                onClick={() => onSelectDealer(showroom.id)}
                className="bg-bg-secondary border border-border-main hover:border-accent-main p-4 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-0.5 cursor-pointer select-none group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-main/10 text-accent-main border border-accent-main/15 flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                  {showroom.avatarLetter || showroom.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-xs md:text-sm font-sans font-black text-text-main group-hover:text-accent-main transition-colors truncate uppercase">
                    {showroom.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-text-muted font-sans flex items-center gap-0.5 font-bold">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      {showroom.rating || '4.9'}
                    </span>
                    <span className="text-[10px] text-text-muted font-sans flex items-center gap-1 font-bold uppercase">
                      <MapPin size={10} className="text-accent-main" />
                      {showroom.location.split(',')[0]}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: INTERACTIVE VEHICLE COMPARISON DRAWER INSTRUCTIONS */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="bg-gradient-to-r from-bg-secondary via-bg-primary to-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="bg-amber-500/15 text-amber-400 text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
              ⚡ COMPONENT MATRIX MATCHUP
            </span>
            <h3 className="text-lg md:text-xl font-black text-text-main uppercase tracking-tight">
              Compare Vehicles Side-by-Side
            </h3>
            <p className="text-text-muted text-xs md:text-sm leading-relaxed">
              Add any vehicle from the list to the comparison drawer. We will match their Engine, Price, Mileage, and Fuel specifications to help you pick the best ride.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs font-mono font-black text-text-muted">
              COMPARING: {compareList.length} Vehicles
            </span>
            <button
              onClick={() => setTab('inventory')}
              className="bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1"
            >
              Browse Inventory <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>



      {/* SECTION 9: 200-POINT INSPECTION BOOKING DECK */}
      <section className="max-w-7xl mx-auto w-full px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main flex items-center justify-center gap-2">
            <ShieldCheck size={22} className="text-accent-main" />
            {lang === 'en' ? 'BAZAR360 Certified 200-Point Inspection' : 'گاڑی کی تفصیلی انسپکشن رپورٹ'}
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {lang === 'en' ? 'Avoid scam purchases. Get a complete mechanical, paint, battery, and diagnostic scan report.' : 'دھوکے سے بچیں! ہمارے ماہر میکانکس سے گاڑی کی بمپر ٹو بمپر مکمل تفصیلی رپورٹ حاصل کریں۔'}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-lg text-left items-center">
          {/* Information block Left (6 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="bg-accent-main/15 text-accent-main text-[9px] font-mono font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-accent-main/25">
              🛡️ BUMPER-TO-BUMPER VERIFICATION
            </span>
            <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tight">
              Get 100% Peace of Mind
            </h3>
            <p className="text-text-muted text-xs md:text-sm leading-relaxed">
              Our certified inspection specialists use advanced paint thickness gauges, digital OBD-II diagnostic scanners, and engine compression metrics to inspect vehicles before you buy.
            </p>

            {/* Checklist of inspection items */}
            <div className="space-y-3">
              {[
                { title: "Engine & Transmission Diagnostic Scan", desc: "Digital scanning of ECU codes and sensor health." },
                { title: "Accidental Body Paint Thickness Check", desc: "Reveals any hidden structural repairs or re-paints." },
                { title: "Suspension, Brakes & Underbody", desc: "Bumper-to-bumper check for rust, leaks, or loose mounts." },
                { title: "Excise Registration & Biometrics Match", desc: "Legal verification of chassis serials and documentation." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-main/10 text-accent-main border border-accent-main/15 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-sans font-extrabold text-text-main uppercase tracking-tight">{item.title}</h5>
                    <p className="text-[10px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Booking Right Panel (7 cols) */}
          <div className="lg:col-span-7 bg-bg-primary border border-border-main p-6 rounded-3xl">
            {inspectSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-2xl text-center space-y-4">
                <CheckCircle2 size={44} className="mx-auto text-emerald-400" />
                <h4 className="font-extrabold text-base text-white">INSPECTION REGISTERED SUCCESSFUL!</h4>
                <p className="text-xs max-w-sm mx-auto text-text-muted">
                  Thank you! We have received your request. An inspection team supervisor will call you on your phone <strong>{inspectPhone}</strong> within 30 minutes to schedule the visit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookInspection} className="space-y-4">
                <h4 className="text-xs font-mono font-black uppercase text-accent-main tracking-widest border-b border-border-main pb-2">
                  SCHEDULE ON-SITE MECHANICAL VISIT
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={inspectName}
                      onChange={(e) => setInspectName(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main"
                      placeholder="e.g., Bilal Khan"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={inspectPhone}
                      onChange={(e) => setInspectPhone(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main font-mono"
                      placeholder="e.g., 03149198403"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Car model */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Car Make &amp; Model</label>
                    <input
                      type="text"
                      required
                      value={inspectCarModel}
                      onChange={(e) => setInspectCarModel(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main"
                      placeholder="e.g., Honda Civic Oriel 2022"
                    />
                  </div>

                  {/* Inspection City */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Inspection City</label>
                    <select
                      value={inspectCity}
                      onChange={(e) => setInspectCity(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main cursor-pointer"
                    >
                      <option value="Peshawar">Peshawar</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Preferred Inspection Date</label>
                  <input
                    type="date"
                    required
                    value={inspectDate}
                    onChange={(e) => setInspectDate(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent-main font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-accent-main hover:bg-accent-hover text-bg-primary font-sans font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-md shadow-accent-main/15"
                >
                  📅 Request On-Site 200-Point inspection
                </button>

                <p className="text-[9px] text-text-muted text-center font-sans">
                  Inspections start from just <strong>Rs. 4,500</strong>. Payable upon inspection completion.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 10: TRUSTWORTHY REVIEWS & ANONYMOUS ECOSYSTEM STATS */}
      <section className="space-y-12 max-w-7xl mx-auto w-full px-4">
        {/* Customer Reviews */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-text-main">
              {lang === 'en' ? 'What Our Customers Say' : 'صارفین کی آراء'}
            </h2>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {lang === 'en' ? 'Real buyers and verified sellers share their success stories on BAZAR360.' : 'بازار360 پر گاڑیوں کی خریدو فروخت کا حقیقی اور تصدیق شدہ تجربہ۔'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ahmed Khan", city: "Lahore", text: "Posting an ad was unbelievably simple. I sold my Civic within 3 days without any hassle. Highly recommended!" },
              { name: "Fatima Ali", city: "Islamabad", text: "The UI is incredibly clean and modern. I love the Urdu language option which makes it very accessible for everyone." },
              { name: "Bilal Ahmed", city: "Peshawar", text: "Connecting with verified showrooms in Peshawar was a great experience. Bazar360 is the future of auto market in Pakistan." }
            ].map((rev, i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-border-main p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm relative text-left"
              >
                <Quote size={20} className="text-accent-main/10 absolute top-4 right-4" />
                
                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={12} className="fill-amber-500 text-amber-500" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-text-muted text-xs md:text-sm leading-relaxed font-sans italic">
                  "{rev.text}"
                </p>

                {/* User Identity */}
                <div className="pt-4 border-t border-border-main/40 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-main/10 border border-accent-main/20 flex items-center justify-center text-accent-main font-sans font-black text-xs uppercase">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-black text-text-main uppercase tracking-tight">
                      {rev.name}
                    </h4>
                    <p className="text-[10px] text-text-muted font-sans uppercase tracking-wider flex items-center gap-1 mt-0.5 font-bold">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      {rev.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Trust Stats Grid */}
        {ENABLE_TRUST_METRICS && (
          <div className="space-y-6 pt-6 border-t border-border-main/30 animate-fade-in">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-center text-text-main font-sans">
              {t.statsHeading}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "LISTED VEHICLES", count: "12,500+", desc: "Actively updated every minute" },
                { label: "VERIFIED DEALERS", count: "350+", desc: "Authorized showroom partners" },
                { label: "CERTIFIED INSPECTIONS", count: "8,900+", desc: "Bumper-to-bumper mechanic tests" },
                { label: "HAPPY TRADERS", count: "50,000+", desc: "Successful buyers & sellers" }
              ].map((stat, i) => (
                <div key={i} className="bg-bg-secondary border border-border-main p-5 rounded-2xl text-center space-y-1.5">
                  <span className="text-[9px] font-mono font-black text-accent-main tracking-widest uppercase block">
                    {stat.label}
                  </span>
                  <span className="text-2xl md:text-3xl font-mono font-black text-text-main block">
                    {stat.count}
                  </span>
                  <span className="text-[10px] text-text-muted block leading-tight font-medium">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Dynamic Toast Notification Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-emerald-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-sans font-bold text-xs"
          >
            <Check className="text-emerald-500" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
