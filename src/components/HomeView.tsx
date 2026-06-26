import React, { useState } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import { Dealer, CarListing } from "../types";
import { UserProfile } from "../lib/dbService";
import { VehicleCard } from "./VehicleCard";

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  setTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  onSelectDealer: (id: string) => void;
  onSelectListing: (car: CarListing) => void;
  onToggleCompare?: (car: CarListing) => void;
  compareList?: CarListing[];
  currentCategory?: string;
  currentUser?: UserProfile | null;
  lang: "en" | "ur";
}

const POPULAR_BRANDS = [
  { name: "Toyota", logo: "🚗" },
  { name: "Honda", logo: "🏎️" },
  { name: "Suzuki", logo: "🚙" },
  { name: "Hyundai", logo: "🚘" },
  { name: "KIA", logo: "🚐" },
  { name: "Nissan", logo: "🏎️" },
  { name: "Mitsubishi", logo: "🛻" },
  { name: "BMW", logo: "🏎️" },
  { name: "Mercedes-Benz", logo: "🚘" },
  { name: "Audi", logo: "🏎️" },
  { name: "Lexus", logo: "🚗" },
  { name: "Land Rover", logo: "🚙" },
  { name: "Mazda", logo: "🚗" },
  { name: "Changan", logo: "🚘" },
  { name: "DFSK", logo: " SUV" },
  { name: "Proton", logo: "🚗" },
];

function renderBrandLogo(name: string) {
  switch (name) {
    case "Toyota":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="6"
            stroke="#EF4444"
            strokeWidth="2"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="6"
            ry="6"
            stroke="#EF4444"
            strokeWidth="1.5"
          />
          <ellipse
            cx="12"
            cy="10"
            rx="3"
            ry="4"
            stroke="#EF4444"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "Honda":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="4"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          <path
            d="M7 6v12M17 6v12M7 12h10"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Suzuki":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 5H9.5L7 9.5l7.5 5L17 19H7.5"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Hyundai":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="7"
            stroke="#3B82F6"
            strokeWidth="2"
            transform="rotate(-15 12 12)"
          />
          <path
            d="M8 8v8M16 8v8M8 12h8"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            transform="rotate(-15 12 12)"
          />
        </svg>
      );
    case "KIA":
      return (
        <svg className="w-12 h-6" viewBox="0 0 60 20" fill="none">
          <path
            d="M5 2l7 8-7 8M14 2v16M22 18l6-16 6 16M25 12h6"
            stroke="#F43F5E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Nissan":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="2" y="10" width="20" height="4" rx="1" fill="#94A3B8" />
        </svg>
      );
    case "Mitsubishi":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l4 7h-8zM16 9l4 7h-8zM8 9l-4 7h8z" fill="#EF4444" />
        </svg>
      );
    case "BMW":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="#94A3B8" strokeWidth="1" />
          <path
            d="M12 6a6 6 0 016 6h-6zM12 12v6a6 6 0 01-6-6z"
            fill="#3B82F6"
          />
        </svg>
      );
    case "Mercedes-Benz":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2" />
          <path
            d="M12 3v9M12 12l7 5M12 12L5 17"
            stroke="#E2E8F0"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Audi":
      return (
        <svg className="w-14 h-8" viewBox="0 0 40 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="16" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="24" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="32" cy="8" r="6" stroke="#94A3B8" strokeWidth="2.5" />
        </svg>
      );
    case "Lexus":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="7"
            stroke="#94A3B8"
            strokeWidth="2"
          />
          <path
            d="M6 16V8h3s3 0 3 2.5-1.5 2.5-3 2.5h-3M9 13l5 3"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Land Rover":
      return (
        <svg className="w-14 h-8" viewBox="0 0 44 20" fill="none">
          <ellipse
            cx="22"
            cy="10"
            rx="20"
            ry="9"
            stroke="#10B981"
            strokeWidth="2"
          />
          <text
            x="22"
            y="13"
            fill="#10B981"
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            ROVER
          </text>
        </svg>
      );
    case "Mazda":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="2" />
          <path
            d="M5 10c3 2 5 5 7 5s4-3 7-5c-2 2-4 3-7 3s-5-1-7-3z"
            stroke="#94A3B8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Changan":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
          <path
            d="M7 9l5 6 5-6"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "DFSK":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
          <path d="M8 8h4a3 3 0 010 6H8V8z" stroke="#EF4444" strokeWidth="2" />
          <path d="M14 14l3 3" stroke="#EF4444" strokeWidth="2" />
        </svg>
      );
    case "Proton":
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
          <path
            d="M9 15l4-6 3 4"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return <span className="text-2xl">🚗</span>;
  }
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
  lang = "en",
}: HomeViewProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "used" | "new">("all");
  const [searchCity, setSearchCity] = useState<string>("All");
  const [searchPrice, setSearchPrice] = useState<string>("All");

  // Translations dictionary matching the exact mockups and bilingual instructions
  const t = {
    en: {
      heroBadge: "★ PESHAWAR'S #1 AUTOMOTIVE MARKETPLACE",
      heroTitle1: "Find Your",
      heroTitle2: "Perfect Ride",
      heroSubtitle:
        "Pakistan's simplest automotive marketplace. Browse, buy, and sell with complete confidence.",
      searchPlaceholder: "Search make, model, or keyword...",
      searchBtn: "Search",
      stats: [
        { label: "10K+ Vehicles", icon: Car },
        { label: "500+ Showrooms", icon: Building2 },
        { label: "50K+ Users", icon: Users },
      ],
      brandsTitle: "Popular Brands",
      viewAll: "View All ->",
      featuredTitle: "Featured Inventory",
      noFeatured: "No vehicles listed yet. Be the first to post!",
      postAdBtn: "Post Your Ad",
      showroomsTitle: "Featured Showrooms",
      activeListings: "Active Listings",
      whyTitle: "Why BAZAR360?",
      whyCards: [
        {
          title: "Verified Listings",
          desc: "Every ad is manually verified by our specialist team to prevent scams and guarantee complete authenticity.",
        },
        {
          title: "Lightning Fast",
          desc: "Post your vehicle in under 60 seconds with our simplified AI mobile-first posting wizard.",
        },
        {
          title: "Best Prices",
          desc: "Access real-time pricing indices, excise biometrics, and market valuations at fair rates.",
        },
      ],
      ctaTitle: "Ready to sell your car?",
      ctaSubtitle:
        "Post your ad in minutes and reach thousands of active buyers across Pakistan. It's completely free and easy.",
      sellBtn: "Sell Your Car",
      browseBtn: "Browse Inventory >",
      reviewsTitle: "Customer Reviews",
      reviews: [
        {
          name: "Ahmed Khan",
          city: "Lahore",
          text: "Posting an ad was unbelievably simple. I sold my Civic within 3 days without any hassle. Highly recommended!",
        },
        {
          name: "Fatima Ali",
          city: "Islamabad",
          text: "The UI is incredibly clean and modern. I love the Urdu language option which makes it very accessible for everyone.",
        },
        {
          name: "Bilal Ahmed",
          city: "Peshawar",
          text: "Connecting with verified showrooms in Peshawar was a great experience. Bazar360 is the future of auto market in Pakistan.",
        },
      ],
    },
    ur: {
      heroBadge: "★ پاکستان کا نمبر 1 آٹوموٹو مارکیٹ پلیس",
      heroTitle1: "اپنی پسندیدہ",
      heroTitle2: "گاڑی تلاش کریں",
      heroSubtitle:
        "پاکستان کا سب سے آسان آٹوموٹو مارکیٹ پلیس۔ اعتماد کے ساتھ براؤز کریں، خریدیں اور بیچیں۔",
      searchPlaceholder: "برانڈ، ماڈل، یا لفظ تلاش کریں...",
      searchBtn: "تلاش کریں",
      stats: [
        { label: "10K+ گاڑیاں", icon: Car },
        { label: "500+ شورومز", icon: Building2 },
        { label: "50K+ صارفین", icon: Users },
      ],
      brandsTitle: "مقبول برانڈز",
      viewAll: "سب دیکھیں ->",
      featuredTitle: "نمایاں گاڑیاں",
      noFeatured: "ابھی تک کوئی گاڑی لسٹ نہیں کی گئی۔ سب سے پہلے پوسٹ کریں!",
      postAdBtn: "اشتہار لگائیں",
      showroomsTitle: "نمایاں شورومز",
      activeListings: "فعال اشتہارات",
      whyTitle: "بازار360 کیوں؟",
      whyCards: [
        {
          title: "تصدیق شدہ اشتہارات",
          desc: "اسکامز سے بچنے اور مکمل سیکیورٹی کے لیے ہر اشتہار کی ہماری ٹیم دستی طور پر تصدیق کرتی ہے۔",
        },
        {
          title: "انتہائی تیز رفتار",
          desc: "ہمارے آسان ترین اور جدید اسسٹنٹ کے ذریعے اپنی گاڑی کا اشتہار صرف 60 سیکنڈز میں لگائیں۔",
        },
        {
          title: "بہترین قیمتیں",
          desc: "منصفانہ قیمتوں پر خرید و فروخت کے لیے ریئل ٹائم پرائس انڈیکیٹرز اور مارکیٹ ریٹس تک رسائی حاصل کریں۔",
        },
      ],
      ctaTitle: "اپنی گاڑی بیچنے کے لیے تیار ہیں؟",
      ctaSubtitle:
        "منٹوں میں اپنا اشتہار لگائیں اور پاکستان بھر کے ہزاروں خریداروں تک پہنچیں۔ یہ بالکل مفت اور آسان ہے۔",
      sellBtn: "گاڑی بیچیں",
      browseBtn: "انوینٹری دیکھیں >",
      reviewsTitle: "صارفین کی رائے",
      reviews: [
        {
          name: "احمد خان",
          city: "لاہور",
          text: "اشتہار لگانا ناقابل یقین حد تک آسان تھا۔ میں نے بغیر کسی پریشانی کے 3 دنوں میں اپنی سوک بیچ دی۔ انتہائی تجویز کردہ!",
        },
        {
          name: "فاطمہ علی",
          city: "اسلام آباد",
          text: "انٹرفیس بہت صاف ستھرا اور جدید ہے۔ مجھے اردو زبان کا آپشن بہت پسند آیا جس کی وجہ سے یہ سب کے لیے آسان ہو گیا ہے۔",
        },
        {
          name: "بلال احمد",
          city: "پشاور",
          text: "پشاور میں تصدیق شدہ شورومز سے رابطہ کرنا ایک بہترین تجربہ رہا۔ بازار360 پاکستان میں آٹو مارکیٹ کا مستقبل ہے۔",
        },
      ],
    },
  }[lang];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let combined = localQuery.trim();
    if (searchCity !== "All") {
      combined += " " + searchCity;
    }
    if (searchType !== "all") {
      combined += " " + searchType;
    }
    if (searchPrice !== "All") {
      combined += " " + searchPrice;
    }
    setSearchQuery(combined);
    setTab("inventory");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory(brandName);
    setSearchQuery(brandName);
    setTab("inventory");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isRtl = lang === "ur";

  return (
    <div
      id="bazar360-home-viewport"
      className={`flex flex-col space-y-16 pb-16 animate-fade-in text-white font-sans ${isRtl ? "text-right" : "text-left"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* SECTION 1: LUXURY HERO SECTION */}
      <section className="relative rounded-[28px] bg-gradient-to-b from-[#0b0f19] to-[#030712] border border-white/5 py-12 md:py-20 px-6 md:px-12 overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center">
        {/* Glow backdrop decorative accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] md:w-[600px] h-[350px] bg-gradient-to-b from-[#38bdf8]/15 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-3xl flex flex-col items-center space-y-6">
          {/* Active Badge pill */}
          <span className="bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] md:text-xs font-mono font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#38bdf8]/20 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#38bdf8]" />
            {t.heroBadge}
          </span>

          {/* Luxury Large Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-sans leading-[1.1] tracking-tight uppercase">
            {t.heroTitle1} <br className="md:hidden" />
            <span className="bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(56,189,248,0.25)]">
              {t.heroTitle2}
            </span>
          </h1>

          {/* Subhead text */}
          <p className="text-gray-400 text-sm md:text-base max-w-2xl font-sans leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Interactive Responsive Search bar */}
          <div className="w-full max-w-2xl mt-4 shrink-0">
            {/* Condition Tabs */}
            <div className="flex items-center gap-1 mb-1.5 justify-start">
              {(["all", "used", "new"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-t-xl text-[10px] md:text-xs font-mono font-black uppercase tracking-wider transition-all duration-150 border-b-2 ${
                    searchType === type
                      ? "bg-[#030712]/90 text-[#38bdf8] border-[#38bdf8]"
                      : "text-slate-400 border-transparent hover:text-white"
                  }`}
                >
                  {type === "all"
                    ? lang === "en"
                      ? "All Cars"
                      : "تمام گاڑیاں"
                    : type === "used"
                      ? lang === "en"
                        ? "Used Cars"
                        : "استعمال شدہ"
                      : lang === "en"
                        ? "New Cars"
                        : "نئی گاڑیاں"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="bg-[#030712]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:border-[#38bdf8]/40 transition-colors">
                <Search className="text-gray-400 shrink-0 ml-2" size={20} />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-grow bg-transparent text-sm md:text-base border-none outline-none focus:ring-0 text-white placeholder-gray-500 w-full"
                />
                <button
                  type="submit"
                  className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs md:text-sm uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md shadow-[#0ea5e9]/20 shrink-0"
                  style={{ minHeight: "44px" }}
                >
                  {t.searchBtn}
                </button>
              </div>

              {/* Advanced filter select dropdowns underneath search input */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="text-left">
                  <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">
                    City Location
                  </label>
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full bg-[#030712]/90 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                  >
                    <option value="All">
                      {lang === "en" ? "All Cities" : "تمام شہر"}
                    </option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                  </select>
                </div>
                <div className="text-left">
                  <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">
                    Budget Range
                  </label>
                  <select
                    value={searchPrice}
                    onChange={(e) => setSearchPrice(e.target.value)}
                    className="w-full bg-[#030712]/90 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                  >
                    <option value="All">
                      {lang === "en" ? "Any Budget" : "کوئی بھی قیمت"}
                    </option>
                    <option value="Under 15 Lakhs">
                      {lang === "en" ? "Under 15 Lakhs" : "15 لاکھ سے کم"}
                    </option>
                    <option value="15-35 Lakhs">
                      {lang === "en" ? "15 - 35 Lakhs" : "15 سے 35 لاکھ"}
                    </option>
                    <option value="35-75 Lakhs">
                      {lang === "en" ? "35 - 75 Lakhs" : "35 سے 75 لاکھ"}
                    </option>
                    <option value="75+ Lakhs">
                      {lang === "en" ? "75 Lakhs +" : "75 لاکھ سے زیادہ"}
                    </option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Stats indicators underneath */}
          <div className="grid grid-cols-3 gap-4 md:gap-12 pt-8 w-full border-t border-white/5 mt-8">
            {t.stats.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-1 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform duration-300">
                    <IconComp size={18} />
                  </div>
                  <span className="text-white font-sans font-black text-xs md:text-sm tracking-tight pt-1">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: POPULAR BRANDS GRID (16 CARDS) */}
      <section className="space-y-6">
        <div className="flex justify-between items-baseline">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider font-sans border-l-4 border-[#38bdf8] pl-3">
            {t.brandsTitle}
          </h2>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
              setTab("inventory");
            }}
            className="text-xs md:text-sm font-sans font-bold text-[#38bdf8] hover:text-white transition-colors cursor-pointer"
          >
            {t.viewAll}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {POPULAR_BRANDS.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleBrandClick(brand.name)}
              className="bg-[#0b0f19] border border-white/5 hover:border-[#38bdf8]/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all active:scale-95 duration-150 cursor-pointer group hover:shadow-[0_8px_20px_rgba(56,189,248,0.08)] select-none"
              style={{ minHeight: "100px" }}
            >
              <div className="h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {renderBrandLogo(brand.name)}
              </div>
              <span className="text-xs font-sans font-black text-white group-hover:text-[#38bdf8] transition-colors uppercase tracking-tight">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURED INVENTORY & SKELETON SHOWROOMS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Featured Vehicles (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider font-sans border-l-4 border-[#38bdf8] pl-3">
              {t.featuredTitle}
            </h2>
            <button
              onClick={() => setTab("inventory")}
              className="text-xs md:text-sm font-sans font-bold text-[#38bdf8] hover:text-white transition-colors cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          {listings.filter((l) => l.approved !== false).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {listings
                .filter((l) => l.approved !== false)
                .slice(0, 4)
                .map((car) => (
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
            <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
              <Car size={36} className="text-gray-500 animate-pulse" />
              <p className="text-gray-400 text-sm font-sans">{t.noFeatured}</p>
              <button
                onClick={() => setTab("sell")}
                className="bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {t.postAdBtn}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Featured Showrooms (1 col wide) */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider font-sans border-l-4 border-[#38bdf8] pl-3">
              {t.showroomsTitle}
            </h2>
            <button
              onClick={() => setTab("dealers")}
              className="text-xs md:text-sm font-sans font-bold text-[#38bdf8] hover:text-white transition-colors cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="space-y-4">
            {dealers.slice(0, 3).map((showroom) => (
              <div
                key={showroom.id}
                onClick={() => onSelectDealer(showroom.id)}
                className="bg-[#0b0f19] border border-white/5 hover:border-[#38bdf8]/40 p-4 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-0.5 cursor-pointer select-none group"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black font-black text-lg shadow-md shrink-0">
                  {showroom.avatarLetter}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-xs md:text-sm font-sans font-black text-white group-hover:text-[#38bdf8] transition-colors truncate uppercase">
                    {showroom.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-500 font-sans flex items-center gap-0.5">
                      <Star
                        size={10}
                        className="fill-amber-500 text-amber-500"
                      />
                      {showroom.rating}
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans flex items-center gap-1">
                      <MapPin size={10} className="text-[#38bdf8]" />
                      {showroom.location.split(",")[0]}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-500 group-hover:text-white transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY BAZAR360 & CTA POST BANNER */}
      <section className="space-y-12">
        {/* Why Bazar360 Cards Grid */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-center font-sans">
            {t.whyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.whyCards.map((card, i) => {
              const icons = [ShieldCheck, Zap, TrendingUp];
              const IconComp = icons[i];
              return (
                <div
                  key={i}
                  className="bg-[#0b0f19] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-[#38bdf8]/20 transition-all shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
                    <IconComp size={24} />
                  </div>
                  <h3 className="font-sans font-extrabold text-base text-white uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Selling Banner (Screen 4 version) */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0b1329] via-[#030712] to-[#0b1329] border border-white/5 p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="text-[10px] font-mono font-black text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1 rounded-full border border-[#38bdf8]/20 uppercase tracking-widest">
              ⚡ 1-Click AI Selling Sensation
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-sans">
              {t.ctaTitle}
            </h3>
            <p className="text-gray-400 text-xs md:text-sm font-sans leading-relaxed">
              {t.ctaSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setTab("sell")}
              className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs md:text-sm uppercase tracking-wider px-6 py-4 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md shadow-[#0ea5e9]/20 flex items-center justify-center gap-2"
              style={{ minHeight: "48px" }}
            >
              <PlusCircle size={16} />
              {t.sellBtn}
            </button>
            <button
              onClick={() => setTab("inventory")}
              className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-sans font-bold text-xs md:text-sm uppercase tracking-wide px-5 py-4 rounded-xl transition-all border border-white/10 flex items-center justify-center"
              style={{ minHeight: "48px" }}
            >
              {t.browseBtn}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: CUSTOMER REVIEWS */}
      <section className="space-y-6">
        <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-center font-sans">
          {t.reviewsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-[#0b0f19] border border-white/5 p-6 rounded-2xl flex flex-col space-y-4 shadow-md relative"
            >
              <Quote
                size={24}
                className="text-[#38bdf8]/20 absolute top-4 right-4"
              />

              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className="fill-amber-500 text-amber-500"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans italic">
                "{rev.text}"
              </p>

              {/* User Identity */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#38bdf8] font-sans font-black text-xs">
                  {rev.name[0]}
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-sans font-extrabold text-white uppercase tracking-tight">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    {rev.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
