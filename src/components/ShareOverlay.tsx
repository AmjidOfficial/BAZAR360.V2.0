import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, MessageSquare, Facebook, Link2, ExternalLink } from 'lucide-react';

interface ShareOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
}

export default function ShareOverlay({ isOpen, onClose, title, description, url }: ShareOverlayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🔥 Check out this on BAZAR360: ${title} - ${description}. Details: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
          />

          {/* Share Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-bg-secondary border-t border-border-main rounded-t-[32px] p-6 pb-8 z-[101] shadow-[0_-12px_40px_rgba(0,0,0,0.6)] text-text-main"
          >
            {/* Header notch */}
            <div className="w-12 h-1.5 bg-border-main rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold uppercase tracking-tight text-text-main">
                One-Tap Share
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg-primary border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mb-6 p-4.5 bg-bg-primary rounded-2xl border border-border-main flex gap-3.5 items-center">
              <div className="w-11 h-11 rounded-xl bg-accent-main/10 flex items-center justify-center text-accent-main shrink-0">
                <Link2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black uppercase text-text-main truncate">{title}</h4>
                <p className="text-[11px] text-text-muted truncate mt-0.5">{description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 mb-6">
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center justify-center p-4 bg-[#25D366]/5 hover:bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-2xl gap-2 text-[#25D366] transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} className="fill-[#25D366]/10" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">WhatsApp</span>
              </button>

              <button
                onClick={handleFacebook}
                className="flex flex-col items-center justify-center p-4 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 border border-[#1877F2]/20 hover:border-[#1877F2]/40 rounded-2xl gap-2 text-[#1877F2] transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-[#1877F2]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook size={20} className="fill-[#1877F2]/10" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Facebook</span>
              </button>

              <button
                onClick={handleCopy}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all cursor-pointer group ${
                  copied
                    ? 'bg-emerald-500/5 border border-emerald-500/30 text-emerald-400'
                    : 'bg-accent-main/5 hover:bg-accent-main/10 border border-accent-main/20 hover:border-accent-main/40 text-accent-main'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  copied ? 'bg-emerald-500/10' : 'bg-accent-main/10'
                }`}>
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>

            <div className="bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted truncate select-all pr-4 max-w-[280px]">
                {url}
              </span>
              <ExternalLink size={12} className="text-text-muted" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
