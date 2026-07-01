import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Sparkles } from 'lucide-react';

interface ContactViewProps {
  lang: 'en' | 'ur';
  onOpenSupportDrawer?: () => void;
}

export default function ContactView({ lang, onOpenSupportDrawer }: ContactViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const t = {
    en: {
      title: "Contact Support",
      subtitle: "Get in touch with the official BAZAR360 helpdesk & support center",
      drawerBannerTitle: "Need Instant 24/7 Helpline?",
      drawerBannerDesc: "Our fast response slide-up desk connects you to Malak Mazhar & Muhammad Amjid instantly.",
      drawerBannerBtn: "Open Live Help Desk",
      infoTitle: "Support Details",
      founder: "Founder & CEO",
      name: "Muhammad Amjid",
      partner: "Services & Auto Choice Partner",
      partnerName: "Malak Mazhar",
      addressLabel: "Address",
      address: "Peshawar, Khyber Pakhtunkhwa, Pakistan",
      formTitle: "Send Us a Message",
      formSubtitle: "We usually respond within 2 hours on working days",
      namePlaceholder: "Your Name",
      phonePlaceholder: "Phone / WhatsApp",
      msgPlaceholder: "Your Message...",
      sendBtn: "Send Message",
      successTitle: "Message Sent Successfully!",
      successDesc: "Thank you for contacting BAZAR360. Our representative will contact you shortly."
    },
    ur: {
      title: "رابطہ اور سپورٹ",
      subtitle: "بازار360 کے آفیشل ہیلپ ڈیسک اور سپورٹ سینٹر سے رابطہ کریں",
      drawerBannerTitle: "کیا آپ کو فوری 24/7 ہیلپ لائن چاہیے؟",
      drawerBannerDesc: "ہماری تیز رفتار سلائیڈ اپ ڈیسک آپ کو ملک مظہر اور محمد امجد سے فوری منسلک کرتی ہے۔",
      drawerBannerBtn: "لائیو سپورٹ ڈیسک کھولیں",
      infoTitle: "رابطہ کی تفصیلات",
      founder: "بانی اور سی ای او",
      name: "محمد امجد",
      partner: "سروسز اور آٹو چوائس پارٹنر",
      partnerName: "ملک مظہر",
      addressLabel: "پتہ",
      address: "پشاور، خیبر پختونخوا، پاکستان",
      formTitle: "ہمیں پیغام بھیجیں",
      formSubtitle: "ہم عام طور پر کام کے دنوں میں 2 گھنٹے کے اندر جواب دیتے ہیں",
      namePlaceholder: "آپ کا نام",
      phonePlaceholder: "فون / واٹس ایپ نمبر",
      msgPlaceholder: "آپ کا پیغام...",
      sendBtn: "پیغام بھیجیں",
      successTitle: "پیغام کامیابی سے بھیج دیا گیا!",
      successDesc: "بازار360 سے رابطہ کرنے کا شکریہ۔ ہمارا نمائندہ جلد ہی آپ سے رابطہ کرے گا۔"
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setMessage('');
    setSubmitted(false);
  };

  const isRtl = lang === 'ur';

  return (
    <div 
      className={`space-y-8 animate-fade-in text-slate-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-4">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-sans text-sky-500 dark:text-[#38BDF8] flex items-center gap-2">
          <MessageSquare size={20} className="text-sky-500 dark:text-[#38BDF8]" />
          {t.title}
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1 font-sans">
          {t.subtitle}
        </p>
      </div>

      {/* 24/7 Slide-up Help Desk CTA Banner */}
      {onOpenSupportDrawer && (
        <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/15 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1 text-left">
            <h3 className="text-base font-sans font-black uppercase text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-sky-500 dark:text-[#38BDF8]" />
              {t.drawerBannerTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 max-w-xl font-sans leading-relaxed">
              {t.drawerBannerDesc}
            </p>
          </div>
          <button
            onClick={onOpenSupportDrawer}
            className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 dark:bg-[#0ea5e9] dark:hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase px-6 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-sky-500/10 min-h-[44px]"
          >
            <MessageSquare size={14} />
            {t.drawerBannerBtn}
          </button>
        </div>
      )}

      {/* Grid Layout: Contact Info vs Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Contact Details */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm text-left">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-sky-500 dark:text-[#38BDF8] border-b border-slate-100 dark:border-white/5 pb-3 font-sans">
            {t.infoTitle}
          </h3>

          <div className="space-y-4">
            {/* Malak Mazhar Services Card & Contact (Top) */}
            <a 
              href="https://wa.me/923159085086" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 dark:bg-[#030712] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group cursor-pointer block text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-sans font-black text-base select-none shrink-0 group-hover:scale-105 transition-transform">
                  MM
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">{t.partner}</span>
                  <h4 className="text-sm font-sans font-black text-slate-800 dark:text-white uppercase leading-none mt-1">{t.partnerName}</h4>
                  <p className="text-xs font-mono font-black text-slate-500 dark:text-slate-300 mt-2 flex items-center gap-1.5">
                    <Phone size={12} className="text-amber-500 shrink-0" />
                    +92 315 9085086
                  </p>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase font-mono px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-stone-950 transition-all shrink-0">
                WhatsApp
              </div>
            </a>

            {/* Muhammad Amjid Founder & CEO Card & Contact */}
            <a 
              href="https://wa.me/923149198403" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 dark:bg-[#030712] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group cursor-pointer block text-left"
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-sans font-black text-base select-none shrink-0 group-hover:scale-105 transition-transform">
                  MA
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{t.founder}</span>
                  <h4 className="text-sm font-sans font-black text-slate-800 dark:text-white uppercase leading-none mt-1">{t.name}</h4>
                  <p className="text-xs font-mono font-black text-slate-500 dark:text-slate-300 mt-2 flex items-center gap-1.5">
                    <Phone size={12} className="text-sky-500 dark:text-[#38BDF8] shrink-0" />
                    0314 9198403
                  </p>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase font-mono px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-stone-950 transition-all shrink-0">
                WhatsApp
              </div>
            </a>

            {/* Physical Location */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-[#030712]/40 border border-slate-200 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.addressLabel}</span>
                <p className="text-xs md:text-sm font-sans text-slate-700 dark:text-gray-300 mt-0.5">{t.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Contact Form */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl shadow-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white font-sans">
                  {t.formTitle}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 font-sans mt-0.5">
                  {t.formSubtitle}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 min-h-[44px]"
                />

                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 min-h-[44px]"
                />

                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.msgPlaceholder}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/5 text-sm rounded-xl p-3 focus:border-sky-500 dark:focus:border-[#38bdf8] outline-none text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-[#0ea5e9] dark:hover:bg-[#38bdf8] text-white font-sans font-extrabold text-xs uppercase py-3.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Send size={14} />
                {t.sendBtn}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-12">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white font-sans">
                  {t.successTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-sans max-w-xs mx-auto">
                  {t.successDesc}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-sans font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-white/10 min-h-[44px]"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
