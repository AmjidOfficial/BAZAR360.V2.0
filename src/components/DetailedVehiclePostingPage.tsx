import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

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
}

interface DetailedVehiclePostingPageProps {
  onPostCreated?: (listing: ComplexListingPayload) => void;
}

export default function DetailedVehiclePostingPage({ onPostCreated }: DetailedVehiclePostingPageProps) {
  // Section A states
  const [brand, setBrand] = useState('Toyota');
  const [modelName, setModelName] = useState('');
  const [modelYear, setModelYear] = useState(2022);
  const [variantName, setVariantName] = useState('');
  const [exteriorColor, setExteriorColor] = useState('');
  const [engineCapacity, setEngineCapacity] = useState('1300cc');

  // Section B states
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

  // Section C states
  const [assemblyType, setAssemblyType] = useState<'Local Assemble' | 'Japanese Import'>('Local Assemble');
  const [auctionScore, setAuctionScore] = useState('4.5');
  const [ownershipSequence, setOwnershipSequence] = useState<'1st Owner' | '2nd Owner' | '3rd Owner' | 'More'>('1st Owner');
  const [exciseRegistryCity, setExciseRegistryCity] = useState('Peshawar Registered');
  const [tokenTaxStatus, setTokenTaxStatus] = useState<'Clear Up To Date' | 'Unpaid Back Taxes'>('Clear Up To Date');
  const [clearedTaxYear, setClearedTaxYear] = useState(2026);
  const [physicalDocs, setPhysicalDocs] = useState<'Original Smart Card' | 'Complete Original File' | 'Old Original Book' | 'Duplicate Pages File'>('Original Smart Card');

  // Section D states
  const [physicalVenueAddress, setPhysicalVenueAddress] = useState('');
  const [viewingTimeframe, setViewingTimeframe] = useState('');
  const [fileSecurityLocation, setFileSecurityLocation] = useState<'Held Safely in Showroom Office Counter' | 'Available By Hand'>('Held Safely in Showroom Office Counter');
  const [biometricInstantlyAvailable, setBiometricInstantlyAvailable] = useState(true);
  const [governmentTransferTurnaroundDays, setGovernmentTransferTurnaroundDays] = useState(7);
  const [expectedPrice, setExpectedPrice] = useState('');

  // Feedback states
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

  const handleCreatePosting = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPostedListing(null);

    // Form validation
    if (!modelName.trim()) {
      setErrorMessage('Model Name is required (Section A).');
      return;
    }
    if (!variantName.trim()) {
      setErrorMessage('Variant Name / trim spec is required (Section A).');
      return;
    }
    if (!exteriorColor.trim()) {
      setErrorMessage('Exterior Paint Color designation is required (Section A).');
      return;
    }
    if (!verifiedKmDriven.trim()) {
      setErrorMessage('Verified Odometer Kilometers is required (Section B).');
      return;
    }
    if (isNaN(Number(verifiedKmDriven))) {
      setErrorMessage('Kilometers Driven must be a valid numerical value.');
      return;
    }
    if (!physicalVenueAddress.trim()) {
      setErrorMessage('Physical Inspection Venue verification address is required (Section D).');
      return;
    }
    if (!viewingTimeframe.trim()) {
      setErrorMessage('Preferred buyer viewing timeframe is required (Section D).');
      return;
    }

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
      expectedPrice: expectedPrice ? `${expectedPrice} PKR` : undefined
    };

    setPostedListing(payload);
    if (onPostCreated) {
      onPostCreated(payload);
    }
  };

  return (
    <div className="w-full bg-[#070c18] text-white py-4 rounded-3xl" id="detailed-posting-wrapper">
      
      {/* Decorative Branding header */}
      <div className="border-b border-[#1f2937] pb-6 mb-8">
        <span className="inline-flex items-center gap-1 bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[#ff6b00] font-mono text-[9.5px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2">
          ✦ COMPREHENSIVE CAR INSPECTION MATRIX
        </span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          Secure Car Posting & Verification Engine
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Map physical mechanics, genuine documentation variables, and logistics venues directly into Auto Choice market ledgers.
        </p>
      </div>

      <form onSubmit={handleCreatePosting} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Sections */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECTION A: Core Brand & Model Specs */}
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 space-y-4" id="specs-section">
            <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
              <Car size={14} /> Section A: Elite Manufacture & Model Specs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Manufacture Brand/Company <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none"
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
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Model Name <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Land Cruiser, Yaris, Civic"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Model Year <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={modelYear}
                  onChange={(e) => setModelYear(Number(e.target.value))}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                >
                  {Array.from({ length: 27 }, (_, i) => 2027 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Variant Spec Designation <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grande 1.8 Altis, VTi Oriel"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Engine Power Displacement <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={engineCapacity}
                  onChange={(e) => setEngineCapacity(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
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
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Exterior Paint Color Name <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Attitude Black Pearl, Super White"
                  value={exteriorColor}
                  onChange={(e) => setExteriorColor(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Expected Asking Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-mono text-xs">PKR</span>
                  <input
                    type="text"
                    placeholder="e.g., 5,800,000"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl pl-12 pr-3 py-3 text-xs text-white focus:outline-none font-mono placeholder-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Mechanical & Structural Condition Metrics */}
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 space-y-6" id="condition-section">
            <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
              <Sliders size={14} /> Section B: Condition Matrix & Physical Health
            </h3>

            {/* Condition Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="font-black text-gray-400">Engine Compression Gauge</span>
                  <span className="text-[#00d2ff] font-extrabold">{engineCompression}% Rating</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={engineCompression}
                  onChange={(e) => setEngineCompression(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="font-black text-gray-400">Transmission/Gearbox Smoothness</span>
                  <span className="text-[#00d2ff] font-extrabold">{gearboxSmoothness}% Smooth</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={gearboxSmoothness}
                  onChange={(e) => setGearboxSmoothness(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="font-black text-gray-400">Suspension & Dampener Rigidity</span>
                  <span className="text-[#00d2ff] font-extrabold">{suspensionRigidity}% Strict</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={suspensionRigidity}
                  onChange={(e) => setSuspensionRigidity(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="font-black text-gray-400">Interior Cleanliness Status</span>
                  <span className="text-[#00d2ff] font-extrabold">{interiorCleanliness}% Clean</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={interiorCleanliness}
                  onChange={(e) => setInteriorCleanliness(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="font-black text-gray-400">Tyre Tread Remaining Life</span>
                  <span className="text-[#00d2ff] font-extrabold">{tyreTreadLife}% Left</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={tyreTreadLife}
                  onChange={(e) => setTyreTreadLife(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#070c18] rounded-lg appearance-none cursor-pointer accent-[#00d2ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Verified Total Odometer (KM Driven) <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 42500"
                  value={verifiedKmDriven}
                  onChange={(e) => setVerifiedKmDriven(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono placeholder-gray-600"
                />
              </div>
            </div>

            {/* Body Panels Imperfectness Map */}
            <div className="border-t border-[#1f2937] pt-4 space-y-4">
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block">
                Paint & Outer Body Status <span className="text-[#ff6b00]">*</span>
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
                    className={`p-3 rounded-xl border text-[10px] font-black uppercase text-center transition-all ${
                      paintType === style
                        ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#070c18] border-[#1f2937] text-gray-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {paintType === 'Touched Panels' && (
                <div className="animate-fade-in space-y-2 p-3 bg-[#070c18] rounded-2xl border border-[#1f2937]">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-orange-400">Select Specific Painted Panels:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {panelOptions.map(panel => {
                      const selected = selectedTouchedPanels.includes(panel);
                      return (
                        <button
                          type="button"
                          key={panel}
                          onClick={() => toggleTouchedPanel(panel)}
                          className={`p-2 rounded text-[9px] font-mono border transition-all text-left flex justify-between items-center ${
                            selected
                              ? 'bg-amber-500/10 border-amber-500/60 text-amber-400'
                              : 'bg-slate-900/60 border-white/5 text-gray-500 hover:text-gray-300'
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

              {/* Accident Log History */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                <div className="md:col-span-4 flex items-center">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasAccidentHistory(!hasAccidentHistory)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        hasAccidentHistory ? 'bg-[#ff6b00]' : 'bg-gray-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        hasAccidentHistory ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-300">Accident History?</span>
                  </div>
                </div>

                <div className="md:col-span-8">
                  <textarea
                    placeholder="Describe any accidental repair logs or physical dents..."
                    value={accidentLogs}
                    onChange={(e) => setAccidentLogs(e.target.value)}
                    disabled={!hasAccidentHistory}
                    rows={2}
                    className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#ff6b00] disabled:opacity-40 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: Buyer's Legal Shield & Verification Vault */}
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 space-y-4" id="legal-section">
            <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
              <ShieldCheck size={14} /> Section C: Safe Shield & Excise Registrations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Import Classification Status <span className="text-[#ff6b00]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Local Assemble', 'Japanese Import'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setAssemblyType(type)}
                      className={`p-3 rounded-xl border text-[10px] font-black uppercase text-center transition-all ${
                        assemblyType === type
                          ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff]'
                          : 'bg-[#070c18] border-[#1f2937] text-gray-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {assemblyType === 'Japanese Import' ? (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Japan Auction sheet score <span className="text-[#ff6b00]">*</span>
                  </label>
                  <select
                    value={auctionScore}
                    onChange={(e) => setAuctionScore(e.target.value)}
                    className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="5.0">5.0 (Near Immaculate)</option>
                    <option value="4.5">4.5 (Highly Immaculate)</option>
                    <option value="4.0">4.0 (Good Condition)</option>
                    <option value="3.5">3.5 (Average Panels)</option>
                    <option value="R">R (Rebuilt / Repaired)</option>
                    <option value="S">S (Special Custom)</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-[#070c18]/40 border border-white/5 rounded-xl">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider text-center">Localized Pakistan Assemble sequence bypasses Auction Check</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Ownership Sequence Index <span className="text-[#ff6b00]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['1st Owner', '2nd Owner', '3rd Owner', 'More'] as const).map(owner => (
                    <button
                      type="button"
                      key={owner}
                      onClick={() => setOwnershipSequence(owner)}
                      className={`p-2.5 rounded-lg border text-[9px] font-mono font-black uppercase text-center transition-all ${
                        ownershipSequence === owner
                          ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff]'
                          : 'bg-[#070c18] border-[#1f2937] text-gray-500 hover:text-white'
                      }`}
                    >
                      {owner.replace(' Owner', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Excise Registration Domain Location <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={exciseRegistryCity}
                  onChange={(e) => setExciseRegistryCity(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  <option value="Peshawar Registered">Peshawar Registered</option>
                  <option value="Islamabad Registered">Islamabad Registered</option>
                  <option value="Lahore Registered">Lahore Registered</option>
                  <option value="Karachi Registered">Karachi Registered</option>
                  <option value="Unregistered / Raw">Unregistered (Raw/Custom In-hand)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Token Tax Status Gate <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={tokenTaxStatus}
                  onChange={(e) => setTokenTaxStatus(e.target.value as any)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none text-[11px]"
                >
                  <option value="Clear Up To Date">Token Paid: Clear Up To Date</option>
                  <option value="Unpaid Back Taxes">Unpaid Back Taxes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Cleared Token Tax Year <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2026"
                  value={clearedTaxYear}
                  onChange={(e) => setClearedTaxYear(Number(e.target.value))}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Physical Documents Type <span className="text-[#ff6b00]">*</span>
                </label>
                <select
                  value={physicalDocs}
                  onChange={(e) => setPhysicalDocs(e.target.value as any)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  <option value="Original Smart Card">Original Smart Card</option>
                  <option value="Complete Original File">Complete Original File</option>
                  <option value="Old Original Book">Old Original Book</option>
                  <option value="Duplicate Pages File">Duplicate Pages File</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION D: Logistics, Venue, & Biometric Authorization */}
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 space-y-4" id="logistics-section">
            <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
              <Clock size={14} /> Section D: Logistics, Verification & Biometrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Physical Spot Inspection Venue <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Almas Car Valley, Ring Road, Peshawar"
                  value={physicalVenueAddress}
                  onChange={(e) => setPhysicalVenueAddress(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Preferred Buyer Viewing Timeframes <span className="text-[#ff6b00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mon-Sat (11:00 AM to 06:00 PM)"
                  value={viewingTimeframe}
                  onChange={(e) => setViewingTimeframe(e.target.value)}
                  className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Central Registration Book Storage <span className="text-[#ff6b00]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setFileSecurityLocation('Held Safely in Showroom Office Counter')}
                    className={`p-3 rounded-xl border text-[10px] font-mono font-black uppercase text-left transition-all flex justify-between items-center ${
                      fileSecurityLocation === 'Held Safely in Showroom Office Counter'
                        ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#070c18] border-[#1f2937] text-gray-500 hover:text-white'
                    }`}
                  >
                    <span>🏢 Held Safely in Showroom Office Counter</span>
                    {fileSecurityLocation === 'Held Safely in Showroom Office Counter' && <CheckCircle size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileSecurityLocation('Available By Hand')}
                    className={`p-3 rounded-xl border text-[10px] font-mono font-black uppercase text-left transition-all flex justify-between items-center ${
                      fileSecurityLocation === 'Available By Hand'
                        ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff]'
                        : 'bg-[#070c18] border-[#1f2937] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🔑 File Available By Hand (Owner Custody)</span>
                    {fileSecurityLocation === 'Available By Hand' && <CheckCircle size={12} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#070c18] rounded-xl border border-[#1f2937]">
                  <button
                    type="button"
                    onClick={() => setBiometricInstantlyAvailable(!biometricInstantlyAvailable)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      biometricInstantlyAvailable ? 'bg-[#00d2ff]' : 'bg-gray-800'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#070c18] shadow ring-0 transition duration-200 ${
                      biometricInstantlyAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-300 block">Biometric Instantly Ready?</span>
                    <span className="text-[8.5px] text-gray-500 block">Fingerprint transfer verification on spot</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Government Title Transfer Turnaround <span className="text-[#ff6b00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="60"
                      value={governmentTransferTurnaroundDays}
                      onChange={(e) => setGovernmentTransferTurnaroundDays(Number(e.target.value))}
                      className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-gray-500">DAYS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Matrix Summary & Submission Results */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-5 space-y-5">
            <h4 className="text-[10px] font-mono font-black uppercase text-[#00d2ff] tracking-wider border-b border-white/5 pb-2">
              Vehicle Health Certificate
            </h4>

            {/* Simulated Live Instrument Cluster */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#070c18] p-3 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono font-black text-gray-500 uppercase block">Engine Compression</span>
                <span className="text-sm font-extrabold text-[#00d2ff] font-mono mt-1 block">{engineCompression}%</span>
              </div>
              <div className="bg-[#070c18] p-3 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono font-black text-gray-500 uppercase block">Odometer Log</span>
                <span className="text-sm font-extrabold text-[#ff6b00] font-mono mt-1 block">
                  {verifiedKmDriven ? `${Number(verifiedKmDriven).toLocaleString()}` : '0'} <span className="text-[8px]">KM</span>
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Legal Registry City:</span>
                <span className="font-mono text-[9px] font-extrabold text-white">{exciseRegistryCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Assembly Node:</span>
                <span className="font-mono text-[9px] font-extrabold text-white">{assemblyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Documents Inhand:</span>
                <span className="font-mono text-[9px] font-extrabold text-white">{physicalDocs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax Safe Clearance:</span>
                <span className={`font-mono text-[9px] font-extrabold ${tokenTaxStatus === 'Clear Up To Date' ? 'text-emerald-400' : 'text-red-400'}`}>
                  Paid up to {clearedTaxYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biometric Verification:</span>
                <span className={`font-mono text-[9px] font-extrabold ${biometricInstantlyAvailable ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`}>
                  {biometricInstantlyAvailable ? 'INSTANTLY READY' : 'BY REPRES'}
                </span>
              </div>
            </div>
            
            {/* Submit Conversion CTA */}
            <button
              type="submit"
              className="w-full bg-[#ff6b00] hover:bg-[#ff8533] duration-200 text-slate-950 font-sans font-black tracking-widest text-[11px] uppercase py-3.5 rounded-xl shadow-lg shadow-orange-950/20 cursor-pointer select-none active:scale-[0.98]"
            >
              Post High-Fidelity Listing
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs animate-shake">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Posted Data Package View */}
          {postedListing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 space-y-4"
              id="posting-success-indicator"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                  <CheckCircle size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-wider">Trading Asset Registered!</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The high-fidelity vehicle posting has been committed. The mechanical physical condition map has been compiled below for Auto Choice inspection ledgers:
              </p>
              <pre className="bg-[#070c18] p-3 rounded-xl text-[9px] font-mono text-[#00d2ff] overflow-x-auto border border-white/5 max-h-48 leading-relaxed">
                {JSON.stringify(postedListing, null, 2)}
              </pre>
            </motion.div>
          )}

        </div>

      </form>

    </div>
  );
}
