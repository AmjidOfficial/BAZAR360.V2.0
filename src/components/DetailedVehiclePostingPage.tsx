import React, { useState, useRef } from 'react';
import { 
  Car, 
  Cpu, 
  Layers, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle,
  Clock, 
  FileText, 
  Sliders,
  DollarSign,
  CloudUpload,
  X,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Explicit listing structure following user's specs
export interface ComplexListingPayload {
  // Core Specs
  brand: string;
  modelName: string;
  modelYear: number;
  variantName: string;
  exteriorColor: string;
  engineCapacity: string;

  // Condition Matrix
  engineCompression: number;
  gearboxSmoothness: number;
  suspensionRigidity: number;
  interiorCleanliness: number;
  tyreTreadLife: number;
  verifiedKmDriven: number;
  paintBodyStatus: {
    paintType: 'Genuine Paint' | 'Touched Panels' | 'Fully Showered';
    touchedPanels: string[];
    hasAccidentHistory: boolean;
    accidentLogs: string;
  };

  // Legal Shield
  assemblyType: 'Local Assemble' | 'Japanese Import';
  auctionSheetScore?: string;
  ownershipSequence: '1st Owner' | '2nd Owner' | '3rd Owner' | 'More';
  exciseRegistryCity: string;
  tokenTaxStatus: 'Clear Up To Date' | 'Unpaid Back Taxes';
  clearedTaxYear: number;
  physicalDocs: 'Original Smart Card' | 'Complete Original File' | 'Old Original Book' | 'Duplicate Pages File';

  // Logistics & Biometrics
  physicalVenueAddress: string;
  viewingTimeframe: string;
  fileSecurityLocation: 'Held Safely in Showroom Office Counter' | 'Available By Hand';
  biometricInstantlyAvailable: boolean;
  governmentTransferTurnaroundDays: number;
  expectedPrice?: string;
  images?: string[];
}

interface DetailedVehiclePostingPageProps {
  onPostCreated?: (listing: ComplexListingPayload) => void;
}

interface CompressedPhoto {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
  file: File;
  progress: number;
}

export const BRAND_MODELS_MAP: Record<string, string[]> = {
  Toyota: ['Corolla', 'Yaris', 'Fortuner', 'Land Cruiser', 'Hilux', 'Aqua', 'Prius', 'Vitz'],
  Honda: ['Civic', 'City', 'Vezel', 'Accord', 'BR-V', 'N One', 'N Box'],
  Suzuki: ['Alto', 'Wagon R', 'Cultus', 'Swift', 'Mehran', 'Bolan', 'Jimny'],
  Kia: ['Sportage', 'Picanto', 'Sorento', 'Carnival'],
  Hyundai: ['Tucson', 'Elantra', 'Sonata', 'Santa Fe'],
  Changan: ['Alsvin', 'Oshan X7', 'Karvaan'],
  MG: ['HS', 'ZS EV', 'MG 4'],
  Nissan: ['Dayz', 'Juke', 'Patrol', 'Note', 'X-Trail'],
  Audi: ['e-tron', 'A4', 'A6', 'Q5', 'RS Q8'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X5', 'i4'],
};

export default function DetailedVehiclePostingPage({ onPostCreated }: DetailedVehiclePostingPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Section A states (Basics)
  const [brand, setBrand] = useState('Toyota');
  const [modelName, setModelName] = useState('Corolla');
  const [customModelName, setCustomModelName] = useState('');
  const [isOtherModel, setIsOtherModel] = useState(false);
  const [modelYear, setModelYear] = useState(2022);
  const [variantName, setVariantName] = useState('');
  const [exteriorColor, setExteriorColor] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('1300cc');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Section B & C states (Details/Specs & Condition)
  const [engineCompression, setEngineCompression] = useState(90);
  const [gearboxSmoothness, setGearboxSmoothness] = useState(85);
  const [suspensionRigidity, setSuspensionRigidity] = useState(90);
  const [interiorCleanliness, setInteriorCleanliness] = useState(95);
  const [tyreTreadLife, setTyreTreadLife] = useState(80);
  const [verifiedKmDriven, setVerifiedKmDriven] = useState('');
  
  const [paintType, setPaintType] = useState<'Genuine Paint' | 'Touched Panels' | 'Fully Showered'>('Genuine Paint');
  const [selectedTouchedPanels, setSelectedTouchedPanels] = useState<string[]>([]);
  const [hasAccidentHistory, setHasAccidentHistory] = useState(false);
  const [accidentLogs, setAccidentLogs] = useState('');

  const [assemblyType, setAssemblyType] = useState<'Local Assemble' | 'Japanese Import'>('Local Assemble');
  const [auctionScore, setAuctionScore] = useState('4.5');
  const [ownershipSequence, setOwnershipSequence] = useState<'1st Owner' | '2nd Owner' | '3rd Owner' | 'More'>('1st Owner');
  const [exciseRegistryCity, setExciseRegistryCity] = useState('Peshawar Registered');
  const [tokenTaxStatus, setTokenTaxStatus] = useState<'Clear Up To Date' | 'Unpaid Back Taxes'>('Clear Up To Date');
  const [clearedTaxYear, setClearedTaxYear] = useState(2026);
  const [physicalDocs, setPhysicalDocs] = useState<'Original Smart Card' | 'Complete Original File' | 'Old Original Book' | 'Duplicate Pages File'>('Original Smart Card');

  const [physicalVenueAddress, setPhysicalVenueAddress] = useState('');
  const [viewingTimeframe, setViewingTimeframe] = useState('');
  const [fileSecurityLocation, setFileSecurityLocation] = useState<'Held Safely in Showroom Office Counter' | 'Available By Hand'>('Held Safely in Showroom Office Counter');
  const [biometricInstantlyAvailable, setBiometricInstantlyAvailable] = useState(true);
  const [governmentTransferTurnaroundDays, setGovernmentTransferTurnaroundDays] = useState(7);

  // Media (Step 3)
  const [photos, setPhotos] = useState<CompressedPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading/Success feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [postedListing, setPostedListing] = useState<ComplexListingPayload | null>(null);

  const panelOptions = ['Front Bumper', 'Rear Bumper', 'Left Front Door', 'Left Rear Door', 'Right Front Door', 'Right Rear Door', 'Bonnet Hood', 'Trunk Boot Lid', 'Roof'];

  const toggleTouchedPanel = (panel: string) => {
    if (selectedTouchedPanels.includes(panel)) {
      setSelectedTouchedPanels(selectedTouchedPanels.filter(p => p !== panel));
    } else {
      setSelectedTouchedPanels([...selectedTouchedPanels, panel]);
    }
  };

  // Client-side image compression using canvas
  const compressPhoto = (file: File): Promise<{ compressedFile: File; previewUrl: string; compressedSize: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              const previewUrl = URL.createObjectURL(compressedFile);
              resolve({
                compressedFile,
                previewUrl,
                compressedSize: compressedFile.size,
              });
            } else {
              resolve({
                compressedFile: file,
                previewUrl: URL.createObjectURL(file),
                compressedSize: file.size,
              });
            }
          }, 'image/jpeg', 0.72); // 72% quality jpeg compression
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const simulateProgress = (id: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20 + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, progress: currentProgress } : p));
    }, 150);
  };

  const handlePhotoUpload = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newPhotosPromises = Array.from(fileList).map(async (file) => {
      const id = Math.random().toString(36).substring(7);
      
      // Perform instant background compression
      const { compressedFile, previewUrl, compressedSize } = await compressPhoto(file);
      simulateProgress(id);

      return {
        id,
        originalName: file.name,
        originalSize: file.size,
        compressedSize,
        previewUrl,
        file: compressedFile,
        progress: 0
      };
    });

    const resolvedPhotos = await Promise.all(newPhotosPromises);
    setPhotos(prev => [...prev, ...resolvedPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Flow navigation buttons
  const validateStep1 = () => {
    setErrorMessage('');
    if (isOtherModel && !customModelName.trim()) {
      setErrorMessage('Please enter your custom vehicle model name.');
      return false;
    }
    if (!modelName.trim()) {
      setErrorMessage('Please enter the model name to proceed.');
      return false;
    }
    if (!variantName.trim()) {
      setErrorMessage('Please specify the variant / trim designation.');
      return false;
    }
    if (!exteriorColor.trim()) {
      setErrorMessage('Please specify the exterior paint color.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMessage('');
    if (!verifiedKmDriven.trim()) {
      setErrorMessage('Verified odometer kilometers is a required condition metric.');
      return false;
    }
    if (isNaN(Number(verifiedKmDriven))) {
      setErrorMessage('Kilometers driven must be a valid numeric index.');
      return false;
    }
    if (!physicalVenueAddress.trim()) {
      setErrorMessage('Physical inspection address is required for dealer security.');
      return false;
    }
    if (!viewingTimeframe.trim()) {
      setErrorMessage('Preferred viewing timeframe is required.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPostedListing(null);

    if (photos.length === 0) {
      setErrorMessage('Please upload at least one vehicle photo for verification.');
      return;
    }

    setIsSubmitting(true);

    // Simulate luxury API posting with delay
    setTimeout(() => {
      const payload: ComplexListingPayload = {
        brand,
        modelName,
        modelYear,
        variantName,
        exteriorColor,
        engineCapacity,
        engineCompression,
        gearboxSmoothness,
        suspensionRigidity,
        interiorCleanliness,
        tyreTreadLife,
        verifiedKmDriven: Number(verifiedKmDriven),
        paintBodyStatus: {
          paintType,
          touchedPanels: paintType === 'Touched Panels' ? selectedTouchedPanels : [],
          hasAccidentHistory,
          accidentLogs
        },
        assemblyType,
        auctionSheetScore: assemblyType === 'Japanese Import' ? auctionScore : undefined,
        ownershipSequence,
        exciseRegistryCity,
        tokenTaxStatus,
        clearedTaxYear,
        physicalDocs,
        physicalVenueAddress,
        viewingTimeframe,
        fileSecurityLocation,
        biometricInstantlyAvailable,
        governmentTransferTurnaroundDays,
        expectedPrice: expectedPrice ? `${expectedPrice} PKR` : undefined,
        images: photos.map(p => p.previewUrl)
      };

      setPostedListing(payload);
      setIsSubmitting(false);

      if (onPostCreated) {
        onPostCreated(payload);
      }
    }, 1200);
  };

  return (
    <div className="w-full bg-bg-secondary text-text-main py-8 px-5 md:px-8 rounded-3xl border border-border-main shadow-2xl transition-all max-w-4xl mx-auto" id="60s-ad-posting-wizard">
      
      {/* 3-Step Compact Timeline Header */}
      <div className="mb-8 border-b border-border-main pb-6">
        <div className="flex items-center gap-1.5 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-3 w-fit">
          <Sparkles size={10} className="animate-pulse" /> 60-Second Instant Post Flow
        </div>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-text-main">
          List Your Premium Asset
        </h2>
        <p className="text-text-muted text-xs mt-1">
          Provide essential specs, verify mechanical conditions, and upload compressed media instantly.
        </p>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-between mt-6 gap-2">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Specs & Condition' },
            { num: 3, label: 'Photos & Submit' }
          ].map((s) => (
            <React.Fragment key={s.num}>
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (s.num === 1) setStep(1);
                  if (s.num === 2 && validateStep1()) setStep(2);
                  if (s.num === 3 && validateStep1() && validateStep2()) setStep(3);
                }}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black transition-all duration-300 ${
                  step === s.num
                    ? 'bg-accent-main text-stone-950 scale-110 shadow-lg shadow-accent-main/20'
                    : step > s.num
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-bg-primary border border-border-main text-text-muted'
                }`}>
                  {step > s.num ? <Check size={12} strokeWidth={3} /> : s.num}
                </div>
                <span className={`text-[10px] font-mono font-black uppercase tracking-widest hidden sm:inline ${
                  step === s.num ? 'text-accent-main' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
              {s.num < 3 && (
                <div className={`flex-grow h-0.5 max-w-[100px] rounded ${
                  step > s.num ? 'bg-emerald-500/30' : 'bg-border-main'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={step === 3 ? handleFinalSubmit : (e) => e.preventDefault()} className="space-y-6">
        
        <AnimatePresence mode="wait">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <h3 className="text-xs font-mono font-black uppercase text-accent-main tracking-widest flex items-center gap-2 border-b border-border-main pb-2">
                <Car size={14} /> Step 1: Elite Manufacture & Basics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Manufacture Brand/Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => {
                      const selectedBrand = e.target.value;
                      setBrand(selectedBrand);
                      const defaultModel = BRAND_MODELS_MAP[selectedBrand]?.[0] || 'Other';
                      setModelName(defaultModel);
                      setIsOtherModel(defaultModel === 'Other');
                    }}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kia">Kia</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Changan">Changan</option>
                    <option value="MG">MG</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Audi">Audi (Premium)</option>
                    <option value="BMW">BMW (Premium)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={isOtherModel ? 'Other' : modelName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setIsOtherModel(true);
                        setModelName(customModelName || '');
                      } else {
                        setIsOtherModel(false);
                        setModelName(val);
                      }
                    }}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none font-bold"
                  >
                    {(BRAND_MODELS_MAP[brand] || []).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Other">Other / Custom Model...</option>
                  </select>
                </div>

                {isOtherModel && (
                  <div className="space-y-1.5 md:col-span-2 animate-fade-in">
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-accent-main flex items-center gap-1.5">
                      <Sparkles size={11} className="animate-spin-slow" /> Enter Custom Model Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Crown, Mark X, Prius Alpha, etc."
                      value={customModelName}
                      onChange={(e) => {
                        setCustomModelName(e.target.value);
                        setModelName(e.target.value);
                      }}
                      className="w-full bg-bg-primary border border-accent-main/40 focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none placeholder-text-muted/40 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Model Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modelYear}
                    onChange={(e) => setModelYear(Number(e.target.value))}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none font-mono"
                  >
                    {Array.from({ length: 27 }, (_, i) => 2027 - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Variant Spec Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Grande 1.8 Altis, VTi Oriel"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none placeholder-text-muted/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Engine Displacement <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={engineCapacity}
                    onChange={(e) => setEngineCapacity(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none font-mono"
                  >
                    <option value="660cc">660 cc (Hatchbacks)</option>
                    <option value="1000cc">1000 cc</option>
                    <option value="1300cc">1300 cc (Eco sedans)</option>
                    <option value="1500cc">1500 cc</option>
                    <option value="1800cc">1800 cc</option>
                    <option value="2000cc">2000 cc</option>
                    <option value="2700cc">2700 cc (SUVs)</option>
                    <option value="4000cc">4000 cc</option>
                    <option value="EV-Battery">Pure Electric Drive (EV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Exterior Paint Color Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Attitude Black Pearl, Super White"
                    value={exteriorColor}
                    onChange={(e) => setExteriorColor(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none placeholder-text-muted/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Expected Asking Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-text-muted font-mono text-xs">PKR</span>
                    <input
                      type="text"
                      placeholder="e.g., 5,800,000"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl pl-12 pr-3 py-3 text-xs text-text-main focus:outline-none font-mono placeholder-text-muted/40"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS, SPECS & CONDITION MATRIX */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-mono font-black uppercase text-accent-main tracking-widest flex items-center gap-2 border-b border-border-main pb-2">
                <Sliders size={14} /> Step 2: Specs & Physical Health Matrix
              </h3>

              {/* Gauges section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-bg-primary p-5 rounded-2xl border border-border-main">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                    <span className="font-black text-text-muted">Engine Compression Gauge</span>
                    <span className="text-accent-main font-extrabold">{engineCompression}% Rating</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={engineCompression}
                    onChange={(e) => setEngineCompression(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                    <span className="font-black text-text-muted">Transmission/Gearbox Smoothness</span>
                    <span className="text-accent-main font-extrabold">{gearboxSmoothness}% Smooth</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={gearboxSmoothness}
                    onChange={(e) => setGearboxSmoothness(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                    <span className="font-black text-text-muted">Suspension Rigidity</span>
                    <span className="text-accent-main font-extrabold">{suspensionRigidity}% Strict</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={suspensionRigidity}
                    onChange={(e) => setSuspensionRigidity(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                    <span className="font-black text-text-muted">Interior Cleanliness</span>
                    <span className="text-accent-main font-extrabold">{interiorCleanliness}% Clean</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={interiorCleanliness}
                    onChange={(e) => setInteriorCleanliness(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                    <span className="font-black text-text-muted">Tyre Tread Remaining</span>
                    <span className="text-accent-main font-extrabold">{tyreTreadLife}% Left</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={tyreTreadLife}
                    onChange={(e) => setTyreTreadLife(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Total Odometer Index (KM Driven) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 42500"
                    value={verifiedKmDriven}
                    onChange={(e) => setVerifiedKmDriven(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none font-mono placeholder-text-muted/40"
                  />
                </div>
              </div>

              {/* Paint & Docs specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted block">
                    Paint & Outer Body Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Genuine Paint', 'Touched Panels', 'Fully Showered'] as const).map(style => (
                      <button
                        type="button"
                        key={style}
                        onClick={() => {
                          setPaintType(style);
                          if (style !== 'Touched Panels') setSelectedTouchedPanels([]);
                        }}
                        className={`py-2 rounded-xl border text-[9px] font-black uppercase text-center transition-all ${
                          paintType === style
                            ? 'bg-accent-main/15 border-accent-main text-accent-main'
                            : 'bg-bg-primary border-border-main text-text-muted hover:text-text-main'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  {paintType === 'Touched Panels' && (
                    <div className="space-y-2 p-3 bg-bg-primary rounded-2xl border border-border-main">
                      <span className="text-[8.5px] font-mono font-black uppercase tracking-widest text-amber-500 block">Select Touched Panels:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {panelOptions.map(panel => {
                          const selected = selectedTouchedPanels.includes(panel);
                          return (
                            <button
                              type="button"
                              key={panel}
                              onClick={() => toggleTouchedPanel(panel)}
                              className={`py-1.5 px-2.5 rounded-lg text-[8.5px] font-mono border transition-all text-left flex justify-between items-center ${
                                selected
                                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                                  : 'bg-bg-secondary border-border-main text-text-muted hover:text-text-main'
                              }`}
                            >
                              <span>{panel}</span>
                              {selected && <CheckCircle size={10} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                      Import Classification <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Local Assemble', 'Japanese Import'] as const).map(type => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setAssemblyType(type)}
                          className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase text-center transition-all ${
                            assemblyType === type
                              ? 'bg-accent-main/15 border-accent-main text-accent-main'
                              : 'bg-bg-primary border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {assemblyType === 'Japanese Import' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                        Auction Sheet Score <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={auctionScore}
                        onChange={(e) => setAuctionScore(e.target.value)}
                        className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none font-mono"
                      >
                        <option value="5.0">5.0 (Near Immaculate)</option>
                        <option value="4.5">4.5 (Highly Immaculate)</option>
                        <option value="4.0">4.0 (Good Condition)</option>
                        <option value="3.5">3.5 (Average Panels)</option>
                        <option value="R">R (Rebuilt / Repaired)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Registrations & Biometrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Excise Registry Domain City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={exciseRegistryCity}
                    onChange={(e) => setExciseRegistryCity(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none"
                  >
                    <option value="Peshawar Registered">Peshawar Registered</option>
                    <option value="Islamabad Registered">Islamabad Registered</option>
                    <option value="Lahore Registered">Lahore Registered</option>
                    <option value="Karachi Registered">Karachi Registered</option>
                    <option value="Unregistered / Raw">Unregistered (Raw In-hand)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Physical Spot Inspection Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Almas Car Valley, Ring Road, Peshawar"
                    value={physicalVenueAddress}
                    onChange={(e) => setPhysicalVenueAddress(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none placeholder-text-muted/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Preferred Buyer Viewing Timeframe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mon-Sat (11:00 AM to 06:00 PM)"
                    value={viewingTimeframe}
                    onChange={(e) => setViewingTimeframe(e.target.value)}
                    className="w-full bg-bg-primary border border-border-main focus:border-accent-main rounded-xl p-3 text-xs text-text-main focus:outline-none placeholder-text-muted/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                    Biometric Fingerprint Transfer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl border border-border-main h-[46px]">
                    <button
                      type="button"
                      onClick={() => setBiometricInstantlyAvailable(!biometricInstantlyAvailable)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        biometricInstantlyAvailable ? 'bg-emerald-500' : 'bg-border-main'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-bg-primary shadow transition duration-200 ${
                        biometricInstantlyAvailable ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-text-main">
                      {biometricInstantlyAvailable ? 'Instantly Available' : 'Requires Notice'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PHOTOS & SUBMIT */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-mono font-black uppercase text-accent-main tracking-widest flex items-center gap-2 border-b border-border-main pb-2">
                <CloudUpload size={14} /> Step 3: Photos & Instant Compression
              </h3>

              {/* Instant Image Compression Drag & Drop Input */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-bg-primary border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging ? 'border-accent-main bg-accent-main/5 scale-[1.01]' : 'border-border-main hover:border-accent-main/40'
                }`}
              >
                <div className="w-14 h-14 bg-bg-secondary rounded-full flex items-center justify-center mb-4 border border-border-main text-text-muted">
                  <CloudUpload size={28} className={isDragging ? 'text-accent-main' : 'text-text-muted'} />
                </div>
                <h3 className="text-text-main font-black text-sm mb-1 uppercase tracking-tight">Drag & Drop Car Photos</h3>
                <p className="text-text-muted font-mono text-[10px] uppercase tracking-wider">or Click to Browse from Files</p>
                <span className="text-[10px] text-text-muted/60 mt-1.5 font-mono">⚡ Instant background auto-compression enabled</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </div>

              {/* Compressed Photo Previews with sizing analytics report */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-black uppercase text-text-muted tracking-widest">
                    Media Pool & Verification Previews
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.map(p => {
                      const reduction = Math.round(((p.originalSize - p.compressedSize) / p.originalSize) * 100);
                      return (
                        <div key={p.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-primary border border-border-main group">
                          <img src={p.previewUrl} alt="compressed preview" className="w-full h-full object-cover" />
                          
                          {/* Close/Remove btn */}
                          <button 
                            type="button"
                            onClick={() => removePhoto(p.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-stone-950/70 hover:bg-stone-950 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                          >
                            <X size={11} />
                          </button>

                          {/* Compression Diagnostics overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-stone-950/80 backdrop-blur-[2px] p-2 text-[8.5px] font-mono text-white/90">
                            <div className="flex justify-between font-bold text-accent-main uppercase">
                              <span>Auto-Compressed</span>
                              <span>-{reduction}%</span>
                            </div>
                            <div className="flex justify-between text-white/50 mt-0.5">
                              <span>{(p.originalSize / 1024 / 1024).toFixed(1)}MB</span>
                              <span>→</span>
                              <span>{(p.compressedSize / 1024).toFixed(0)}KB</span>
                            </div>
                          </div>

                          {/* Progress layer */}
                          {p.progress < 100 && (
                            <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-[1px] flex items-center justify-center p-3">
                              <div className="w-full">
                                <div className="flex justify-between items-center text-[8px] font-mono text-text-muted mb-1 font-bold">
                                  <span>Compiling...</span>
                                  <span>{Math.round(p.progress)}%</span>
                                </div>
                                <div className="h-1 bg-border-main rounded-full overflow-hidden">
                                  <div className="h-full bg-accent-main rounded-full" style={{ width: `${p.progress}%` }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs font-mono">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{errorMessage.toUpperCase()}</span>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-border-main gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3 rounded-xl border border-border-main text-text-muted hover:text-text-main font-mono text-xs uppercase font-black flex items-center gap-1.5 transition-colors cursor-pointer select-none active:scale-[0.98]"
            >
              <ChevronLeft size={13} strokeWidth={3} /> Prev Step
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 bg-accent-main text-stone-950 rounded-xl font-mono text-xs uppercase font-black flex items-center gap-1.5 transition-all hover:bg-accent-main/90 shadow-lg shadow-accent-main/10 cursor-pointer select-none active:scale-[0.98]"
            >
              Next Step <ChevronRight size={13} strokeWidth={3} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 bg-accent-main hover:bg-accent-main/95 text-stone-950 rounded-xl font-mono text-xs uppercase font-black tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-accent-main/10 cursor-pointer select-none disabled:opacity-40 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                'Publish Luxury Listing'
              )}
            </button>
          )}
        </div>

        {/* Success Output Summary Card */}
        {postedListing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5.5 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check size={12} strokeWidth={3} />
              </div>
              <h4 className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                Asset Listed Successfully
              </h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Your high-end {postedListing.brand} {postedListing.modelName} ({postedListing.modelYear}) ad has been processed with {photos.length} compressed photos. Live mechanics maps have been registered in our central ledger.
            </p>
            <div className="p-3.5 bg-bg-primary border border-border-main rounded-xl text-[10px] font-mono text-accent-main/90 overflow-x-auto">
              <div className="font-bold border-b border-border-main pb-1.5 mb-1.5 flex justify-between uppercase">
                <span>Verification ID</span>
                <span>BAZAR360-{Math.random().toString(36).substring(4, 9).toUpperCase()}</span>
              </div>
              <div>Brand: {postedListing.brand}</div>
              <div>Model: {postedListing.modelName}</div>
              <div>Year: {postedListing.modelYear}</div>
              <div>Compression Score: {postedListing.engineCompression}%</div>
              <div>Odometer KM: {postedListing.verifiedKmDriven.toLocaleString()} KM</div>
              <div>Venue address: {postedListing.physicalVenueAddress}</div>
            </div>
          </motion.div>
        )}

      </form>
    </div>
  );
}
