import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Mail, Phone, Star, Building, ArrowLeft } from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { dbFetchDealers, dbFetchListings, seedDatabaseIfEmpty } from '../lib/dbService';
import { ShowroomThemeWrapper } from '../components/ShowroomThemeWrapper';
import { VehicleCard } from '../components/VehicleCard';

export default function ShowroomProfile() {
  const { showroomSlug } = useParams<{ showroomSlug: string }>();
  const navigate = useNavigate();
  
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        await seedDatabaseIfEmpty();
        const allDealers = await dbFetchDealers();
        const allListings = await dbFetchListings();
        
        // Find dealer matching slug with high-tolerance fallbacks
        const target = allDealers.find(d => {
          const generatedSlug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const currentParamSlug = (showroomSlug || '').toLowerCase();
          return (
            generatedSlug === currentParamSlug || 
            d.id?.toLowerCase() === currentParamSlug || 
            (d.id === 'auto-choice-peshawar' && (currentParamSlug === 'auto-choice' || currentParamSlug === 'auto-choice-peshawar'))
          );
        });

        if (target) {
          setDealer(target);
          setListings(allListings.filter(l => (l.dealerId === target.id || l.dealerId === 'auto-choice-peshawar') && l.approved));
        } else {
          setDealer(null);
        }
      } catch (err) {
        console.error("Failed to resolve profile from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [showroomSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 border-[#00d2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-[#070c18] flex items-center justify-center px-4">
        <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building size={32} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Showroom Registered Profile Not Found</h2>
          <p className="text-gray-400 text-sm mb-8">
            The dealership link you followed is invalid or the showroom has been removed from the BAZAR360 network.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const theme = dealer.theme_config || dealer.themeSettings || {
    primaryColor: dealer.id === 'auto-choice-peshawar' ? '#c5a880' : '#00d2ff',
    secondaryColor: '#121214',
    fontFamily: 'Work Sans',
    bgStyle: 'dark'
  };

  const safeTheme = theme || { bgStyle: 'dark', primaryColor: '#00d2ff' };

  const bgStyleClass = 
    safeTheme.bgStyle === 'light' ? 'bg-[#f8fafc] text-slate-900 font-sans' :
    safeTheme.bgStyle === 'emerald' ? 'bg-[#03140f] text-[#e2f0ec] font-mono' :
    safeTheme.bgStyle === 'gold' ? 'bg-[#050505] text-[#f4f4f5] font-sans' :
    'bg-[#0a0a0b] text-white font-sans'; // Default Obsidian Black

  const cardStyleClass = 
    safeTheme.bgStyle === 'light' ? 'bg-white border text-slate-800' :
    safeTheme.bgStyle === 'emerald' ? 'bg-[#08211a] text-emerald-100' :
    safeTheme.bgStyle === 'gold' ? 'bg-[#121215] text-zinc-100 font-mono' :
    'bg-[#121214] text-slate-100'; // Default Graphite Card

  const textMutedClass = 
    safeTheme.bgStyle === 'light' ? 'text-slate-500' :
    safeTheme.bgStyle === 'emerald' ? 'text-emerald-400/80' :
    safeTheme.bgStyle === 'gold' ? 'text-zinc-400 font-mono' :
    'text-gray-400';

  const borderStyleClass = 
    safeTheme.bgStyle === 'light' ? 'border-[#e2e8f0]' :
    safeTheme.bgStyle === 'emerald' ? 'border-[#10b981]/20' :
    safeTheme.bgStyle === 'gold' ? 'border-[#c5a880]/10' :
    'border-white/5';

  const brandAccentHex = safeTheme.primaryColor || '#00d2ff';

  const [callbackSuccess, setCallbackSuccess] = useState('');

  const registerShowroomLead = async (actionType: string, vehicleTitle?: string, listingId?: string) => {
    // Generate secure telemetry lead item concurrently
    const leadId = `lead-${dealer.id}-${Date.now().toString().slice(-4)}`;
    const telemetryObj = {
      id: leadId,
      type: 'Showroom Lead',
      title: `${actionType} action on ${dealer.name}`,
      userName: 'Valued Showroom Visitor',
      userPhone: dealer.phone || '03149198403',
      userEmail: 'leads@bazar360.online',
      city: dealer.location || 'Peshawar',
      details: `${actionType} initiated. Source Showroom: ${dealer.name} | Vehicle Target: ${vehicleTitle || 'All Fleet'}`,
      metadata: {
        sourceShowroomId: dealer.id,
        viewedInventoryId: listingId || '',
        intentCategory: actionType,
        deviceContext: 'Bazar360 Client WebApp'
      },
      createdAt: new Date().toISOString()
    };

    try {
      const { dbSaveLead } = await import('../lib/dbService');
      await dbSaveLead(telemetryObj);
      console.log('Lead routing completed:', telemetryObj);
    } catch (e) {
      console.warn('Silent local bypass:', e);
    }
  };

  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');

  const handleRequestCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    const leadId = `lead-callback-${Date.now().toString().slice(-4)}`;
    const telemetryObj = {
      id: leadId,
      type: 'Request Callback',
      title: `Callback request on ${dealer.name}`,
      userName: callbackName.trim() || 'Anonymous Visitor',
      userPhone: callbackPhone.trim(),
      userEmail: 'leads@bazar360.online',
      city: dealer.location || 'Peshawar',
      details: `Direct callback inquiry target: ${dealer.name}. Client Phone: ${callbackPhone}.`,
      metadata: {
        sourceShowroomId: dealer.id,
        intentCategory: 'Request Callback',
        deviceContext: 'Bazar360 Client WebApp'
      },
      createdAt: new Date().toISOString()
    };

    try {
      const { dbSaveLead } = await import('../lib/dbService');
      await dbSaveLead(telemetryObj);
      setCallbackSuccess(`✓ Request submitted. Dealer will dispatch representative to contact you at ${callbackPhone} shortly.`);
      setCallbackName('');
      setCallbackPhone('');
      setTimeout(() => setCallbackSuccess(''), 5500);
    } catch (e) {
      console.warn('Silent fallback:', e);
    }
  };

  return (
    <ShowroomThemeWrapper themeConfig={theme}>
      {/* Header Banner */}
      <div className={`relative h-64 md:h-80 w-full overflow-hidden border-b ${borderStyleClass}`}>
        {dealer.coverImage ? (
          <img 
            src={dealer.coverImage} 
            alt={dealer.name} 
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-slate-900 to-black" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/50`} />
        
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-black/80 backdrop-blur border border-white/10 hover:bg-white/5 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xl"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                  {dealer.name}
                </h1>
                {dealer.verified && (
                  <div className="flex items-center gap-1 bg-[var(--dynamic-accent)]/10 border border-[var(--dynamic-accent)]/30 text-[var(--dynamic-accent)] px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 h-fit">
                    <ShieldCheck size={12} />
                    Verified Partner
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[var(--dynamic-accent)]" />
                  <span>{dealer.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span>{dealer.rating} / 5.0 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`${cardStyleClass} border ${borderStyleClass} rounded-3xl p-6 shadow-xl`}>
            <h3 className={`text-xs font-black uppercase ${textMutedClass} tracking-widest mb-6`}>Contact Showroom</h3>
            
            <div className="space-y-4">
              <a 
                href={`tel:${dealer.phone}`}
                onClick={() => registerShowroomLead('Click Direct Line')}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ border: `1px solid ${brandAccentHex}33` }}>
                  <Phone size={18} className="text-[var(--dynamic-accent)]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Direct Line</div>
                  <div className="font-mono font-bold text-sm text-white hover:underline">{dealer.phone}</div>
                </div>
              </a>

              {dealer.whatsapp && (
                <a 
                  href={`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => registerShowroomLead('Click WhatsApp Line')}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/20">
                    <Mail size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">WhatsApp Portal</div>
                    <div className="font-mono font-bold text-sm text-white hover:underline">{dealer.whatsapp}</div>
                  </div>
                </a>
              )}
            </div>

            {/* In-place callback request intake */}
            <form onSubmit={handleRequestCallback} className="pt-6 mt-6 border-t border-white/5 space-y-3.5">
              <span className={`text-[10px] font-mono font-black uppercase ${textMutedClass}`}>Instant Callback Sourcing</span>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                className="w-full bg-black/45 text-xs text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--dynamic-accent)]"
              />
              <input 
                type="tel" 
                required
                placeholder="Mobile Number *" 
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                className="w-full bg-black/45 text-xs text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:border-[var(--dynamic-accent)] font-mono"
              />

              <button 
                type="submit"
                className="w-full text-slate-950 font-sans font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer"
                style={{ 
                  backgroundColor: brandAccentHex,
                  boxShadow: `0 10px 25px -5px ${brandAccentHex}33`
                }}
              >
                Request Call Back
              </button>

              {callbackSuccess && (
                <p className="text-[10.5px] text-emerald-400 font-sans font-medium bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                  {callbackSuccess}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="lg:col-span-8">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            Showroom Inventory <span className="bg-slate-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">{listings.length} Available</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
            {listings.map(car => (
              <VehicleCard
                key={car.id}
                car={car}
                dealer={dealer}
                variant="grid"
                onSelect={(selectedCar) => {
                registerShowroomLead('View Inventory Details', selectedCar.title, selectedCar.id);
                // Change '/' to your actual vehicle details route
                navigate(`/vehicles/${selectedCar.id}`); 
                }}
              />
            ))}
          </div>

          {listings.length === 0 && (
            <div className={`bg-black/50 border border-dashed ${borderStyleClass} rounded-3xl p-12 text-center text-gray-500 font-medium`}>
              No verified vehicles are currently listed by this showroom.
            </div>
          )}
        </div>

      </div>
    </ShowroomThemeWrapper>
  );
}
