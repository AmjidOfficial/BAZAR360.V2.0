import React, { useState } from 'react';
import { Sparkles, HelpCircle, Save, Sliders, ArrowRight, Clipboard, ChevronRight, Car, DollarSign } from 'lucide-react';
import { CarListing, GeneratedSEOListing } from '../types';

interface SellWithAIViewProps {
  onAddListing: (listing: CarListing) => void;
  setTab: (tab: string) => void;
}

const CAR_STOCK_IMAGE_CHOICES = [
  {
    name: 'Porsche 911 chalk grey',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHs7Za22_aYMs1VGHEYckNGnFgDZzkirSxzLiCJBbCB2xad7rRbbQo7M1xi7RyGNq8fvUUeGKfFFf93rh8AmKvNpWDRSLWCByW_bP0wK9XhH89wGXq5pXT2Px4I9jvkv5MBaJz82g9lonJQn3tomdmnq1xkOb7_VYzNv57n_oDsol7EzCfdb7PAysiZ_xKKaKLUSX2asp4D15fPMkZ87Rak4ev3Dn7scIHsYk-rDEk0lhfaS18RDIBh_FH8gp3SYVfy_24Oiv87Uw',
  },
  {
    name: 'Porsche 911 GT3 RS grey',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZtBmgc7whl0zLeKAWRQtQFFaqpX0BeFFFhv-7s4eS0XJv8a1i88YYMhBhIwgqiGj0A7rd6ANHhOigA9qyoVbvYOAnweQXtNq7ErLbCyQjxwaBqRacvP9ywt_OdSJTgjIghQ1HJJryxlmkvysweO35ZG8mIQ-GXkXc9eRcG8W6mfooetlurMVEfJwBT5kA3gsemMgkdQQ1x8uV6kvo-7Fd2TWs0eo0DbfHCrGCCkwIOepT-cmfMIReSrrjlnJsv7mXR0lNxmLRanQ',
  },
  {
    name: 'BMW M4 Competition white',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRyZgqdwVho1YG4awPp4toJiKUSqH05IGmlCDeY-esoL_rsDYbAkp7FPKlnXbFzCmNSSrCuHqwrXO_non2l8_jM8QfzbMxg4aYyOMfOsMhs3rpT2R8j1Gx1Mf3knoB5B5hIqUiVq3mIkhn8Bc_376AboW7iBngDAdVbQRCj0uupxH2V2RrluMiTA106UgPdQQb-5gB_A5arpTkTHIfrGwAj737v9D8LD8iIwl-xWDtVKgoKbuQ9XpeQ3NVP4I-N1tqLxV1YsPjWs',
  },
  {
    name: 'Mercedes G63 AMG black',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI',
  }
];

export default function SellWithAIView({ onAddListing, setTab }: SellWithAIViewProps) {
  // AI Stage states
  const [shorthandInput, setShorthandInput] = useState('civic 22 white neat condition 18k km price 85 lac');
  const [sellingTone, setSellingTone] = useState<'Premium' | 'Aggressive' | 'Friendly' | 'SEO'>('Premium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Custom manual tweaks before committing
  const [generatedData, setGeneratedData] = useState<GeneratedSEOListing | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualPrice, setManualPrice] = useState(85000);
  const [manualMileage, setManualMileage] = useState(18000);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(2); // BMW white by default
  const [manFuelType, setManFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [manTransmission, setManTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [manualMake, setManualMake] = useState('Honda');
  const [manualModel, setManualModel] = useState('Civic');
  const [manualYear, setManualYear] = useState(2022);

  const startAiMarketingEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shorthandInput.trim()) return;

    setAiLoading(true);
    setAiError('');
    setGeneratedData(null);

    try {
      const response = await fetch('/api/ai/marketing-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: shorthandInput,
          tone: sellingTone,
        }),
      });

      if (!response.ok) {
        throw new Error('Our AI systems are currently initializing. Performing structural bypass...');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Server rejected request');
      }

      const parsed: GeneratedSEOListing = data.result;
      setGeneratedData(parsed);
      setManualTitle(parsed.title);
      setManualDescription(parsed.description);
      setManualPrice(parsed.suggestedPricePKR || 1500000);

      // Guessing car specifications based on input
      const textL = shorthandInput.toLowerCase();
      if (textL.includes('civic')) {
        setManualMake('Honda');
        setManualModel('Civic');
      } else if (textL.includes('corolla')) {
        setManualMake('Toyota');
        setManualModel('Corolla');
      } else if (textL.includes('porsche')) {
        setManualMake('Porsche');
        setManualModel('911 Carrera');
      } else if (textL.includes('mercedes') || textL.includes('g63')) {
        setManualMake('Mercedes-Benz');
        setManualModel('G63 AMG');
      } else if (textL.includes('bmw') || textL.includes('m4')) {
        setManualMake('BMW');
        setManualModel('M4 Competition');
      }

      const yearsMatch = shorthandInput.match(/\b(20\d{2}|\d{2})\b/);
      if (yearsMatch) {
        const yr = parseInt(yearsMatch[1]);
        setManualYear(yr < 100 ? 2000 + yr : yr);
      }

      const kmMatch = shorthandInput.match(/\b(\d+)\s*(k|lac|miles|km|thousand)\b/i);
      if (kmMatch) {
         const numeric = parseInt(kmMatch[1]);
         setManualMileage(kmMatch[2].toLowerCase() === 'lac' ? numeric * 100000 : numeric * 1000);
      }

    } catch (err: any) {
      // High-quality fallback if API keys are not supplied yet
      setAiError(err.message || 'Error executing AI generation pipelines.');
      
      // Fallback object to guarantee usability
      const fallbackObj: GeneratedSEOListing = {
        title: "Pristine 2022 Honda Civic White - Certified Premium State",
        description: `This immaculate Honda Civic represents high efficiency, modern styling, and pure performance reliability. Fitted with high-end safety ratings and completely pre-inspected. Sells rapidly directly from premium dealer portfolios.`,
        tags: ["Sedan", "Fuel Efficient", "Certified", "Immaculate"],
        suggestedPricePKR: 4500000,
        highlights: ["Shorthand notes optimized", "SEO structural tags embedded", "Pakistan compatible specs"]
      };
      setGeneratedData(fallbackObj);
      setManualTitle(fallbackObj.title);
      setManualDescription(fallbackObj.description);
      setManualPrice(fallbackObj.suggestedPricePKR);
    } finally {
      setAiLoading(false);
    }
  };

  const publishCarToWorkspace = () => {
    const finalAd: CarListing = {
      id: `ai-gen-${Date.now()}`,
      title: manualTitle,
      make: manualMake,
      model: manualModel,
      year: manualYear,
      price: manualPrice,
      mileage: manualMileage,
      fuelType: manFuelType,
      transmission: manTransmission,
      imageUrl: CAR_STOCK_IMAGE_CHOICES[selectedPhotoIndex].url,
      verified: true,
      featured: true,
      dealerId: 'almas-car-valley', // Defaulting to our Almas dealership for consistency
      description: manualDescription,
      createdAt: new Date().toISOString(),
      tags: generatedData?.tags || ['Luxury'],
      specs: {
        color: 'Slick Finish',
        engineSize: '2.0L Turbo',
        horspower: '190 hp',
        regionalSpecs: 'Pak/Japanese Specs'
      }
    };

    onAddListing(finalAd);
    // Redirect to market catalog to see the new car list post
    setTab('search');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Intro visual banner - Bento Accent Card */}
      <section className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 pointer-events-none select-none opacity-20">
          <Sparkles className="text-[#38BDF8]" size={120} />
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-wider block bg-orange-950/40 w-fit px-2.5 py-1 rounded border border-white/5">
            AI Marketing Pipeline
          </span>
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white uppercase tracking-tight">
            RAW SHORTHAND SELLS, TURNED INTO PREMIUM ADS.
          </h2>
          <p className="text-xs text-white/50 font-sans leading-relaxed">
            Enter raw vehicle notes, condition descriptions, or pricing specifications. Bazar360 will digest structural inputs through server-side AI frameworks and construct an SEO-optimized listing instantly.
          </p>
        </div>
      </section>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left pane form input */}
        <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl select-none">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider block border-b border-white/5 pb-3.5">Seller Shorthand Notes</h3>
          <form onSubmit={startAiMarketingEngine} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-gray-400 block font-semibold">Raw Car Shorthand Inputs:</label>
              <textarea
                rows={4}
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-3.5 text-white focus:outline-none focus:border-[#38BDF8] leading-relaxed resize-none font-mono text-xs"
                placeholder="e.g. civic 22 white neat condition 18k km price 85 lac..."
                value={shorthandInput}
                onChange={(e) => setShorthandInput(e.target.value)}
              ></textarea>
              <span className="text-[10px] text-white/30 block mt-1">Mention brand, year, color, running, extra attributes.</span>
            </div>

            <div className="space-y-2">
              <label className="text-white/60 block font-semibold">Listing Style/Tone Tuning:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Premium', label: 'Premium Luxury' },
                  { id: 'Aggressive', label: 'Direct Force' },
                  { id: 'Friendly', label: 'Helpful & Safe' },
                  { id: 'SEO', label: 'Optimized SEO' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSellingTone(tone.id as any)}
                    className={`py-2 px-3 rounded-xl font-bold border text-left font-mono text-[10px] transition-all cursor-pointer ${
                      sellingTone === tone.id
                        ? 'bg-[#0F172A] text-[#38BDF8] border-[#38BDF8]'
                        : 'bg-[#0F172A] text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 border border-white/5 transition-colors rounded-xl font-bold text-white shadow-lg shadow-orange-950/20 active:scale-97 flex items-center justify-center gap-2 duration-100 uppercase tracking-widest text-[10px]"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>AI Writing Pipeline Running...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Translate via AI Engine</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right pane placeholder/loader/preview */}
        <div className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl flex flex-col justify-between shadow-xl relative min-h-[300px]">
          {aiLoading && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center space-y-3 z-10">
              <div className="relative">
                <Sparkles className="text-[#38BDF8] animate-spin" size={32} />
                <div className="absolute inset-0 border-2 border-dashed border-[#38BDF8] rounded-full animate-ping"></div>
              </div>
              <p className="text-xs text-[#38BDF8] font-bold font-mono tracking-widest uppercase">Executing Gemini Synthesizer</p>
              <p className="text-[9px] text-white/50 font-sans">Formatting copy arrays & suggested market index valuation...</p>
            </div>
          )}

          {!generatedData && !aiLoading && (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-[#38BDF8] flex items-center justify-center shadow-lg border border-white/5">
                <Sliders size={26} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-white font-bold uppercase tracking-tight text-xs">Listing Generator Ready</h4>
                <p className="text-xs text-white/50 font-sans max-w-xs leading-relaxed">
                  Enter raw specifications on the left pane and hit the AI translate accelerator.
                </p>
              </div>
            </div>
          )}

          {generatedData && (
            <div className="space-y-4 flex-grow flex flex-col justify-between font-sans text-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-[#0F172A] p-3 rounded-xl border border-white/5 font-mono">
                  <span className="text-[10px] uppercase font-bold text-[#38BDF8]">Title optimization:</span>
                  <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40 font-bold select-none uppercase tracking-wide">AI Completed</span>
                </div>
                
                <div className="bg-[#0F172A] p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="flex gap-3">
                    <Clipboard size={14} className="text-[#38BDF8] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-xs tracking-tight uppercase">{manualTitle}</h4>
                      <p className="text-white/60 text-[11px] leading-relaxed mt-2">{manualDescription}</p>
                    </div>
                  </div>
                </div>

                {generatedData.highlights && generatedData.highlights.length > 0 && (
                  <div className="space-y-1.5 pl-3.5 border-l-2 border-[#F97316] font-mono">
                    <span className="text-[9px] uppercase font-bold text-[#F97316] block tracking-wide">Engine highlights:</span>
                    <ul className="text-[10px] text-white/70 space-y-1">
                      {generatedData.highlights.map((h, i) => (
                        <li key={i} className="flex gap-1.5 items-center">
                          <ChevronRight size={10} className="text-[#F97316]" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {aiError && (
                <p className="text-[10px] bg-red-950/30 text-red-400 p-2.5 rounded-xl border border-red-900/30 font-mono">
                  ⚠️ Note: {aiError} (Loaded sandbox template preset)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Fine-tuning Panel (Only visible once generated) */}
      {generatedData && (
        <section className="bg-[#1E293B] border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl font-sans text-xs">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-[#F97316]" /> Review Technical Specifications & Choose Branding
            </h3>
            <p className="text-[10px] text-white/50 mt-1">Fine-tune listing metrics manually before publishing to Bazar360 feeds.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Listing Header:</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Selling Valuation (PKR):</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Mileage (km):</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="number"
                value={manualMileage}
                onChange={(e) => setManualMileage(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Transmission:</label>
              <select
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                value={manTransmission}
                onChange={(e) => setManTransmission(e.target.value as any)}
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Make Brand:</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="text"
                value={manualMake}
                onChange={(e) => setManualMake(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Model Family:</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="text"
                value={manualModel}
                onChange={(e) => setManualModel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Manufacture Year:</label>
              <input
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                type="number"
                value={manualYear}
                onChange={(e) => setManualYear(parseInt(e.target.value) || 2026)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Fuel Category:</label>
              <select
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#38BDF8] font-mono text-xs"
                value={manFuelType}
                onChange={(e) => setManFuelType(e.target.value as any)}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-white/50 block font-semibold leading-relaxed font-mono text-[10px] uppercase">Link Listing High-Performance Image Branding Cover:</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CAR_STOCK_IMAGE_CHOICES.map((choice, i) => (
                <div
                  key={choice.name}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={`border rounded-2xl overflow-hidden cursor-pointer relative transition-all ${
                    selectedPhotoIndex === i
                      ? 'border-[#38BDF8] ring-4 ring-[#38BDF8]/10 bg-[#0F172A]'
                      : 'border-white/5 hover:border-white/20 bg-[#0F172A]'
                  }`}
                >
                  <img
                    src={choice.url}
                    alt={choice.name}
                    className="h-24 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[9px] text-[#38BDF8] uppercase bg-[#0B1121]/90 py-1.5 block truncate text-center font-mono font-bold tracking-tight">
                    {choice.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-white/5">
            <button
              onClick={publishCarToWorkspace}
              className="bg-[#38BDF8] hover:bg-sky-400 font-mono font-bold text-xs py-3.5 px-8 text-slate-950 rounded-xl flex items-center justify-center gap-2 active:scale-95 duration-75 shadow-lg shadow-sky-950/20 uppercase tracking-wider cursor-pointer"
            >
              <Save size={14} /> Commit AI Listing and Publish
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
