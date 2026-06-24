import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sliders, 
  X, 
  Sparkles, 
  Check, 
  Phone, 
  MessageSquare, 
  ShoppingBag, 
  Store, 
  Car, 
  Tag, 
  BadgeCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Heart,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Clock,
  Briefcase
} from 'lucide-react';
import { CarListing, Dealer } from '../types';
import { useCurrencyMode } from '../lib/currency';
import { dbSaveLead, dbSaveBargain } from '../lib/dbService';
import { VehicleCard } from './VehicleCard';
import { VEHICLE_DICTIONARY } from './HomeView';

interface SearchExplorerViewProps {
  listings: CarListing[];
  dealers: Dealer[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectListing: (listing: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentUser?: any;
  currentCategory?: 'gateway' | 'auto' | 'footwear' | 'food';
}

// Pre-seeded high-fidelity SEO Products reflecting the wider E-Commerce expansion mapping
const DYNAMIC_SEO_PRODUCTS = [
  {
    id: 'prod-iphone15',
    title: 'Apple iPhone 15 Pro Max (PTA Approved)',
    category: 'Electronics',
    subcategory: 'Mobile Phones',
    price: 385000,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400',
    description: 'Bazar360 Super Sales Deal! Brand new PTA-approved local warrantied iPhone 15 Pro Max (Titanium Blue, 256GB). Ideal B2B/B2C online shop price with fast shipping.',
    tags: ['Mobile Phones', 'Electronics', 'Online Shopping', 'Wholesale'],
    condition: 'Brand New',
    stockStatus: 'In Stock',
    storeName: 'AL-Fatah Electronics Hub',
    phone: '+92 314 9198403',
    verified: true,
  },
  {
    id: 'prod-s24ultra',
    title: 'Samsung Galaxy S24 Ultra 512GB (PTA Verified)',
    category: 'Electronics',
    subcategory: 'Mobile Phones',
    price: 345000,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400',
    description: 'High price discount purchase on high spec AI Android smartphone. Verified PTAs, custom warranty, retail pricing. Fast delivery all over Pakistan.',
    tags: ['Mobile Phones', 'Electronics', 'Digital Marketplace'],
    condition: 'Brand New',
    stockStatus: 'Last 3 Left',
    storeName: 'Hafeez Plaza Global Store',
    phone: '+92 315 9085086',
    verified: true,
  },
  {
    id: 'prod-suit',
    title: 'Unstitched Premium Off-White Wash & Wear Shalwar Kameez',
    category: 'Fashion & Apparel',
    subcategory: 'Traditional Menswear',
    price: 4950,
    imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400',
    description: 'Latha category premium summer threads. Soft finish crease-resistant fabric. Low price wholesale deal on universal classifieds marketplace.',
    tags: ['Fashion & Apparel', 'Bazar', 'Discount Shopping'],
    condition: 'Premium Unstitched',
    stockStatus: 'In Stock',
    storeName: 'Khyber Bazaar Fabrics',
    phone: '+92 300 1234567',
    verified: true,
  },
  {
    id: 'prod-braviatv',
    title: 'Sony Bravia XR 65" OLED 4K UHD Smart TV',
    category: 'Electronics',
    subcategory: 'Home Appliances',
    price: 495000,
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=400',
    description: 'Acoustic Surface Audio, XR Triluminos contrast screens. Perfect for immersive home cinema. Low price purchase from certified retailer.',
    tags: ['Home Appliances', 'Electronics', 'Mega Store'],
    condition: 'Box Packed',
    stockStatus: 'Available to Order',
    storeName: 'Metro Cash & Carry Partner',
    phone: '+92 42 333 3600',
    verified: true,
  },
  {
    id: 'prod-dyson',
    title: 'Dyson V15 Detect Total Clean Cordless Vacuum',
    category: 'Home Appliances',
    subcategory: 'Daily Essentials',
    price: 185000,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400',
    description: 'Laser dust detection system with hyperdymium motor suction efficiency. High speed retail supply chain item with easy checkout.',
    tags: ['Home Appliances', 'Daily Essentials', 'E-commerce'],
    condition: 'New Sealed Box',
    stockStatus: 'Ships in 24 Hours',
    storeName: 'Appliance Planet Lahore',
    phone: '+92 321 987 6543',
    verified: false,
  },
  {
    id: 'prod-shoes',
    title: 'Bespoke Italian Oak Calfskin Leather Mens Oxfords',
    category: 'Fashion & Apparel',
    subcategory: 'Footwear',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=400',
    description: 'Premium Goodyear welted full-grain luxury leather formal oxford shoes. Handpainted patina design. Custom luxury footwear for gentlemen.',
    tags: ['Fashion & Apparel', 'Retail', 'Super Sales'],
    condition: 'Handcrafted New',
    stockStatus: 'Made to Order',
    storeName: 'Royal Shoemakers Peshawar',
    phone: '+92 333 777 9999',
    verified: true,
  }
];

export default function SearchExplorerView({
  listings,
  dealers,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectListing,
  onToggleCompare,
  compareList = [],
  currentUser,
  currentCategory = 'gateway'
}: SearchExplorerViewProps) {
  const { renderPrice } = useCurrencyMode();
  
  // 360° Marketplace Universe State: Vehicles, Products, or Stores
  const [marketTab, setMarketTab] = useState<'Vehicles' | 'Products' | 'Businesses'>('Vehicles');

  // Enforce Auto Sector Isolation: Automatically switch and lock tab to Vehicles if Auto choice vertical is active and a general tab is selected
  useEffect(() => {
    if (currentCategory === 'auto' && marketTab === 'Products') {
      setMarketTab('Vehicles');
    }
  }, [currentCategory, marketTab]);
  
  // Filtering Options
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(350000000);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [cityFilter, setCityFilter] = useState<string>('All');
  
  // High-conversion Double-sided Vehicle Matrix parameters
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('All');
  const [maxMileage, setMaxMileage] = useState<number>(500000);
  const [selectedAssemblyType, setSelectedAssemblyType] = useState<string>('All');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('All');
  const [selectedTokenTaxStatus, setSelectedTokenTaxStatus] = useState<string>('All');

  // Collapsible mobile drawer/bottom sheet state for faceted search
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Predictive search suggestions state
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Memoized search suggestions matching VEHICLE_DICTIONARY and listings
  const predictiveSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    const matches: Array<{ make: string; model: string; label: string }> = [];

    // Search dictionary
    Object.keys(VEHICLE_DICTIONARY).forEach((category) => {
      VEHICLE_DICTIONARY[category].forEach((car) => {
        const fullName = `${car.make} ${car.model}`.toLowerCase();
        if (fullName.includes(query) || car.make.toLowerCase().includes(query) || car.model.toLowerCase().includes(query)) {
          matches.push({ make: car.make, model: car.model, label: `${car.make} ${car.model}` });
        }
      });
    });

    // Search unique listings
    listings.forEach((car) => {
      const fullName = `${car.make} ${car.model}`.toLowerCase();
      if (fullName.includes(query) || car.make.toLowerCase().includes(query) || car.model.toLowerCase().includes(query)) {
        if (!matches.some(m => m.model.toLowerCase() === car.model.toLowerCase())) {
          matches.push({ make: car.make, model: car.model, label: `${car.make} ${car.model}` });
        }
      }
    });

    return matches.slice(0, 5); // top 5
  }, [searchQuery, listings]);

  // Dynamically derive models for the selected make to emulate PakWheels form factor
  const modelsForSelectedMake = useMemo(() => {
    if (selectedMake === 'All') {
      const allModels = listings.map(car => car.model);
      return Array.from(new Set(allModels)).filter(Boolean).sort();
    }
    const filtered = listings.filter(car => car.make.toLowerCase() === selectedMake.toLowerCase());
    return Array.from(new Set(filtered.map(car => car.model))).filter(Boolean).sort();
  }, [listings, selectedMake]);

  // Reset selected model when make changes to avoid mismatched state queries
  useEffect(() => {
    setSelectedModel('All');
  }, [selectedMake]);
  
  // Detailed Modal state for non-automobile B2C products
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productBidAmount, setProductBidAmount] = useState<string>('');
  const [buyerNameInput, setBuyerNameInput] = useState<string>('');
  const [buyerPhoneInput, setBuyerPhoneInput] = useState<string>('');
  const [offerSuccessMessage, setOfferSuccessMessage] = useState<string>('');

  // 1. Vehicle Filter algorithm
  const filteredVehicles = useMemo(() => {
    return listings.filter((car) => {
      // Keyword Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const mainMatch = car.title.toLowerCase().includes(query) ||
                          car.make.toLowerCase().includes(query) ||
                          car.model.toLowerCase().includes(query) ||
                          car.description.toLowerCase().includes(query);
        if (!mainMatch) return false;
      }
      
      // Category Match (SUV, Sedan, Electric etc.)
      if (selectedCategory && selectedCategory !== 'All') {
        const hasTag = car.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase());
        const hasFuel = car.fuelType.toLowerCase() === selectedCategory.toLowerCase();
        if (!hasTag && !hasFuel) return false;
      }

      // City Filter
      if (cityFilter !== 'All') {
        const carRegion = car.region || 'Peshawar';
        if (carRegion.toLowerCase() !== cityFilter.toLowerCase()) return false;
      }

      // Min/Max Price boundary filters
      if (car.price < minPrice) return false;
      if (car.price > maxPrice) return false;

      // Verification Guard
      if (onlyVerified && !car.verified) return false;

      // Make Filter
      if (selectedMake !== 'All' && car.make.toLowerCase() !== selectedMake.toLowerCase()) {
        return false;
      }

      // Model Filter
      if (selectedModel !== 'All' && car.model.toLowerCase() !== selectedModel.toLowerCase()) {
        return false;
      }

      // Condition Filter
      if (selectedCondition !== 'All') {
        if (selectedCondition.toLowerCase() !== car.condition.toLowerCase()) return false;
      }

      // Transmission Filter
      if (selectedTransmission !== 'All' && car.transmission.toLowerCase() !== selectedTransmission.toLowerCase()) {
        return false;
      }

      // Fuel Type Filter
      if (selectedFuelType !== 'All' && car.fuelType.toLowerCase() !== selectedFuelType.toLowerCase()) {
        return false;
      }

      // Mileage Filter
      if (car.mileage > maxMileage) return false;

      // Assembly Type Filter
      if (selectedAssemblyType !== 'All') {
        const carAssembly = car.assemblyType || 'Imported';
        if (selectedAssemblyType === 'Locally Assembled' && carAssembly !== 'Local') return false;
        if (selectedAssemblyType === 'Imported' && carAssembly !== 'Imported') return false;
      }

      // Document Type Filter
      if (selectedDocumentType !== 'All') {
        const carDoc = car.documentType || 'Smart Card';
        if (selectedDocumentType === 'Original Book' && carDoc !== 'Original Book') return false;
        if (selectedDocumentType === 'Smart Card' && carDoc !== 'Smart Card') return false;
      }

      // Token Tax status
      if (selectedTokenTaxStatus !== 'All') {
        const carTax = car.tokenTaxStatus || (car.tokenTaxPaid ? 'Paid' : 'Outstanding');
        if (carTax.toLowerCase() !== selectedTokenTaxStatus.toLowerCase()) return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedCategory, minPrice, maxPrice, onlyVerified, cityFilter, selectedMake, selectedModel, selectedCondition, selectedTransmission, selectedFuelType, maxMileage, selectedAssemblyType, selectedDocumentType, selectedTokenTaxStatus]);

  // 2. Products Filter algorithm
  const filteredProducts = useMemo(() => {
    return DYNAMIC_SEO_PRODUCTS.filter((prod) => {
      // Keyword Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match = prod.title.toLowerCase().includes(query) ||
                      prod.category.toLowerCase().includes(query) ||
                      prod.subcategory.toLowerCase().includes(query) ||
                      prod.description.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Category filter mapped onto products
      if (selectedCategory && selectedCategory !== 'All') {
        const matchCat = prod.category.toLowerCase() === selectedCategory.toLowerCase() ||
                         prod.subcategory.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCat) return false;
      }

      // Min/Max Price bounds
      if (prod.price < minPrice) return false;
      if (prod.price > maxPrice) return false;

      // Verification Check
      if (onlyVerified && !prod.verified) return false;

      return true;
    });
  }, [searchQuery, selectedCategory, minPrice, maxPrice, onlyVerified]);

  // 3. Businesses & Storefront Filter algorithm
  const filteredBusinesses = useMemo(() => {
    return dealers.filter((dlr) => {
      // Keyword Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match = dlr.name.toLowerCase().includes(query) ||
                      dlr.subtitle.toLowerCase().includes(query) ||
                      dlr.location.toLowerCase().includes(query) ||
                      dlr.description.toLowerCase().includes(query);
        if (!match) return false;
      }

      // City Filter matching
      if (cityFilter !== 'All') {
        if (!dlr.location.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      }

      // Verification check on businesses
      if (onlyVerified && !dlr.flagshipVerified) return false;

      return true;
    });
  }, [dealers, searchQuery, onlyVerified, cityFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice(0);
    setMaxPrice(350000000);
    setOnlyVerified(false);
    setCityFilter('All');
    setSelectedMake('All');
    setSelectedModel('All');
    setSelectedCondition('All');
    setSelectedTransmission('All');
    setSelectedFuelType('All');
    setMaxMileage(500000);
    setSelectedAssemblyType('All');
    setSelectedDocumentType('All');
    setSelectedTokenTaxStatus('All');
  };

  // Handle Dynamic Product Order and Bargain submissions in Firestore
  const handleProductBargainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const bid = Number(productBidAmount) || selectedProduct.price;
    const clientName = buyerNameInput || currentUser?.displayName || 'Market Prospect';
    const clientPhone = buyerPhoneInput || currentUser?.phoneNumber || '+92 300 0000000';

    // Persist real-time Bargain to database
    dbSaveBargain({
      id: `offer-prod-${Date.now()}`,
      listingId: selectedProduct.id,
      vehicleTitle: selectedProduct.title,
      bidAmount: bid,
      buyerName: clientName,
      buyerPhone: clientPhone,
      buyerEmail: currentUser?.email || 'customer@bazar360.online',
      dealerId: 'multi-vendor-shop',
      status: 'Pending',
      createdAt: new Date().toISOString()
    });

    // Save lead capture record
    dbSaveLead({
      id: `lead-prod-${Date.now()}`,
      type: 'E-Commerce Retail Order',
      title: `${selectedProduct.title} - Deal Sourced`,
      userName: clientName,
      userPhone: clientPhone,
      userEmail: currentUser?.email || 'customer@bazar360.online',
      city: cityFilter !== 'All' ? cityFilter : 'Peshawar',
      details: `Purchased and Bargained ${selectedProduct.title}. Starting price: Rs. ${selectedProduct.price.toLocaleString()}, Customer Bid: Rs. ${bid.toLocaleString()}. Store: ${selectedProduct.storeName}`,
      createdAt: new Date().toISOString()
    });

    setOfferSuccessMessage(`✓ Proposal of Rs. ${bid.toLocaleString()} saved securely! Ready to finalize via WhatsApp.`);
    
    // Auto-direct to vendor WhatsApp for instant resolution
    setTimeout(() => {
      const textMessage = `--- BAZAR360 RETAIL DEAL PROPOSAL ---\n\nProduct: ${selectedProduct.title}\nStore: ${selectedProduct.storeName}\nCustomer Name: ${clientName}\nCustomer Bid: Rs. ${bid.toLocaleString()}\nStatus: Direct Verification Requested`;
      const waUrl = `https://wa.me/923149198403?text=${encodeURIComponent(textMessage)}`;
      window.open(waUrl, '_blank');
      setProductBidAmount('');
      setOfferSuccessMessage('');
      setSelectedProduct(null);
    }, 2800);
  };

  const renderFilterControls = () => {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[#38BDF8] font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={12} /> Refine Inventory
          </span>
          {(searchQuery || selectedCategory !== 'All' || minPrice > 0 || maxPrice < 350000000 || onlyVerified || cityFilter !== 'All' || selectedMake !== 'All' || selectedModel !== 'All' || selectedCondition !== 'All' || selectedTransmission !== 'All' || selectedFuelType !== 'All' || maxMileage < 500000) && (
            <button
              onClick={clearFilters}
              className="text-orange-400 font-mono text-[9px] font-black uppercase hover:underline cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Brand / Make Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Make / Brand</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
          >
            <option value="All">All Brands</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Porsche">Porsche</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="Suzuki">Suzuki</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Kia">Kia</option>
          </select>
        </div>

        {/* Model Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Model</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={modelsForSelectedMake.length === 0}
          >
            <option value="All">All Models</option>
            {modelsForSelectedMake.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Slider & Manual Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-gray-400 font-mono text-[9px] uppercase tracking-wider">
            <span>Price (Budget)</span>
            <span className="text-[#F97316] font-black text-[10px]">
              {minPrice > 0 ? `${renderPrice(minPrice)} - ` : ''}{renderPrice(maxPrice)}
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="350000000"
            step="200000"
            className="w-full accent-[#F97316] h-1.5 bg-[#070c12] rounded-lg cursor-pointer"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[8px] text-gray-400 uppercase font-mono block">Min (Rs):</span>
              <input
                type="number"
                placeholder="Min"
                className="w-full bg-[#070c12] border border-white/5 text-[10px] font-mono text-white px-2 py-1.5 rounded-xl focus:outline-none focus:border-orange-500"
                value={minPrice || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMinPrice(isNaN(val) ? 0 : val);
                }}
              />
            </div>
            <div>
              <span className="text-[8px] text-gray-400 uppercase font-mono block">Max (Rs):</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full bg-[#070c12] border border-white/5 text-[10px] font-mono text-white px-2 py-1.5 rounded-xl focus:outline-none focus:border-orange-500"
                value={maxPrice === 350000000 ? '' : maxPrice}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMaxPrice(isNaN(val) || val === 0 ? 350000000 : val);
                }}
              />
            </div>
          </div>
        </div>

        {/* Max Mileage Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-gray-400 font-mono text-[9px] uppercase font-bold">
            <span>Max Mileage:</span>
            <span className="text-[#38BDF8]">{maxMileage.toLocaleString()} KM</span>
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            step="5000"
            className="w-full accent-[#38BDF8] h-1.5 bg-[#070c12] rounded-lg cursor-pointer"
            value={maxMileage}
            onChange={(e) => setMaxMileage(parseInt(e.target.value))}
          />
        </div>

        {/* Region / City Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Region</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">All Regions PK</option>
            <option value="Peshawar">Peshawar (KP HQ)</option>
            <option value="Lahore">Lahore (Punjab Hub)</option>
            <option value="Karachi">Karachi (Sindh Port)</option>
            <option value="Islamabad">Islamabad (Federal)</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Condition</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="All">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        {/* Transmission Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Transmission</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedTransmission}
            onChange={(e) => setSelectedTransmission(e.target.value)}
          >
            <option value="All">All Transmissions</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        {/* Fuel Type Filter */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Fuel Type</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedFuelType}
            onChange={(e) => setSelectedFuelType(e.target.value)}
          >
            <option value="All">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        {/* Body Type / Category */}
        <div className="space-y-1.5">
          <label className="text-gray-400 block font-bold text-[9px] uppercase font-mono">Body Type</label>
          <select
            className="w-full bg-[#070c12] border border-white/5 text-[11px] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#38BDF8]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Body Types</option>
            <option value="SUV">SUVs & Jeeps</option>
            <option value="Sedan">Sedans</option>
            <option value="Electric">Electric</option>
            <option value="Luxury">Luxury Grade</option>
            <option value="Classic">Classics</option>
            <option value="Sport">Sport Series</option>
          </select>
        </div>

        {/* Verified Entity Toggle */}
        <div className="flex items-center gap-3 bg-[#070c12]/50 p-2.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className="focus:outline-none shrink-0 cursor-pointer"
          >
            <div
              className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-200 ${
                onlyVerified ? 'bg-orange-500' : 'bg-[#1E293B] border border-white/10'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-transform duration-200 ${
                  onlyVerified ? 'translate-x-4' : 'translate-x-0'
                }`}
              ></div>
            </div>
          </button>
          <div className="min-w-0">
            <span className="text-white font-bold block text-[10px] uppercase">Pre-Vetted Only</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16" id="search-explorer-view-container">
      
      {/* Universal Search Meta Index Banner - High SEO visibility */}
      <header className="bg-gradient-to-r from-orange-600/10 via-yellow-400/5 to-[#121c32]/5 border border-white/5 p-4 rounded-3xl" id="seo-marketplace-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-mono tracking-widest text-orange-400 font-extrabold flex items-center gap-1.5 uppercase">
              <Car size={12} className="animate-bounce" /> Auto Choice Automotive Portal
            </h2>
            <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
              Discover Pakistan's premier verified car showrooms, inspect high-resolution auto inventories, and streamline direct vehicle acquisitions instantly.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">Verified Showrooms</span>
          </div>
        </div>
      </header>

      {/* Main Sector Navigation - Tabs optimized for mobile hit targets (44px min-height) */}
      <div className="grid grid-cols-2 bg-[#121C32]/80 border border-white/5 rounded-2xl p-1 gap-1" style={{ minHeight: '48px' }} id="marketplace-sector-tabs">
        <button
          onClick={() => { setMarketTab('Vehicles'); clearFilters(); }}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-mono text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
            marketTab === 'Vehicles'
              ? 'bg-orange-500 text-slate-950 font-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          style={{ minHeight: '42px' }}
        >
          <Car size={13} />
          <span>Vehicles</span>
        </button>

        <button
          onClick={() => { setMarketTab('Businesses'); clearFilters(); }}
          className={`flex items-center justify-center gap-1.5 rounded-xl font-mono text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
            marketTab === 'Businesses'
              ? 'bg-orange-500 text-slate-950 font-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          style={{ minHeight: '42px' }}
        >
          <Store size={13} />
          <span>Storefronts</span>
        </button>
      </div>

      {marketTab === 'Vehicles' ? (
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 items-start" id="vehicles-faceted-search-layout">
          
          {/* Faceted Search Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 bg-slate-900/95 border border-white/5 p-5 rounded-3xl space-y-5 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            {renderFilterControls()}
          </aside>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-5">
            {/* Sticky/Header Search Bar and Mobile Filter Trigger */}
            <div className="bg-[#121c32]/80 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3 lg:hidden">
              <div className="flex-grow flex items-center bg-[#070c12] border border-white/5 px-3 py-2.5 rounded-xl relative">
                <Search className="text-gray-500 mr-2 shrink-0" size={13} />
                <input
                  className="w-full bg-transparent border-none text-white focus:outline-none text-[11px] font-mono placeholder-gray-600"
                  placeholder="Quick search brand/model..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                
                {/* Suggestions Dropdown (Mobile) */}
                {showSuggestions && predictiveSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 font-sans">
                    {predictiveSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(suggestion.label);
                          setSelectedMake(suggestion.make);
                          setSelectedModel(suggestion.model);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Search size={11} className="text-gray-400" />
                          <span className="text-white font-bold">{suggestion.make}</span>
                          <span className="text-gray-300">{suggestion.model}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono text-[10px] font-black px-4 py-3 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer"
                style={{ minHeight: '40px' }}
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
                {/* Active Filter Badge */}
                {((selectedMake !== 'All' ? 1 : 0) + (selectedModel !== 'All' ? 1 : 0) + (minPrice > 0 ? 1 : 0) + (maxPrice < 350000000 ? 1 : 0) + (maxMileage < 500000 ? 1 : 0) + (selectedCondition !== 'All' ? 1 : 0) + (selectedTransmission !== 'All' ? 1 : 0) + (selectedFuelType !== 'All' ? 1 : 0) + (cityFilter !== 'All' ? 1 : 0)) > 0 && (
                  <span className="bg-white text-slate-950 rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center">
                    {(selectedMake !== 'All' ? 1 : 0) + (selectedModel !== 'All' ? 1 : 0) + (minPrice > 0 ? 1 : 0) + (maxPrice < 350000000 ? 1 : 0) + (maxMileage < 500000 ? 1 : 0) + (selectedCondition !== 'All' ? 1 : 0) + (selectedTransmission !== 'All' ? 1 : 0) + (selectedFuelType !== 'All' ? 1 : 0) + (cityFilter !== 'All' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Quick Text Search Bar to sync seamlessly */}
            <div className="hidden lg:flex items-center bg-slate-900/95 border border-white/5 px-4 py-3 rounded-2xl relative">
              <Search className="text-gray-500 mr-2.5 shrink-0" size={14} />
              <input
                className="w-full bg-transparent border-none text-white focus:outline-none text-[11px] font-mono placeholder-gray-600"
                placeholder="Search Toyota Fortuner, Mercedes G63, specs, manual/auto..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#94a3b8] hover:text-white cursor-pointer px-1">
                  <X size={13} />
                </button>
              )}

              {/* Suggestions Dropdown (Desktop) */}
              {showSuggestions && predictiveSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 font-sans">
                  {predictiveSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery(suggestion.label);
                        setSelectedMake(suggestion.make);
                        setSelectedModel(suggestion.model);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Search size={11} className="text-gray-400 group-hover:text-orange-400 transition-colors" />
                        <span className="text-white font-bold">{suggestion.make}</span>
                        <span className="text-gray-300">{suggestion.model}</span>
                      </div>
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-black">Preset Match</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics Row */}
            <div className="flex justify-between items-center px-1 font-mono text-[9px] uppercase tracking-wider text-[#94a3b8]">
              <p>
                Showing <span className="text-white font-bold">{filteredVehicles.length}</span> luxury classifieds mapped
              </p>
              <span className="text-orange-400 font-bold flex items-center gap-1">● Live Inventory Sync</span>
            </div>

            {/* Vehicle Card Grid */}
            {filteredVehicles.length === 0 ? (
              <div className="bg-[#121c32]/80 border border-white/5 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xl">
                <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                  <Sliders size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold uppercase tracking-tight text-xs">No Premium Cars Found</h4>
                  <p className="text-gray-400 text-[10px] max-w-xs mx-auto">
                    No luxury car listings match your filters. Reset or widen your search.
                  </p>
                </div>
                <button onClick={clearFilters} className="bg-orange-500 text-slate-950 font-mono font-black text-[9px] py-2 px-4 rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-colors cursor-pointer">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((car) => {
                  const dealerObj = dealers.find((d) => d.id === car.dealerId);
                  return (
                    <VehicleCard
                      key={car.id}
                      car={car}
                      dealer={dealerObj}
                      variant="grid"
                      onSelect={onSelectListing}
                      onToggleCompare={onToggleCompare}
                      isComparing={compareList ? compareList.some(item => item.id === car.id) : false}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible Bottom-Sheet Drawer for Mobile Filters */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden" id="mobile-filter-drawer">
              {/* Backdrop Overlay with smooth transition click-to-close */}
              <div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              
              {/* Slidable Bottom-Sheet Content Panel */}
              <div className="relative bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden">
                {/* Drag handle decoration */}
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                
                {/* Scrollable Filter Inputs Container */}
                <div className="p-6 overflow-y-auto space-y-6 pb-24">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-extrabold text-sm uppercase tracking-tight">Refine Options</h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {renderFilterControls()}
                </div>

                {/* Floating "View Results" Button Row */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-md border-t border-white/5 p-4 flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black py-3.5 rounded-2xl uppercase text-xs tracking-wider cursor-pointer shadow-lg"
                  >
                    View {filteredVehicles.length} Luxury Cars
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Universal Search Explorer Filter Bento Box */}
          <section className="bg-slate-900/90 border border-white/5 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4 font-sans">
        
        {/* Core Search input field & Quick Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Main search text input */}
          <div className="flex-grow flex items-center bg-[#070c12] border border-white/5 px-4 py-3 rounded-2xl focus-within:border-[#38BDF8] transition-all">
            <Search className="text-gray-500 mr-2.5 shrink-0" size={14} />
            <input
              className="w-full bg-transparent border-none text-white focus:outline-none text-[11px] font-mono placeholder-gray-600 block"
              placeholder={
                marketTab === 'Products' ? "Search electronics, traditional menswear, home appliances..." :
                "Search Peshawar car villages, Hafeez Plaza hubs, authorized showrooms, retailers..."
              }
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white cursor-pointer px-1">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            
            {/* Contextual Category Dropdown selection */}
            <select
              className="bg-[#070c12] border border-white/5 text-[10.5px] font-mono text-white px-3 py-3 rounded-2xl focus:outline-none focus:border-[#38BDF8] flex-grow"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minHeight: '44px' }}
            >

              {marketTab === 'Products' && (
                <>
                  <option value="All">All Items Directories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Daily Essentials">Daily Essentials</option>
                </>
              )}
              {marketTab === 'Businesses' && (
                <>
                  <option value="All">All Store Types</option>
                  <option value="Showroom">Automotive Showrooms</option>
                  {currentCategory !== 'auto' && <option value="Retailer">Retail Hubs</option>}
                  <option value="Service">Diagnostic & Repairs State</option>
                </>
              )}
            </select>

            {/* City Regional Filters */}
            <select
              className="bg-[#070c12] border border-white/5 text-[10.5px] font-mono text-white px-3 py-3 rounded-2xl focus:outline-none focus:border-[#38BDF8] flex-grow"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ minHeight: '44px' }}
            >
              <option value="All">All Regions PK</option>
              <option value="Peshawar">Peshawar (KP HQ)</option>
              <option value="Lahore">Lahore (Punjab Hub)</option>
              <option value="Karachi">Karachi (Sindh Port)</option>
              <option value="Islamabad">Islamabad (Federal)</option>
            </select>

            {/* Active clear metrics */}
            {(searchQuery || selectedCategory !== 'All' || onlyVerified || cityFilter !== 'All') && (
              <button
                onClick={clearFilters}
                className="bg-[#070c12] border border-orange-500/20 text-orange-400 px-4 py-2.5 rounded-2xl text-[9.5px] font-mono font-black uppercase hover:border-orange-500 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Reset
              </button>
            )}

          </div>
        </div>

        {/* Dynamic Sliders/Toggles */}
        {marketTab !== 'Businesses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3.5 border-t border-white/5 text-[11px]">
            
            {/* Price Slide Threshold */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-400 font-mono text-[9px] uppercase tracking-wider">
                <span>Price filtering threshold:</span>
                <span className="text-[#F97316] font-black text-xs">
                  {minPrice > 0 ? `${renderPrice(minPrice)} - ` : ''}{renderPrice(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="350000000"
                step={marketTab === 'Products' ? '500' : '200000'}
                className="w-full accent-[#F97316] h-1.5 bg-[#070c12] rounded-lg cursor-pointer"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />

              {/* Manual numeric inputs for both min & max budgets (PakWheels Form Factor) */}
              <div className="grid grid-cols-2 gap-3" id="price-manual-inputs-grid">
                <div className="space-y-1">
                  <label className="text-[8px] text-gray-400 uppercase font-mono block">Min Budget (Rs):</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-500 font-black">Rs.</span>
                    <input
                      type="number"
                      placeholder="Min Budget"
                      min="0"
                      max="350000000"
                      className="w-full bg-[#070c12] border border-white/5 text-[10.5px] font-mono text-white pl-8 pr-2 py-1.5 rounded-xl focus:outline-none focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={minPrice || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMinPrice(isNaN(val) ? 0 : val);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-gray-400 uppercase font-mono block">Max Budget (Rs):</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-500 font-black">Rs.</span>
                    <input
                      type="number"
                      placeholder="Max Budget"
                      min="0"
                      max="350000000"
                      className="w-full bg-[#070c12] border border-white/5 text-[10.5px] font-mono text-white pl-8 pr-2 py-1.5 rounded-xl focus:outline-none focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={maxPrice || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMaxPrice(isNaN(val) || val === 0 ? 350000000 : val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verified toggle indicator */}
            <div className="flex items-center gap-3 bg-[#070c12]/50 p-2.5 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setOnlyVerified(!onlyVerified)}
                className="focus:outline-none shrink-0 cursor-pointer"
              >
                <div
                  className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-200 ${
                    onlyVerified ? 'bg-orange-500' : 'bg-[#1E293B] border border-white/10'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-transform duration-200 ${
                      onlyVerified ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  ></div>
                </div>
              </button>
              <div className="min-w-0">
                <span className="text-white font-bold block text-[10px] uppercase">Only Verified Entities</span>
                <span className="text-[9px] text-[#94a3b8] font-sans truncate block">Show stores pre-vetted with 111-point criteria checks.</span>
              </div>
            </div>

          </div>
        )}



      </section>

      {/* Grid rendering context switches */}
      <section className="space-y-4">
        
        {/* Statistics and status logs */}
        <div className="flex justify-between items-center px-1 font-mono text-[9px] uppercase tracking-wider text-[#94a3b8]">
          <p>
            Showing{' '}
            <span className="text-white font-bold">
              {marketTab === 'Products' ? filteredProducts.length :
               filteredBusinesses.length}
            </span>{' '}
            verified classified nodes mapped
          </p>
          <span className="text-orange-400 font-bold hidden sm:inline">● Live Escrow Channel Active</span>
        </div>

        {/* 2. PRODUCTS E-COMMERCE RENDER SECTION */}
        {marketTab === 'Products' && (
          filteredProducts.length === 0 ? (
            <div className="bg-[#121c32]/80 border border-white/5 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                <ShoppingBag size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold uppercase tracking-tight text-xs">No Super Sales Items Mapped</h4>
                <p className="text-gray-400 text-[10px]">
                  No products fit those precise coordinates. Search general categories or lower your price floor.
                </p>
              </div>
              <button onClick={clearFilters} className="bg-orange-500 text-slate-950 font-mono font-black text-[9px] py-2 px-4 rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-colors cursor-pointer">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="ecommerce-products-grid">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="bg-[#121c32]/80 border border-white/5 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-xl cursor-pointer hover:border-orange-500/40 flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-[#070c12]/90 overflow-hidden">
                    <img
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      src={prod.imageUrl}
                      referrerPolicy="no-referrer"
                    />
                    
                    {prod.verified ? (
                      <div className="absolute top-2.5 left-2.5 bg-emerald-500/90 text-slate-950 px-2 py-0.5 rounded-lg text-[7.5px] font-mono font-black uppercase flex items-center gap-0.5 shadow">
                        <BadgeCheck size={9} /> Verified Store
                      </div>
                    ) : (
                      <div className="absolute top-2.5 left-2.5 bg-orange-500/95 text-slate-950 px-2 py-0.5 rounded-lg text-[7.5px] font-mono font-black uppercase">
                        Super Sale
                      </div>
                    )}

                    <div className="absolute bottom-2.5 right-2.5 bg-slate-950/95 px-2 py-0.5 rounded text-[8.5px] font-mono text-[#38BDF8] font-bold border border-white/5">
                      {prod.condition}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5 font-mono text-[8.5px]">
                        <span className="uppercase tracking-wider font-extrabold text-[#38BDF8]">{prod.category}</span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded-full border border-white/5 text-gray-400 font-mono flex items-center gap-0.5"><MapPin size={8} className="text-orange-500" /> Islamabad</span>
                      </div>
                      
                      <h3 className="text-[12.5px] font-extrabold text-white truncate pr-1 group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                        {prod.title}
                      </h3>
                      
                      <p className="text-gray-400 text-[10px] leading-normal line-clamp-2 mt-1.5 font-sans">
                        {prod.description}
                      </p>

                      <div className="text-[10px] text-gray-400 font-mono mt-2 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex items-center justify-between gap-1 divide-x divide-white/10 uppercase">
                        <span className="flex-1 text-center font-bold text-white">{prod.condition}</span>
                        <span className="flex-1 text-center pl-1 text-[8px] font-black text-orange-400">{prod.stockStatus}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">Wholesale Price</span>
                        <span className="text-sm font-black text-orange-400 font-mono">
                          {renderPrice(prod.price)}
                        </span>
                      </div>

                      <div className="text-right text-[8px] font-mono bg-slate-950 hover:bg-orange-500 text-gray-300 hover:text-slate-950 px-2 py-1 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-0.5 border border-white/10 transition-all">
                        Proceed Deal <ArrowUpRight size={9} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 3. LOCAL BUSINESSES & STORES RENDER SECTION */}
        {marketTab === 'Businesses' && (
          filteredBusinesses.length === 0 ? (
            <div className="bg-[#121c32]/80 border border-white/5 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                <Store size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold uppercase tracking-tight text-xs">No Directories Found</h4>
                <p className="text-gray-400 text-[10px]">
                  No local showrooms, retailers, or garages matches those search factors in your area.
                </p>
              </div>
              <button onClick={clearFilters} className="bg-orange-500 text-slate-950 font-mono font-black text-[9px] py-1.5 px-3.5 rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-all cursor-pointer">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="businesses-directory-grid">
              {filteredBusinesses.map((store) => (
                <div
                  key={store.id}
                  className="bg-bg-secondary border border-border-main p-4 sm:p-5 rounded-xl hover:border-accent-main/40 shadow-sm transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    {/* Avatar structure */}
                    <div className="w-16 h-16 rounded-xl bg-accent-main text-white font-black text-sm uppercase flex items-center justify-center shrink-0 border border-border-main relative">
                      {store.avatarLetter || store.name.substring(0,2)}
                      {store.flagshipVerified && (
                        <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-slate-950 p-0.5 rounded-full border border-border-main">
                          <Check size={9} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-extrabold text-text-main uppercase truncate tracking-tight">{store.name}</h4>
                        <span className="text-[7.5px] font-mono px-1.5 py-0.5 bg-accent-main/10 text-accent-main rounded border border-accent-main/20">★ {store.rating}</span>
                      </div>
                      <p className="text-accent-hover font-mono text-[9.5px] italic leading-tight">{store.subtitle}</p>
                      <p className="text-text-muted text-[10px] flex items-center gap-0.5 font-sans"><MapPin size={10} className="text-accent-main" /> {store.location}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-main">
                    <p className="text-text-muted text-[10px] leading-relaxed line-clamp-2 pr-1 font-sans">{store.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[8px] font-mono text-gray-500 uppercase">{store.followersCount} Premium Buyers Saved</span>
                    
                    <div className="flex gap-1.5">
                      <a
                        href={`tel:${store.phone}`}
                        className="p-2 bg-slate-950 hover:bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center"
                        title="Call Business Hotline"
                        style={{ minWidth: '36px', minHeight: '36px' }}
                      >
                        <Phone size={13} />
                      </a>
                      <a
                        href={`https://wa.me/${store.whatsapp}?text=Hello%20Bazar360%20Visitor%20Query`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-[#121c32] hover:bg-[#1C2C4E] text-emerald-400 border border-emerald-500/20 rounded-lg font-mono text-[9px] uppercase font-black tracking-wider flex items-center gap-1"
                        style={{ minHeight: '36px' }}
                      >
                        <MessageSquare size={12} /> Contact Store
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </section>

        </>
      )}

      {/* POPUP DETAIL MODAL FOR E-COMMERCE PRODUCTS */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="product-lead-modal-overlay">
          <div className="bg-[#121c32] border border-white/10 p-5 sm:p-6 rounded-3xl w-full max-w-md space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Close trigger button */}
            <button
              onClick={() => { setSelectedProduct(null); setOfferSuccessMessage(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full cursor-pointer transition-all"
              style={{ minHeight: '40px', minWidth: '40px' }}
            >
              <X size={16} />
            </button>

            {/* Product Graphic header */}
            <div className="h-44 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 relative">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2.5 left-2.5 bg-black/85 px-2 py-1 rounded text-[8px] font-mono text-gray-400">
                Category: {selectedProduct.category}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-[7.5px] font-mono font-black uppercase tracking-wider">
                Store: {selectedProduct.storeName}
              </span>
              <h3 className="text-white text-base font-black uppercase tracking-tight">{selectedProduct.title}</h3>
              <p className="text-orange-400 font-mono text-xs font-black">
                Price: Rs. {selectedProduct.price.toLocaleString()}
              </p>
            </div>

            <p className="text-gray-300 text-[10.5px] leading-relaxed font-sans border-t border-b border-white/5 py-3">
              {selectedProduct.description}
            </p>

            {/* Micro transaction lead Capture Form */}
            <form onSubmit={handleProductBargainSubmit} className="space-y-3">
              <div className="space-y-1">
                <span className="text-[8px] text-gray-500 font-mono font-bold uppercase block">1. Negotiated Purchase/Bargain Proposal (Rs):</span>
                <input
                  type="number"
                  placeholder={`Suggest custom wholesale bid (e.g., ${(selectedProduct.price * 0.95).toFixed(0)})`}
                  value={productBidAmount}
                  onChange={(e) => setProductBidAmount(e.target.value)}
                  className="bg-[#070c12] border border-white/10 text-[11px] rounded-xl font-mono text-white p-3 focus:outline-none w-full block focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[8px] text-gray-500 font-mono font-bold uppercase block">Your Full Name:</span>
                  <input
                    type="text"
                    required
                    placeholder="Amjid Bisconni"
                    value={buyerNameInput}
                    onChange={(e) => setBuyerNameInput(e.target.value)}
                    className="bg-[#070c12] border border-white/10 text-[11px] rounded-xl font-mono text-white p-3 focus:outline-none w-full block focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-gray-500 font-mono font-bold uppercase block">WhatsApp Cell:</span>
                  <input
                    type="tel"
                    required
                    placeholder="03149198403"
                    value={buyerPhoneInput}
                    onChange={(e) => setBuyerPhoneInput(e.target.value)}
                    className="bg-[#070c12] border border-white/10 text-[11px] rounded-xl font-mono text-white p-3 focus:outline-none w-full block focus:border-orange-500"
                  />
                </div>
              </div>

              {offerSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 p-2 text-[9px] font-mono rounded-xl animate-pulse text-center">
                  {offerSuccessMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-mono font-black text-[9.5px] py-3.5 rounded-xl uppercase tracking-wider active:scale-95 duration-100 cursor-pointer flex items-center justify-center gap-1 border border-orange-400/20"
                style={{ minHeight: '44px' }}
              >
                PROPOSE BARGAIN & LOCK DEAL
              </button>
            </form>

            <p className="text-[8px] text-gray-500 font-semibold uppercase text-center mt-2 tracking-widest leading-normal">
              Protected by Bazar360 Escrow Officer Muhammad Amjid
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
