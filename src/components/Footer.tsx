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
  Users
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
    adminMazhar: isUrdu ? 'ملک مظہر (سروسز)' : 'Malak Mazhar (Head of Automotive Sales | Vehicle Sales • Negotiations • Customer Advisory

)',
  // Ensure lines 75 to 83 match cleanly like this:
  adminAmjid: isUrdu 
    ? 'محمد امجد (ڈویلپر)' 
    : 'Muhammad Amjid (Founder & CEO | Product Strategy • Technology • Platform Development)',
  adminGhani: isUrdu 
    ? 'غانی خان (انونٹری & میڈیا مینیجر)' 
    : 'Ghani Khan (Media & Inventory Manager | Vehicle Listings • Media Management • Marketplace Operations)',

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-left mb-12">
            
            {/* Column 1: Brand & Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-sans font-extrabold text-2xl tracking-tight text-white">
                  BAZAR<span className="text-[#F97316]">360</span>
                </span>
                <span className="text-[9px] font-semibold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {t.badgeNative}
                </span>
              </div>
              
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-normal">
                {t.vision}
              </p>

              <div className="pt-2 flex flex-wrap gap-3 items-center text-[10px] md:text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {t.tagline}
                </span>
              </div>
            </div>

            {/* Column 2: Quick Navigation */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#F97316]" />
                {t.navTitle}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setTab && setTab('home')}
                    className="hover:text-white transition-all flex items-center gap-1 group text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-[#F97316] transition-colors"></span>
                    {isUrdu ? 'ہوم پیج' : 'Homepage'}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#F97316]" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('search')}
                    className="hover:text-white transition-all flex items-center gap-1 group text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-[#F97316] transition-colors"></span>
                    {isUrdu ? 'گاڑیاں تلاش کریں' : 'Browse Inventory'}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#F97316]" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('dealer-storefront')}
                    className="hover:text-white transition-all flex items-center gap-1 group text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-[#F97316] transition-colors"></span>
                    {isUrdu ? 'تصدیق شدہ شورومز' : 'Verified Showrooms'}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#F97316]" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTab && setTab('portal')}
                    className="hover:text-white transition-all flex items-center gap-1 group text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-[#F97316] transition-colors"></span>
                    {isUrdu ? 'ملٹی رول پورٹل' : 'Onboarding Portal'}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#F97316]" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Redesigned Support Desk */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#F97316]" />
                {t.supportTitle}
              </h3>
              
              <div className="space-y-3.5">
                {/* 1. Direct Slide-up support ticket drawer CTA */}
                {onOpenSupportDrawer && (
                  <button 
                    onClick={onOpenSupportDrawer}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/5 border border-white/10 hover:border-[#F97316]/30 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-all shadow-md group"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#F97316]" />
                      {t.openTicket}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                )}

                {/* 2. Direct Admin Contacts (Styled perfectly with WhatsApp clicks) */}
                <div className="space-y-2.5 pt-1.5 border-t border-white/5">
                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{t.adminMazhar}</p>
                    <a 
                      href="https://wa.me/923159085086"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white hover:text-[#38BDF8] font-semibold transition-colors group"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+92 315 9085086</span>
                    </a>
                  </div>

                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{t.adminAmjid}</p>
                    <a 
                      href="https://wa.me/923149198403"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white hover:text-[#38BDF8] font-semibold transition-colors group"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+92 314 9198403</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Interactive Suggestions Box */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                {t.suggestionsTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.suggestionsSub}
              </p>

              <form onSubmit={handleSuggestionSubmit} className="space-y-2">
                <div className="relative">
                  <textarea 
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder={t.placeholder}
                    rows={2}
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all resize-none"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || !suggestionText.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? '...' : t.btnSend}</span>
                </button>

                {submitSuccess && (
                  <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-1 px-2 text-center animate-fade-in font-medium">
                    {t.successMsg}
                  </p>
                )}

                {submitError && (
                  <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-1 px-2 text-center font-medium">
                    {submitError}
                  </p>
                )}
              </form>
            </div>

          </div>

          {/* Bottom copyright segment */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>{t.copyright}</span>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>for Peshawar Regional Network</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
