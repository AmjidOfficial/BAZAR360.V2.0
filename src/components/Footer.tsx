import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Compass, 
  ArrowUpRight, 
  Heart, 
  Sparkles, 
  MapPin, 
  Mail,
  HelpCircle,
  Users,
  Lock,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { dbSaveSuggestion, Suggestion } from '../lib/dbService';

interface FooterProps {
  lang?: 'en' | 'ur';
  setTab?: (tab: string) => void;
  onOpenSupportDrawer?: () => void;
}

export default function Footer({ lang = 'en', setTab, onOpenSupportDrawer }: FooterProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      const newSuggestion: Suggestion = {
        id: 'sug_' + Math.random().toString(36).substr(2, 9),
        user_id: null, // Anonymous or can be bound if user state is added
        suggestion_text: suggestionText.trim(),
        submitted_at: new Date().toISOString(),
      };

      await dbSaveSuggestion(newSuggestion);
      setSuggestionText('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting suggestion:', err);
      setSubmitError(lang === 'ur' ? 'تجاویز جمع کرنے میں خرابی پیش آئی۔' : 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUrdu = lang === 'ur';

  // Localized texts
  const t = {
    vision: isUrdu 
      ? 'پاکستان کا سب سے آسان آٹوموٹو مارکیٹ پلیس۔ براہ راست معائنہ، تصدیق شدہ شورومز، اور فیس بک اسٹائل کے براہ راست سودے بغیر کسی کمیشن کے۔'
      : 'Peshawar\'s premium direct automotive network. Post ads in under 60 seconds, experience live inspections, and connect directly with verified showrooms.',
    tagline: isUrdu ? 'آسان۔ براہ راست۔ محفوظ۔' : 'Simple. Direct. Secure.',
    copyright: isUrdu ? '© ۲۰۲۶ بازار۳۶۰۔ جملہ حقوق محفوظ ہیں۔' : '© 2026 Bazar360. All rights reserved.',
    navTitle: isUrdu ? 'نیٹ ورک لنکس' : 'Explore Network',
    supportTitle: isUrdu ? 'سپورٹ ڈیسک' : 'Support Desk',
    suggestionsTitle: isUrdu ? 'تجاویز باکس' : 'Send Suggestions',
    suggestionsSub: isUrdu 
      ? 'ہمیں بازار۳۶۰ کو مزید بہتر بنانے میں مدد کریں۔ آپ کی تجاویز براہ راست ہمارے ایڈمن تک پہنچتی ہیں۔'
      : 'Help us improve Bazar360. Your suggestions are delivered directly to our administration desk.',
    placeholder: isUrdu ? 'اپنی قیمتی تجویز یہاں لکھیں...' : 'Share your suggestion or feedback...',
    btnSend: isUrdu ? 'ارسال کریں' : 'Submit',
    successMsg: isUrdu ? 'تجویز جمع کرانے کا شکریہ! یہ ایڈمن کو ارسال کر دی گئی ہے۔' : 'Thank you! Your feedback has been registered.',
    openTicket: isUrdu ? 'سپورٹ ٹکٹ کھولیں' : 'Open Support Ticket',
    adminMazhar: isUrdu ? 'ملک مظہر (سروسز)' : 'Malak Mazhar (Services)',
    adminAmjid: isUrdu ? 'محمد امجد (ڈویلپر)' : 'Muhammad Amjid (Developer)',
    badgeNative: isUrdu ? 'پشاور نیٹورک' : 'Peshawar Regional',
  };

  return (
    <div id="bazar360-footer-container" className="w-full mt-auto relative z-10 select-none">
      {/* 1. Signature Wave Curve Divider (Inspired by Pic 1) */}
      <div className="w-full relative overflow-hidden -mt-1 pointer-events-none select-none">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block -mb-0.5">
          {/* Accent layered orange curves */}
          <path d="M0 60C240 15 480 15 720 50C960 85 1200 85 1440 40V100H0V60Z" fill="#F97316" opacity="0.1" />
          <path d="M0 70C240 30 480 30 720 60C960 90 1200 90 1440 50V100H0V70Z" fill="#F97316" />
          {/* Main Slate/Navy base wave curve */}
          <path d="M0 78C240 38 480 38 720 68C960 98 1200 98 1440 58V100H0V78Z" fill="#0B1329" />
        </svg>
      </div>

      {/* 2. Main High-Fidelity Footer Body */}
      <footer id="bazar360-main-footer" className="w-full bg-[#0B1329] border-t border-white/5 text-slate-300 pt-10 pb-12 px-4 md:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 text-left mb-12">
            
            {/* Column 1: Brand & Identity */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-sans font-black text-2xl tracking-tight text-white uppercase block">
                  BAZAR<span className="text-[#F97316]">360</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-black text-slate-400 block">
                  AUTOMOTIVE NETWORK
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Pakistan's trusted automotive marketplace. Verified vehicles, trusted people, premium experience.
              </p>

              <div className="h-[2px] w-12 bg-[#F97316]"></div>

              {/* Social Icons matching screenshot */}
              <div className="flex items-center gap-2.5 pt-2">
                <a 
                  href="https://facebook.com/bazar360.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://instagram.com/bazar360.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://linkedin.com/company/bazar360" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://wa.me/923149198403" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: MARKETPLACE */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  MARKETPLACE
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>
                  <button 
                    onClick={() => setTab && setTab('search')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Browse Cars
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('dealer-storefront')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Verified Showrooms
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('portal')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('dealer-storefront')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Auto Choice
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('portal')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Sell Vehicle
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('portal')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('search')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                  >
                    <span className="text-[#F97316]">&gt;</span> FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: SUPPORT */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  SUPPORT
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>
                  <button 
                    onClick={onOpenSupportDrawer}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenSupportDrawer}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Support Ticket
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => alert('Our detailed legal terms are securely registered with Peshawar Regional Authority.')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => alert('Terms and Conditions apply to all showroom dealer entities and buyers.')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Terms & Conditions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => alert('Cookies allow premium profile session storage persistence.')}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Cookies Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenSupportDrawer}
                    className="hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-left"
                  >
                    <span className="text-[#F97316]">&gt;</span> Report Abuse
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: OUR TEAM */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  OUR TEAM
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>
              
              <div className="space-y-4">
                {/* Team Profile 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-[#0B1329] text-orange-500 font-extrabold text-[10px] uppercase">
                    MA
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white leading-tight">
                      Muhammad Amjid <span className="text-slate-500 font-mono font-normal">| 03149198403</span>
                    </h4>
                    <p className="text-[10px] font-bold text-orange-500 uppercase mt-0.5">
                      Founder & CEO
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-1">
                      Product Strategy • Technology • Platform Development
                    </p>
                  </div>
                </div>

                {/* Team Profile 2 */}
                <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-[#0B1329] text-orange-500 font-extrabold text-[10px] uppercase">
                    MM
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white leading-tight">
                      Malak Mazhar <span className="text-slate-500 font-mono font-normal">| 03159085086</span>
                    </h4>
                    <p className="text-[10px] font-bold text-orange-500 uppercase mt-0.5">
                      Head of Automotive Sales
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-1">
                      Vehicle Sales • Negotiations • Customer Advisory
                    </p>
                  </div>
                </div>

                {/* Team Profile 3 */}
                <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-[#0B1329] text-orange-500 font-extrabold text-[10px] uppercase">
                    GK
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-white leading-tight">
                      Ghani Khan <span className="text-slate-500 font-mono font-normal">| 03556908996</span>
                    </h4>
                    <p className="text-[10px] font-bold text-orange-500 uppercase mt-0.5">
                      Media & Inventory Manager
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-1">
                      Vehicle Listings • Media Management • Marketplace Operations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 5: CUSTOMER SUGGESTIONS BOX */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  FEEDBACK PORTAL
                </h3>
                <div className="h-[2px] w-6 bg-[#F97316]"></div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your suggestions or feedback directly to our management desk to help us improve your experience.
              </p>

              <form onSubmit={handleSuggestionSubmit} className="space-y-2.5">
                <div className="relative">
                  <input 
                    type="text"
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Type your suggestion or feedback..."
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all resize-none font-sans"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || !suggestionText.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-400 text-stone-950 text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Submit Feedback</span>
                  <Send className="w-3.5 h-3.5" />
                </button>

                {submitSuccess && (
                  <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-1 px-2 text-center animate-fade-in font-medium">
                    ✓ Thank you! Feedback registered.
                  </p>
                )}

                {submitError && (
                  <p className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-1 px-2 text-center font-medium">
                    {submitError}
                  </p>
                )}
              </form>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 justify-center sm:justify-start">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Your feedback is encrypted and secure.</span>
              </div>
            </div>

          </div>

          {/* Separate Contact Section Below */}
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl justify-center md:justify-start">
              <Phone className="w-4 h-4 text-emerald-400" />
              <div className="text-left text-xs">
                <span className="text-slate-500 font-mono block uppercase text-[9px] font-black leading-none mb-1">Malak Mazhar Services</span>
                <a href="tel:+923159085086" className="text-white hover:text-orange-500 font-black font-mono transition-colors">
                  +92 315 9085086
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl justify-center md:justify-start">
              <Phone className="w-4 h-4 text-emerald-400" />
              <div className="text-left text-xs">
                <span className="text-slate-500 font-mono block uppercase text-[9px] font-black leading-none mb-1">Helpline & Product Support</span>
                <a href="tel:+923149198403" className="text-white hover:text-orange-500 font-black font-mono transition-colors">
                  +92 314 9198403
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl justify-center md:justify-start">
              <Mail className="w-4 h-4 text-[#F97316]" />
              <div className="text-left text-xs">
                <span className="text-slate-500 font-mono block uppercase text-[9px] font-black leading-none mb-1">Official Administration Email</span>
                <a href="mailto:amjid.psh@gmail.com" className="text-white hover:text-orange-500 font-black font-mono transition-colors">
                  amjid.psh@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom copyright segment */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>{t.copyright}</span>
            <div className="flex items-center gap-1">
              <span>Simple. Direct. Secure.</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse ml-1.5" />
              <span>for Peshawar Regional Network</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
