import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Phone, 
  User, 
  Compass, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe, 
  Check, 
  Sparkles, 
  Palette, 
  FileText,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { dbRegisterDealership } from '../lib/dbService';
import { Dealer } from '../types';

interface DealerSignupProps {
  onSuccess?: (dealer: Dealer) => void;
}

export default function DealerSignup({ onSuccess }: DealerSignupProps) {
  // Wizard steps
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Business Profile Details
  const [businessName, setBusinessName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Brand Style Assets
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80');

  // Step 2: Showroom Branding & Theme settings
  const [primaryColor, setPrimaryColor] = useState('#00d2ff');
  const [fontFamily, setFontFamily] = useState('sans');
  const [bgStyle, setBgStyle] = useState<'dark' | 'light' | 'emerald' | 'gold'>('dark');

  // Step 3: Social Desk channels
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');

  // Status indicators
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<Dealer | null>(null);

  const colors = [
    { name: 'Sky Blue', hex: '#00d2ff' },
    { name: 'Champagne Gold', hex: '#d4af37' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Crimson', hex: '#ef4444' },
    { name: 'Electric Violet', hex: '#8b5cf6' },
    { name: 'Sunset Amber', hex: '#f59e0b' },
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!businessName.trim() || !ownerName.trim() || !phone.trim() || !location.trim()) {
        setError('Please fill in all required fields marked with *');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const brandCode = businessName.substring(0, 2).toUpperCase();

    const dealerPayload: Dealer = {
      id: slug,
      name: businessName,
      avatarLetter: brandCode,
      avatarUrl,
      subtitle: slogan || 'Verified Premium Motors',
      location,
      rating: 5.0,
      vehiclesCount: 0,
      followersCount: '0',
      coverImage,
      description: description || `${businessName} provides premium quality cars, guaranteed condition ratings, and seamless transfer bio-metrics. Owned by ${ownerName}.`,
      phone,
      whatsapp,
      flagshipVerified: true,
      verified: true,
      activityFeed: [],
      themeSettings: {
        primaryColor,
        secondaryColor: '#ffffff',
        fontFamily,
        bgStyle
      },
      socials: {
        facebook: facebook || undefined,
        instagram: instagram || undefined,
        tiktok: tiktok || undefined,
        youtube: youtube || undefined,
        website: website || undefined,
      }
    };

    try {
      await dbRegisterDealership(dealerPayload);
      setSuccess(dealerPayload);
      if (onSuccess) onSuccess(dealerPayload);
    } catch (err) {
      console.error('Showroom signup error:', err);
      setError('Failed to register dealership. Please check fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 shadow-2xl text-text-main text-left">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-accent-main/10 text-accent-main border border-accent-main/20 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Check size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-text-main">
                Showroom Registered!
              </h2>
              <p className="text-xs text-text-muted uppercase tracking-widest font-mono mt-1">
                Your brand storefront is officially live on BAZAR360
              </p>
            </div>

            <div className="bg-bg-primary border border-border-main p-5 rounded-2xl text-left space-y-3">
              <div className="flex gap-4 items-center">
                <img src={success.avatarUrl} alt={success.name} className="w-12 h-12 rounded-xl object-cover border border-border-main" />
                <div>
                  <h4 className="text-sm font-black text-text-main uppercase">{success.name}</h4>
                  <p className="text-[10px] text-accent-main font-mono uppercase tracking-wider">{success.subtitle}</p>
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed font-mono">
                📍 Storefront Location: {success.location} <br />
                📞 Phone Secure Line: {success.phone} <br />
                🔗 Storefront slug URL: /showroom/{success.id}
              </p>
            </div>

            <a 
              href={`/showroom/${success.id}`}
              className="inline-block w-full bg-accent-main hover:bg-accent-main/90 text-stone-950 font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg text-center cursor-pointer"
            >
              Enter Dynamic Showroom →
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Steps */}
            <div className="flex items-center justify-between border-b border-border-main pb-4 mb-2 shrink-0">
              <div>
                <span className="text-[9px] font-mono font-black uppercase text-accent-main tracking-widest flex items-center gap-1.5">
                  <Sparkles size={11} className="animate-pulse" /> Step {step} of 3
                </span>
                <h2 className="text-lg font-black uppercase text-text-main tracking-tight mt-0.5">
                  {step === 1 ? 'Showroom Details' : step === 2 ? 'Showroom Theme Style' : 'Connect Social Desks'}
                </h2>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step === s ? 'w-6 bg-accent-main' : 'bg-border-main'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-[11px] text-red-400 font-sans font-medium bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                ⚠️ {error}
              </p>
            )}

            {/* STEP 1: Details */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Business Showroom Name *</label>
                    <div className="relative">
                      <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Peshawar Premium Motors"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Slogan / Tagline</label>
                    <div className="relative">
                      <Compass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                        placeholder="Verified luxury on wheels"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Owner Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Muhammad Amjid"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Showroom Physical Location *</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Main University Road, Peshawar"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Primary Contact Phone *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03149198403"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">WhatsApp Connect Number</label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="03149198403"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Business Bio / Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your dealership expertise, luxury inventory focus..."
                    className="w-full bg-bg-primary text-xs text-text-main p-3.5 rounded-xl border border-border-main focus:outline-none focus:border-accent-main leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Theme settings */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Logo & Cover images preset selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Logo Image URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-bg-primary text-xs text-text-main px-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Cover Banner Image URL</label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full bg-bg-primary text-xs text-text-main px-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-mono"
                    />
                  </div>
                </div>

                {/* Showroom styling config */}
                <div className="bg-bg-primary border border-border-main p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-text-main tracking-tight">
                    <Palette size={15} className="text-accent-main" /> Showroom Custom Theme Configuration
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono block">Primary Brand Accent Color</label>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setPrimaryColor(c.hex)}
                          className={`px-3 py-2 rounded-xl border text-[9.5px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                            primaryColor === c.hex 
                              ? 'bg-accent-main/10 border-accent-main text-accent-main' 
                              : 'bg-bg-secondary border-border-main hover:border-text-muted/50 text-text-muted'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono block">Layout Mood style</label>
                      <select
                        value={bgStyle}
                        onChange={(e) => setBgStyle(e.target.value as any)}
                        className="w-full bg-bg-secondary text-xs text-text-main p-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      >
                        <option value="dark">Obsidian Dark (Standard Premium)</option>
                        <option value="light">Swiss Minimalist Light</option>
                        <option value="emerald">Khyber Emerald Velvet</option>
                        <option value="gold">Bespoke Gold Prestige</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono block">Typography Font pairing</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full bg-bg-secondary text-xs text-text-main p-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                      >
                        <option value="sans">Inter Sans (Clean Modern)</option>
                        <option value="mono">JetBrains Mono (Technical Spec-Driven)</option>
                        <option value="serif">Playfair Display (Vintage Prestige)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Social channels */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Facebook Page Link</label>
                    <div className="relative">
                      <Facebook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="url"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/my-motors"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Instagram Page Link</label>
                    <div className="relative">
                      <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                      <input
                        type="url"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/my-motors"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">YouTube Channel Link</label>
                    <div className="relative">
                      <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                      <input
                        type="url"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        placeholder="https://youtube.com/my-motors"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest font-mono">Official Website Link</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-main" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://my-motors.com"
                        className="w-full bg-bg-primary text-xs text-text-main pl-10 pr-4 py-3 rounded-xl border border-border-main focus:outline-none focus:border-accent-main"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons footer */}
            <div className="flex items-center justify-between border-t border-border-main pt-5 mt-4 shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-3 rounded-xl bg-bg-primary border border-border-main text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-accent-main hover:bg-accent-main/90 text-stone-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Continue Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-accent-main hover:bg-accent-main/90 disabled:opacity-50 text-stone-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
                  style={{ boxShadow: '0 10px 25px -5px rgba(0, 210, 255, 0.2)' }}
                >
                  {submitting ? 'Creating Showroom...' : 'Finish Storefront Setup'}
                </button>
              )}
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
