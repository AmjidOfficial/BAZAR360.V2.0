import React from 'react';
import { Mail, Phone, MapPin, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-secondary border-t border-border-main/50 text-text-muted mt-auto">
      {/* Top Footer Banner */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10 text-left">
        {/* Brand & Slogan Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black uppercase text-text-main tracking-tight font-sans flex items-center gap-1.5">
              BAZAR<span className="text-accent-main font-mono">360</span>
            </span>
            <span className="bg-accent-main/10 border border-accent-main/20 text-accent-main text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded">
              v2.0 PRO
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed uppercase tracking-wider font-mono">
            The definitive multi-tenant automotive trade marketplace. Synced globally with flagship showroom themes, verified vehicle condition indexing, and escrow protection.
          </p>
          <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-accent-main font-bold">
            <ShieldCheck size={14} /> Bazar360 Escrow Protection Active
          </div>
        </div>

        {/* Founder & Hotline Desk */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs font-black uppercase text-text-main tracking-widest font-mono">
            Founder & Trade Desk
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-bg-primary border border-border-main flex items-center justify-center text-accent-main shrink-0">
                <Sparkles size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-text-muted uppercase">Platform Director</p>
                <p className="text-xs font-extrabold text-text-main uppercase tracking-tight">Muhammad Amjid</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-bg-primary border border-border-main flex items-center justify-center text-accent-main shrink-0">
                <Phone size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-text-muted uppercase">Helpline Secure Connect</p>
                <a 
                  href="tel:03149198403" 
                  className="text-xs font-black text-accent-main font-mono tracking-widest hover:underline block"
                >
                  03149198403
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Hub Column */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-black uppercase text-text-main tracking-widest font-mono">
            Platform Security
          </h4>
          <p className="text-[10px] text-text-muted leading-relaxed font-mono uppercase">
            All deals are legally guarded by platform verification checkpoints. Inquiries route instantly to registered dealer dashboard hubs.
          </p>
          <p className="text-[10.5px] font-mono text-text-muted">
            📍 <span className="text-text-main font-bold uppercase tracking-tight">KP Region, Pakistan</span>
          </p>
        </div>
      </div>

      {/* Bottom Legal Credit bar */}
      <div className="w-full bg-bg-primary/50 border-t border-border-main/30 py-6 text-center text-[10px] font-mono text-text-muted uppercase tracking-luxury max-md:px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} BAZAR360.ONLINE. ALL RIGHTS RESERVED.
          </p>
          <p className="flex items-center gap-1">
            CRAFTED WITH <Heart size={11} className="text-red-500 fill-red-500" /> FOR SUPERIOR UX AND HIGH-SPEED AUTOTRADE
          </p>
        </div>
      </div>
    </footer>
  );
}
