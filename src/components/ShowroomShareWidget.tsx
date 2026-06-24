import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { Dealer } from '../types';

interface ShowroomShareWidgetProps {
  dealer: Dealer;
}

export default function ShowroomShareWidget({ dealer }: ShowroomShareWidgetProps) {
  const [copied, setCopied] = useState(false);

  // Automated Slug Calculation
  const slug = dealer.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const shareUrl = `https://bazar360.online/dealers/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${dealer.name}'s premium vehicle showroom on BAZAR360! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyForInstagram = () => {
    // Instagram doesn't have a direct "share to feed" web API with pre-filled text that works perfectly everywhere,
    // so standard practice is copying to clipboard and opening instagram.
    handleCopy();
    alert('Link copied to clipboard! Open Instagram to paste it in your bio or story.');
    window.open('https://instagram.com', '_blank');
  };

  return (
    <div className="bg-[#0b1324] border border-[#1f2937] rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#00d2ff]/10 rounded-lg shrink-0">
          <Share2 size={20} className="text-[#00d2ff]" />
        </div>
        <div>
          <h3 className="font-black text-white uppercase tracking-tight text-sm">
            Sharable Multi-Tenant Profile Link
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Generate and broadcast your verified showroom social presence.
          </p>
        </div>
      </div>

      <div className="flex gap-2 items-center mb-5 relative group">
        <input 
          type="text" 
          value={shareUrl}
          readOnly
          className="w-full bg-[#070c18] border border-[#1f2937] rounded-xl py-3 px-4 text-[#00d2ff] font-mono text-[11px] select-all outline-none"
        />
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-[#00d2ff] text-slate-950 hover:bg-[#00d2ff]/90 hover:scale-105 active:scale-95'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button 
          onClick={shareToWhatsApp}
          className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <MessageCircle size={14} />
          WhatsApp
        </button>
        <button 
          onClick={shareToFacebook}
          className="flex items-center justify-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <Facebook size={14} />
          Facebook
        </button>
        <button 
          onClick={copyForInstagram}
          className="flex items-center justify-center gap-2 bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border border-[#E1306C]/30 text-[#E1306C] px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <Instagram size={14} />
          Instagram
        </button>
      </div>
    </div>
  );
}
