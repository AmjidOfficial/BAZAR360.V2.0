import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Info, 
  AlertCircle,
  Car,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { translations, Language } from '../translations';
import { dbSaveListing } from '../lib/dbService';
import { CarListing } from '../types';

interface DetailedVehiclePostingPageProps {
  onPostCreated?: (payload: CarListing) => void;
  lang?: Language;
  currentUser?: any;
}

const VEHICLE_TYPES = [
  { id: 'car', labelKey: 'car' },
  { id: 'suv', labelKey: 'suvJeep' },
  { id: 'van', labelKey: 'van' },
  { id: 'motorcycle', labelKey: 'motorcycle' },
  { id: 'truck', labelKey: 'truck' },
  { id: 'bus', labelKey: 'bus' },
  { id: 'commercial', labelKey: 'commercial' }
];

const MAKES_DICTIONARY: Record<string, string[]> = {
  Toyota: ['Corolla', 'Yaris', 'Fortuner', 'Hilux', 'Land Cruiser', 'Prado', 'Aqua', 'Prius', 'Vitz'],
  Honda: ['Civic', 'City', 'Vezel', 'BR-V', 'Accord', 'CR-V', 'N-Wgn'],
  Suzuki: ['Alto', 'Cultus', 'Wagon R', 'Swift', 'Mehran', 'Bolan', 'Jimny'],
  Hyundai: ['Elantra', 'Tucson', 'Sonata', 'Porter', 'Santa Fe'],
  Kia: ['Sportage', 'Picanto', 'Stinger', 'Sorento', 'Carnival'],
  Nissan: ['Dayz', 'Note', 'Juke', 'X-Trail', 'Patrol'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X1', 'X5', 'i4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLE']
};

export default function DetailedVehiclePostingPage({ onPostCreated, lang = 'en', currentUser }: DetailedVehiclePostingPageProps) {
  const t = translations[lang];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1: Basic Information
  const [vehicleType, setVehicleType] = useState('car');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Corolla');
  const [customModel, setCustomModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState<number>(2023);

  // STEP 2: Vehicle Details
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [engineCC, setEngineCC] = useState('1300');
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [color, setColor] = useState('');
  const [registrationCity, setRegistrationCity] = useState('');
  const [condition, setCondition] = useState<'New' | 'Used'>('Used');
  const [bodyCondition, setBodyCondition] = useState<'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint'>('Total Genuine');

  // STEP 3: Media Upload (State & Refs)
  const [photos, setPhotos] = useState<Array<{ file?: File; previewUrl: string; size: number }>>([]);
  const [videos, setVideos] = useState<Array<{ file?: File; previewUrl: string; size: number }>>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // STEP 4: Seller Details
  const [sellerName, setSellerName] = useState(currentUser?.displayName || '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phoneNumber || '');
  const [sellerWhatsApp, setSellerWhatsApp] = useState(currentUser?.phoneNumber || '');
  const [location, setLocation] = useState(currentUser?.city || 'Peshawar, Pakistan');

  // Submission / Loading Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Derived Model options
  const modelOptions = useMemo(() => {
    return MAKES_DICTIONARY[make] || [];
  }, [make]);

  // Adjust model if make changes
  React.useEffect(() => {
    if (modelOptions.length > 0) {
      setModel(modelOptions[0]);
    } else {
      setModel('Other');
    }
  }, [make, modelOptions]);

  // Generate Year range
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 1; y >= 1990; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compress image on the client side using canvas
  const compressImage = (file: File): Promise<{ previewUrl: string; size: number; file: File }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve({
                previewUrl: URL.createObjectURL(compressedFile),
                size: compressedFile.size,
                file: compressedFile
              });
            } else {
              resolve({
                previewUrl: URL.createObjectURL(file),
                size: file.size,
                file
              });
            }
          }, 'image/jpeg', 0.82);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Media upload handlers
  const handlePhotoFiles = async (files: FileList) => {
    if (photos.length >= 10) {
      alert(lang === 'ur' ? 'آپ زیادہ سے زیادہ 10 تصاویر منتخب کر سکتے ہیں۔' : 'You can upload a maximum of 10 images.');
      return;
    }
    
    setIsCompressing(true);
    const incoming = Array.from(files).slice(0, 10 - photos.length);
    const compressedResults = [];

    for (const f of incoming) {
      if (f.type.startsWith('image/')) {
        try {
          const comp = await compressImage(f);
          compressedResults.push(comp);
        } catch (err) {
          compressedResults.push({
            previewUrl: URL.createObjectURL(f),
            size: f.size,
            file: f
          });
        }
      }
    }

    setPhotos((prev) => [...prev, ...compressedResults]);
    setIsCompressing(false);
  };

  const handleVideoFiles = (files: FileList) => {
    if (videos.length >= 10) {
      alert(lang === 'ur' ? 'آپ زیادہ سے زیادہ 10 ویڈیوز منتخب کر سکتے ہیں۔' : 'You can upload a maximum of 10 videos.');
      return;
    }

    const incoming = Array.from(files).slice(0, 10 - videos.length);
    const results = incoming.map((v) => ({
      file: v,
      previewUrl: URL.createObjectURL(v),
      size: v.size
    }));

    setVideos((prev) => [...prev, ...results]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeVideo = (idx: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step Validation Helpers
  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!vehicleType || !make || (!model && !customModel) || !year) {
        setErrorMessage(t.pleaseFillRequired);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!price || !mileage || !engineCC || !color || !registrationCity) {
        setErrorMessage(t.pleaseFillRequired);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (photos.length === 0) {
        setErrorMessage(lang === 'ur' ? 'براہ کرم کم از کم ایک تصویر اپ لوڈ کریں۔' : 'Please upload at least one image.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!sellerName || !sellerPhone || !location) {
        setErrorMessage(t.pleaseFillRequired);
        return;
      }
      setStep(5);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  // Submit listing directly to Firebase (Admin approval queue)
  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const resolvedModelName = model === 'Other' ? customModel : model;
    const listingId = `listing-${Date.now()}`;

    // Map parameters to match enterprise CarListing schema perfectly
    const payload: CarListing = {
      id: listingId,
      title: `${year} ${make} ${resolvedModelName} ${variant}`.trim(),
      make,
      model: resolvedModelName,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuelType,
      transmission,
      imageUrl: photos[0]?.previewUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      verified: false,
      featured: false,
      dealerId: currentUser?.uid && currentUser?.role === 'Dealer' ? currentUser.uid : 'private-seller',
      description: `A beautifully maintained ${condition.toLowerCase()} ${make} ${resolvedModelName} ${variant} located in ${location}. Contact seller ${sellerName} via ${sellerPhone} or WhatsApp.`,
      createdAt: new Date().toISOString(),
      tags: [vehicleType, condition, fuelType, transmission],
      specs: {
        color,
        engineSize: `${engineCC} cc`,
        horspower: `${Math.round(Number(engineCC) * 0.08 || 100)} HP`,
        regionalSpecs: 'Local Assembly'
      },
      approved: false, // Goes straight to approval queue
      condition,
      engineCC: Number(engineCC),
      exteriorColor: color,
      bodyCondition: bodyCondition,
      registrationCity,
      documentType: 'Smart Card',
      tokenTaxPaid: true,
      images: photos.map(p => p.previewUrl),
      assemblyType: 'Local',
      tokenTaxStatus: 'Paid'
    };

    try {
      await dbSaveListing(payload);
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        if (onPostCreated) {
          onPostCreated(payload);
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrorMessage(lang === 'ur' ? 'اشتہار محفوظ کرتے وقت خرابی پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔' : 'Error saving advertisement. Please check connection.');
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: string) => {
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/95 border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-8 relative shadow-2xl overflow-hidden text-left" id="modern-60s-posting-wizard">
      
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#38BDF8]/10 blur-3xl rounded-full pointer-events-none" />

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle size={44} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              {lang === 'ur' ? 'اشتہار کامیابی سے جمع ہو گیا!' : 'Advertisement Submitted!'}
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              {t.adSubmittedSuccess}
            </p>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-orange-400 font-mono font-black uppercase">
            <Clock size={14} /> {lang === 'ur' ? 'ایڈمن کی منظوری کے لیے زیر التوا' : 'Pending Administrative Review'}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Header Progress Matrix */}
          <div className="mb-6 border-b border-white/5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#38BDF8]/10 text-[#38BDF8] px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest border border-[#38BDF8]/20">
                <Sparkles size={11} className="animate-pulse" /> {t.lessThan60Seconds}
              </div>
              <span className="text-zinc-500 font-mono text-xs font-black">
                {step} / 5
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-3 text-white">
              {t.wizardTitle}
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              {t.wizardSubtitle}
            </p>

            {/* Step Stepper Indicator Bar */}
            <div className="flex items-center justify-between mt-6 gap-1 relative z-10">
              {[1, 2, 3, 4, 5].map((sNum) => (
                <div key={sNum} className="flex-1 flex flex-col items-center">
                  <div 
                    onClick={() => {
                      if (sNum < step) setStep(sNum as any);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black transition-all duration-300 cursor-pointer ${
                      step === sNum
                        ? 'bg-[#38BDF8] text-slate-950 scale-110 shadow-lg shadow-[#38BDF8]/20'
                        : step > sNum
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-900 border border-white/5 text-zinc-600'
                    }`}
                  >
                    {step > sNum ? <Check size={12} strokeWidth={4} /> : sNum}
                  </div>
                  <span className={`text-[8px] font-mono font-bold mt-1.5 uppercase hidden sm:block ${
                    step === sNum ? 'text-[#38BDF8]' : 'text-zinc-600'
                  }`}>
                    {sNum === 1 ? t.step1 : sNum === 2 ? t.step2 : sNum === 3 ? t.step3 : sNum === 4 ? t.step4 : t.step5}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Wizard Core */}
          <div className="min-h-[280px] py-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Vehicle Type Selection Grid */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.vehicleType} *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {VEHICLE_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setVehicleType(type.id)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            vehicleType === type.id
                              ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8] scale-[1.02]'
                              : 'bg-slate-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <Car size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t[type.labelKey as keyof typeof t] || type.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Make and Model Layout Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.make} *</label>
                      <select
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-bold"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                      >
                        {Object.keys(MAKES_DICTIONARY).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.model} *</label>
                      <select
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-bold"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        {modelOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        <option value="Other">{lang === 'ur' ? 'دیگر ماڈل' : 'Other / Custom Model'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Model and Variant inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {model === 'Other' && (
                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400 font-mono font-black uppercase block">Enter Custom Model *</label>
                        <input
                          type="text"
                          placeholder="e.g. Prius Alpha"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.variant}</label>
                      <input
                        type="text"
                        placeholder={t.variantPlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                        value={variant}
                        onChange={(e) => setVariant(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.year} *</label>
                      <select
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono font-bold"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.price} *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t.pricePlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono font-black pr-12"
                        value={price}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9]/g, '');
                          setPrice(sanitized);
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#38BDF8] font-mono font-black uppercase tracking-wider">PKR</span>
                    </div>
                    {price && <span className="text-[10px] text-zinc-500 font-mono">Rs. {formatPrice(price)}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.mileage} *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t.mileagePlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono font-black pr-12"
                        value={mileage}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9]/g, '');
                          setMileage(sanitized);
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-mono uppercase">KM</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.engineCapacity} *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t.enginePlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono font-black pr-12"
                        value={engineCC}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9]/g, '');
                          setEngineCC(sanitized);
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-mono uppercase">CC</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.color} *</label>
                    <input
                      type="text"
                      placeholder={t.colorPlaceholder}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.regCity} *</label>
                    <input
                      type="text"
                      placeholder={t.regCityPlaceholder}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                      value={registrationCity}
                      onChange={(e) => setRegistrationCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.condition} *</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setCondition('Used')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          condition === 'Used' ? 'bg-[#38BDF8] text-slate-950 font-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t.used}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCondition('New')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          condition === 'New' ? 'bg-[#38BDF8] text-slate-950 font-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t.new}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.transmission} *</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setTransmission('Automatic')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          transmission === 'Automatic' ? 'bg-orange-500 text-slate-950 font-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t.automatic}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransmission('Manual')}
                        className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          transmission === 'Manual' ? 'bg-orange-500 text-slate-950 font-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t.manual}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.fuelType} *</label>
                    <select
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-bold"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                    >
                      <option value="Petrol">{t.petrol}</option>
                      <option value="Diesel">{t.diesel}</option>
                      <option value="Hybrid">{t.hybrid}</option>
                      <option value="Electric">{t.electric}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.bodyCondition} *</label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5 text-[11px]">
                      {(['Total Genuine', 'Minor Touch-ups', 'Major Repaint'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBodyCondition(opt)}
                          className={`py-2 rounded-lg font-bold transition-all uppercase cursor-pointer text-center ${
                            bodyCondition === opt ? 'bg-[#38BDF8]/20 border border-[#38BDF8] text-[#38BDF8]' : 'text-zinc-400 border border-transparent'
                          }`}
                        >
                          {opt === 'Total Genuine' ? t.totalGenuine : opt === 'Minor Touch-ups' ? t.minorTouchUps : t.majorRepaint}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5 text-left"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                      <ImageIcon size={16} className="text-[#38BDF8]" /> {t.mediaTitle}
                    </h3>
                    <p className="text-zinc-400 text-xs">{t.mediaSubtitle}</p>
                  </div>

                  {/* Drag & Drop Visual Box */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) await handlePhotoFiles(e.dataTransfer.files);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                      isDragging ? 'border-[#38BDF8] bg-[#38BDF8]/5' : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                    }`}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload size={32} className={`text-zinc-500 transition-colors ${isDragging ? 'text-[#38BDF8]' : ''}`} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">{t.dragDropText}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.orBrowse}</p>
                    </div>
                  </div>

                  {/* Custom upload buttons bar for quick touch interactions */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Camera Capture Option */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3 bg-slate-900/60 border border-white/5 rounded-xl hover:border-[#38BDF8] transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
                    >
                      <Camera size={16} className="text-orange-400" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{t.cameraUpload}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="p-3 bg-slate-900/60 border border-white/5 rounded-xl hover:border-[#38BDF8] transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
                    >
                      <ImageIcon size={16} className="text-[#38BDF8]" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{lang === 'ur' ? 'تصاویر' : 'Gallery Images'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="p-3 bg-slate-900/60 border border-white/5 rounded-xl hover:border-[#38BDF8] transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
                    >
                      <VideoIcon size={16} className="text-emerald-400" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest">{lang === 'ur' ? 'ویڈیو' : 'Upload Videos'}</span>
                    </button>
                  </div>

                  {/* Hidden inputs */}
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={imageInputRef} 
                    className="hidden" 
                    onChange={async (e) => {
                      if (e.target.files) await handlePhotoFiles(e.target.files);
                    }}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={cameraInputRef} 
                    className="hidden" 
                    onChange={async (e) => {
                      if (e.target.files) await handlePhotoFiles(e.target.files);
                    }}
                  />
                  <input 
                    type="file" 
                    multiple 
                    accept="video/*" 
                    ref={videoInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files) handleVideoFiles(e.target.files);
                    }}
                  />

                  {/* Loading overlay for image compression */}
                  {isCompressing && (
                    <div className="flex items-center gap-2.5 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-4 py-3 rounded-xl text-xs font-mono">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#38BDF8]" />
                      <span>{t.compressionProgress}</span>
                    </div>
                  )}

                  {/* Previews Matrix */}
                  <div className="space-y-4">
                    {photos.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-widest block">Images ({photos.length} / 10):</span>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {photos.map((p, idx) => (
                            <div key={idx} className="aspect-square bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden group">
                              <img src={p.previewUrl} alt="preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  type="button" 
                                  onClick={() => removePhoto(idx)}
                                  className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/40 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 right-1 text-[7px] bg-black/70 text-zinc-400 px-1 rounded font-mono">
                                {Math.round(p.size / 1024)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {videos.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-widest block">Videos ({videos.length} / 10):</span>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {videos.map((v, idx) => (
                            <div key={idx} className="aspect-square bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden group flex items-center justify-center">
                              <VideoIcon size={18} className="text-emerald-400" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  type="button" 
                                  onClick={() => removeVideo(idx)}
                                  className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/40 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 right-1 text-[7px] bg-black/70 text-zinc-400 px-1 rounded font-mono">
                                {Math.round(v.size / (1024 * 1024))} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.sellerName} *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><User size={15} /></span>
                      <input
                        type="text"
                        placeholder={t.sellerNamePlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 pl-11 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.sellerPhone} *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><Phone size={15} /></span>
                        <input
                          type="text"
                          placeholder={t.sellerPhonePlaceholder}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 pl-11 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono"
                          value={sellerPhone}
                          onChange={(e) => setSellerPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.whatsappNumber} *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><Phone size={15} className="text-emerald-500" /></span>
                        <input
                          type="text"
                          placeholder={t.whatsappPlaceholder}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 pl-11 text-sm text-white focus:outline-none focus:border-[#38BDF8] font-mono"
                          value={sellerWhatsApp}
                          onChange={(e) => setSellerWhatsApp(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono font-black uppercase block">{t.location} *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><MapPin size={15} /></span>
                      <input
                        type="text"
                        placeholder={t.locationPlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 pl-11 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5 text-left"
                >
                  <div className="border border-white/5 rounded-2xl p-4 bg-slate-900/50 space-y-4">
                    <h3 className="text-sm font-mono font-black uppercase text-[#38BDF8] border-b border-white/5 pb-2">
                      {lang === 'ur' ? 'اشتہار کا خلاصہ' : 'Summary Details'}
                    </h3>

                    {/* Pre-purchase card display */}
                    <div className="flex gap-4 items-center">
                      <img 
                        src={photos[0]?.previewUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80'} 
                        alt="listing cover" 
                        className="w-20 h-20 rounded-xl object-cover border border-white/5 shrink-0"
                      />
                      <div>
                        <h4 className="text-base font-black text-white">{year} {make} {model === 'Other' ? customModel : model} {variant}</h4>
                        <p className="text-xs text-[#38BDF8] font-mono font-black mt-0.5">Rs. {formatPrice(price)} PKR</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{mileage.toLocaleString()} KM • {fuelType} • {transmission} • {registrationCity}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3 divide-y divide-white/5 sm:divide-y-0">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t.condition}</span>
                        <span className="font-bold text-white uppercase">{condition}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t.bodyCondition}</span>
                        <span className="font-bold text-white uppercase">{bodyCondition}</span>
                      </div>
                      <div className="pt-2 sm:pt-0">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t.sellerName}</span>
                        <span className="font-bold text-white">{sellerName}</span>
                      </div>
                      <div className="pt-2 sm:pt-0">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">{t.sellerPhone}</span>
                        <span className="font-bold text-white font-mono">{sellerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Queue notice box */}
                  <div className="flex gap-3 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-xs text-orange-400 font-sans leading-relaxed">
                    <Info size={18} className="shrink-0 text-orange-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold uppercase tracking-wider font-mono">{lang === 'ur' ? 'ایڈمن اپرول نوٹس' : 'Admin Approval Queue Notice'}</p>
                      <p className="text-zinc-400 text-[11px]">{t.approvalNotice}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation Feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-4">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Stepper Buttons Panel */}
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{ minHeight: '48px' }}
                className="px-6 rounded-xl border border-white/10 text-xs font-mono font-black uppercase text-zinc-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <ChevronLeft size={14} strokeWidth={3} /> {t.back}
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{ minHeight: '48px' }}
                className="w-full bg-[#38BDF8] text-slate-950 text-xs font-mono font-black uppercase rounded-xl hover:bg-[#38BDF8]/90 transition-all flex items-center justify-center gap-2 ml-auto cursor-pointer"
              >
                {lang === 'ur' ? 'اگلا مرحلہ' : 'Next Step'} <ChevronRight size={14} strokeWidth={3} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                style={{ minHeight: '48px' }}
                className="w-full bg-orange-500 text-slate-950 text-xs font-mono font-black uppercase rounded-xl hover:bg-orange-500/90 transition-all flex items-center justify-center gap-2 ml-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.loading : t.publishAd}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
