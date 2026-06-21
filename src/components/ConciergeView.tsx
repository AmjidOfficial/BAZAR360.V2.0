import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Award, 
  ChevronRight, 
  X, 
  Info,
  Layers,
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Dealer } from '../types';

interface ConciergeViewProps {
  dealers: Dealer[];
}

interface ServiceBlock {
  id: string;
  title: string;
  tagline: string;
  metric: string;
  description: string;
  features: string[];
  partners: string[];
}

const SERVICE_MESH_DATA: ServiceBlock[] = [
  {
    id: 'inspection',
    title: 'Precision Car Inspection',
    tagline: '180-Point Chassis, Paint, & Engine Scan',
    metric: '99.2% Audit Reliability',
    description: 'A fully computerized diagnostic scan including paint depth micrometer levels, suspension dynamic test, and diagnostic computer diagnostics.',
    features: [
      'Paint thickness gauge test',
      'Engine compression diagnostics',
      'Accidental structural frame scan',
      'Electronic sensor mapping'
    ],
    partners: ['Exemplar Inspection KPK', 'Auto Choice Diagnostic Desk']
  },
  {
    id: 'insurance',
    title: 'Ecosystem Motor Insurance',
    tagline: 'Instant Comprehensive Theft & Crash Coverage',
    metric: 'As low as 1.7% Rate',
    description: 'Get immediate digital coverage options through corporate auto insurers with custom cash paybacks and rapid claim settlements.',
    features: [
      '100% Cash-value theft coverage',
      'Third-party property indemnity',
      'Emergency towing coordination',
      'No hidden deductible charges'
    ],
    partners: ['Askari General Insurers', 'EFU General KPK Branch']
  },
  {
    id: 'finance',
    title: 'Finance Pre-Approval Engine',
    tagline: 'Instant Commercial Bank Credit Indexing',
    metric: 'Approval inside 48 Hours',
    description: 'Calculate and index credit terms with leading commercial banks instantly. Pre-approve financing for zero-meter or verified used stock.',
    features: [
      'Zero penalty early payments',
      'Exclusive markups for Auto Choice stock',
      'Minimal document payload requirements',
      'Islamic & conventional options'
    ],
    partners: ['Meezan Bank Ltd (KPK Division)', 'Bank Al Habib autoDesk']
  },
  {
    id: 'title',
    title: 'Title & Registered Transfer Desk',
    tagline: 'Excise Biometric and Registry Processing',
    metric: '100% Tax Compliant File',
    description: 'Worry-free luxury title handovers. Our legal division coordinates biometric validation, handles active excise registrations, and secures smartcards.',
    features: [
      'Verification of raw auction files',
      'KPK / Punjab biometrics processing',
      'Token tax unpaid logs resolution',
      'Secure smartcard custody'
    ],
    partners: ['Excise KPK Agent Division', 'Bazar360 Legal Services Group']
  }
];

export default function ConciergeView({ dealers }: ConciergeViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryText, setInquiryText] = useState('I am looking to book an inspection and secure biometric support for Toyota Fortuner.');

  const activeService = SERVICE_MESH_DATA.find(s => s.id === selectedServiceId);
  const flagshipAutoChoice = dealers.find(d => d.id === 'auto-choice-peshawar') || dealers[0];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    setIsMessageSent(true);
    setTimeout(() => {
      setIsMessageSent(false);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryText('I am looking to book an inspection and secure biometric support for Toyota Fortuner.');
    }, 4000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Banner */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#060a12] to-[#121c32] p-6 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500 opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black tracking-widest text-[#38BDF8] uppercase bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/25">
            <Compass size={11} className="animate-spin-slow" /> DIRECT VIP PORTAL
          </span>
          <h2 className="text-xl md:text-3xl font-sans font-black uppercase text-white tracking-tight">
            Ecosystem Concierge Desk
          </h2>
          <p className="text-white/60 text-xs max-w-2xl font-sans leading-relaxed">
            Instantly contact representative agents, access physical showroom route telemetry at Alamas Car Village, Ring Road, Peshawar, or book our premium inspections and transfers.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive 4-Block services (inspired by screenshot rules) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2">
              <span>● Premium Automotive Support Services</span>
              <span className="text-[10px] text-orange-500 lowercase font-normal">(select card to inspect specifications)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_MESH_DATA.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(prev => prev === srv.id ? null : srv.id)}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 shadow-xl relative overflow-hidden group ${
                    selectedServiceId === srv.id
                      ? 'bg-gradient-to-br from-slate-950 to-blue-950 border-orange-500/80 ring-1 ring-orange-400/20'
                      : 'bg-[#0c1221] border-white/5 hover:border-gray-700/80'
                  }`}
                >
                  <div className="space-y-1.5 relative z-10">
                    <span className="inline-block bg-orange-500/10 text-orange-400 font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-orange-500/20">
                      {srv.metric}
                    </span>
                    <h4 className="text-white font-black text-xs uppercase tracking-tight group-hover:text-orange-500 duration-100">
                      {srv.title}
                    </h4>
                    <p className="text-[#a3b3cc] text-[11px] leading-relaxed line-clamp-2">
                      {srv.tagline}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#38BDF8] pt-2">
                      <span>Explore details</span>
                      <ChevronRight size={12} className="group-hover:translate-x-1 duration-150" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive details drawer if a service is clicked */}
          {activeService && (
            <div className="bg-[#111928] border border-orange-500/30 p-5 rounded-2xl relative shadow-2xl animate-fade-in">
              <button 
                onClick={() => setSelectedServiceId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 border border-white/10 p-1 rounded-lg"
              >
                <X size={15} />
              </button>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-black text-[#38BDF8] uppercase tracking-wider">Verification Drawer Active</span>
                  <h4 className="text-white font-black text-sm uppercase">{activeService.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{activeService.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2 bg-[#0c1221] border border-white/5 p-3.5 rounded-xl">
                    <p className="text-orange-400 font-mono text-[9px] uppercase font-bold tracking-wider">Features included:</p>
                    <ul className="space-y-1.5 text-xs text-white/80">
                      {activeService.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-500" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 bg-[#0c1221] border border-white/5 p-3.5 rounded-xl">
                    <p className="text-[#38BDF8] font-mono text-[9px] uppercase font-bold tracking-wider">Certified Local Partners:</p>
                    <ul className="space-y-1.5 text-xs text-white/80">
                      {activeService.partners.map((partner, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck size={12} className="text-[#38BDF8]" />
                          <span>{partner}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map layout coordinate section */}
          <div className="bg-[#0c1221] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                  <MapPin size={14} className="text-[#EF4444]" /> Showroom Physical Telemetry
                </h3>
                <p className="text-[10px] text-gray-400 font-sans">Alamas Car Village Ring Road Peshawar flagship spot mapping precise Google Map coordinates.</p>
              </div>
              <span className="bg-black/40 text-[9px] font-mono font-bold text-gray-500 border border-white/5 px-2.5 py-1 rounded">
                GEO-REF: 33.9674° N, 71.4856° E
              </span>
            </div>

            {/* Real Embedded Google Map Iframe */}
            <div className="w-full h-80 rounded-xl overflow-hidden border border-white/5 relative bg-[#070c18]">
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

            <div className="p-4 bg-[#070c12] rounded-xl border border-white/5 space-y-1">
              <p className="text-white font-mono font-black text-[10px] uppercase">📍 Showroom Address</p>
              <p className="text-gray-300 text-xs font-sans font-medium">Alamas Car Village, Ring Road, Peshawar, Pakistan</p>
              <p className="text-gray-400 text-[10px] font-sans leading-snug">Vetted physical spot under Auto Choice VIP flagship protection. Click/drag Google Maps to inspect landmarks.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Support Linkages */}
        <div className="space-y-6">
          <div className="bg-[#121a2a] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Phone size={14} className="text-orange-500" /> Direct VIP Support Mesh
            </h3>

            <div className="space-y-3 font-mono">
              {/* WhatsApp VIP */}
              <a 
                href={`https://wa.me/${flagshipAutoChoice.whatsapp || '923159085086'}?text=Hello%20Auto%20Choice%20Ecosystem%20Concierge,%20I%20am%20interested%20in%2520booking%20a%20walkaround.`}
                target="_blank"
                rel="noreferrer"
                className="block p-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl cursor-pointer duration-100 group text-left"
              >
                <span className="text-[8px] font-black bg-emerald-500 text-slate-950 py-0.5 px-2 rounded uppercase tracking-wide">Verified WhatsApp Hotline</span>
                <p className="text-white font-extrabold text-sm uppercase mt-1.5 group-hover:text-emerald-400">
                  +92 315 9085086
                </p>
                <p className="text-gray-400 text-[9px] font-sans mt-0.5">Instant WhatsApp support active 24/7 for vehicle dispatch and file coordination.</p>
              </a>

              {/* Cellular Hotline */}
              <a 
                href="tel:+923159085086"
                className="block p-4 bg-slate-950/40 hover:bg-slate-950/70 border border-white/5 hover:border-gray-700 rounded-xl cursor-pointer duration-100 text-left"
              >
                <span className="text-[8px] font-bold text-[#38BDF8] uppercase tracking-wide">Direct Cellular Voice Link</span>
                <p className="text-white font-extrabold text-sm mt-1">
                  +92 315 9085086
                </p>
                <p className="text-gray-500 text-[9px] font-sans mt-0.5 block">Exclusively for direct cellular voice conversations and showroom ringers.</p>
              </a>
            </div>
          </div>

          {/* Quick contact form */}
          <div className="bg-[#121a2a] border border-[#1e293b] rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-black text-xs uppercase tracking-widest font-mono flex items-center gap-2 border-b border-white/5 pb-2.5">
              <MessageSquare size={14} className="text-orange-500" /> Dispatch Agent Inquiry
            </h3>

            <form onSubmit={handleInquirySubmit} className="space-y-3 block">
              <div className="space-y-1 block">
                <label className="text-[9px] text-gray-500 uppercase font-mono font-bold">Your Name</label>
                <input
                  type="text"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="e.g., Amjid Khan"
                  className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2 px-3 focus:outline-none focus:border-orange-500 placeholder-white/10"
                  required
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[9px] text-gray-500 uppercase font-mono font-bold">Phone linkage</label>
                <input
                  type="text"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="e.g., +923001234567"
                  className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2 px-3 focus:outline-none focus:border-orange-500 placeholder-white/10 font-mono"
                  required
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[9px] text-gray-500 uppercase font-mono font-bold">Proposed details</label>
                <textarea
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#080d19] border border-[#1e293b] rounded-xl text-white text-xs py-2 px-3 focus:outline-none focus:border-orange-500 placeholder-white/10 font-sans"
                  required
                />
              </div>

              {isMessageSent && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-xl text-center">
                  ✓ Dispatch Inquiry submitted! Auto Choice representative will contact you shortly.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 duration-100 cursor-pointer"
              >
                Send Dispatch Details
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
