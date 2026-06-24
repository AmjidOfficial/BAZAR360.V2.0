import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Check, 
  Sliders, 
  Info, 
  Lock,
  Globe,
  Radio,
  Eye,
  RefreshCw
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// Default Gateway Space Cyber Dark Theme Variables
export const DEFAULT_THEME_VARIABLES = {
  bgPrimary: '#030712',
  bgSecondary: '#0b0f19',
  textMain: '#f3f4f6',
  textMuted: '#9ca3af',
  borderMain: 'rgba(56, 189, 248, 0.12)',
  accentMain: '#38BDF8',
  accentHover: '#0ea5e9'
};

// Preset Gateway Themes
export const PRESETS = [
  {
    id: 'gateway-cyber',
    name: 'Gateway Space Cyber',
    desc: 'Deep space obsidian with high-energy cybernetic sky blue.',
    vars: {
      bgPrimary: '#030712',
      bgSecondary: '#0b0f19',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      borderMain: 'rgba(56, 189, 248, 0.12)',
      accentMain: '#38BDF8',
      accentHover: '#0ea5e9'
    }
  },
  {
    id: 'khyber-emerald',
    name: 'Khyber Emerald Velvet',
    desc: 'Regal mountain emerald velvet with sharp gold accents.',
    vars: {
      bgPrimary: '#021812',
      bgSecondary: '#04281e',
      textMain: '#ecfdf5',
      textMuted: '#86efac',
      borderMain: 'rgba(16, 185, 129, 0.15)',
      accentMain: '#d4af37',
      accentHover: '#b4966e'
    }
  },
  {
    id: 'obsidian-gold',
    name: 'Bespoke Gold Prestige',
    desc: 'High-end champagne luxury with polished carbon black.',
    vars: {
      bgPrimary: '#070708',
      bgSecondary: '#0e0e11',
      textMain: '#fcf8f2',
      textMuted: '#b4966e',
      borderMain: 'rgba(197, 168, 128, 0.12)',
      accentMain: '#c5a880',
      accentHover: '#e1cdb5'
    }
  }
];

export default function ThemeEngine() {
  const [themeVars, setThemeVars] = useState(DEFAULT_THEME_VARIABLES);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [isLiveSynced, setIsLiveSynced] = useState(true);

  // Apply the variables directly to the root element :root
  const applyVariablesToRoot = (vars: typeof DEFAULT_THEME_VARIABLES) => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary', vars.bgPrimary);
    root.style.setProperty('--color-bg-secondary', vars.bgSecondary);
    root.style.setProperty('--color-text-main', vars.textMain);
    root.style.setProperty('--color-text-muted', vars.textMuted);
    root.style.setProperty('--color-border-main', vars.borderMain);
    root.style.setProperty('--color-accent-main', vars.accentMain);
    root.style.setProperty('--color-accent-hover', vars.accentHover);
    
    // Set legacy theme overrides to prevent styling discrepancies
    root.style.setProperty('--brand-bg', vars.bgPrimary);
    root.style.setProperty('--brand-text', vars.textMain);
    root.style.setProperty('--brand-border', vars.borderMain);
    root.style.setProperty('--brand-accent', vars.accentMain);
    root.style.setProperty('--brand-accent-hover', vars.accentHover);
  };

  // Listen to the Firestore "system/theme" document in real-time
  useEffect(() => {
    const themeDocRef = doc(db, 'system', 'theme');
    
    // First, verify if we need to seed
    const checkAndSeed = async () => {
      try {
        const snap = await getDoc(themeDocRef);
        if (!snap.exists()) {
          console.log('Theme document does not exist. Seeding default Gateway variables...');
          await setDoc(themeDocRef, DEFAULT_THEME_VARIABLES);
        }
      } catch (err) {
        console.warn('Unable to query/seed theme document, falling back to real-time listener or static state:', err);
      }
    };
    checkAndSeed();

    const unsubscribe = onSnapshot(themeDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as typeof DEFAULT_THEME_VARIABLES;
        // Basic schema verification
        if (data.bgPrimary && data.accentMain && data.textMain) {
          setThemeVars(data);
          applyVariablesToRoot(data);
          setIsLiveSynced(true);
        }
      } else {
        // Fallback to defaults
        applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Real-time theme engine listener status: Offline (using defaults)', error);
      // Non-critical fallback
      applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
      setIsLiveSynced(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateField = (key: keyof typeof DEFAULT_THEME_VARIABLES, val: string) => {
    const updated = { ...themeVars, [key]: val };
    setThemeVars(updated);
    applyVariablesToRoot(updated);
  };

  const handleApplyPreset = (presetVars: typeof DEFAULT_THEME_VARIABLES) => {
    setThemeVars(presetVars);
    applyVariablesToRoot(presetVars);
  };

  const handleResetToDefault = () => {
    setThemeVars(DEFAULT_THEME_VARIABLES);
    applyVariablesToRoot(DEFAULT_THEME_VARIABLES);
  };

  const handlePushToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const themeDocRef = doc(db, 'system', 'theme');
      await setDoc(themeDocRef, themeVars);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save variables globally to Firestore:', err);
      alert('Failed to save to Firestore. Verify database rules or connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // If loading and we haven't applied styles yet, render a silent indicator or nothing to prevent layout flashing
  if (loading) {
    return null;
  }

  return (
    <>
      {/* Floating Theme Controller Accent Trigger - Positioned discreetly in the screen edge */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowConfigurator(!showConfigurator)}
          className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border-main text-text-main rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-accent-main transition-all group cursor-pointer"
          title="Global Theme Propagator"
        >
          <Palette size={14} className="text-accent-main animate-spin-slow group-hover:rotate-45 transition-transform" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Gateway Theme</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Slide-out Theme Configurator Board */}
      <AnimatePresence>
        {showConfigurator && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigurator(false)}
              className="fixed inset-0 bg-black/70 z-[120] backdrop-blur-xs"
            />

            {/* Configurator Card */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-secondary border-l border-border-main p-6 z-[121] shadow-2xl flex flex-col text-left text-text-main overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border-main pb-4 mb-5 shrink-0">
                <div className="flex items-center gap-2">
                  <Palette size={20} className="text-accent-main" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">GLOBAL THEME PROPAGATOR</h3>
                    <p className="text-[9px] text-text-muted font-mono uppercase tracking-widest mt-0.5">
                      Real-Time Firestore Sync Active
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigurator(false)}
                  className="p-1.5 bg-bg-primary border border-border-main rounded-lg hover:text-accent-main transition-colors text-text-muted text-xs font-bold uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Notice Banner */}
              <div className="bg-accent-main/10 border border-accent-main/20 p-3.5 rounded-xl space-y-2 mb-5 shrink-0">
                <div className="flex items-center gap-2 text-[10.5px] font-bold text-accent-main uppercase tracking-tight">
                  <Radio size={14} className="animate-pulse" /> Multi-Session Synchronization
                </div>
                <p className="text-[9.5px] text-text-muted leading-relaxed uppercase tracking-wide font-mono">
                  All active browser sessions, dashboard views, and client terminals across the platform listen to these variables on Firestore. Saving updates the visual theme in real-time.
                </p>
              </div>

              {/* Preset Selector */}
              <div className="space-y-3 mb-5">
                <h4 className="text-[10px] font-bold uppercase text-text-muted tracking-widest font-mono flex items-center gap-1.5">
                  <Sparkles size={11} className="text-accent-main" /> Select Brand Archetype
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.vars)}
                      className="group w-full p-3 rounded-xl bg-bg-primary border border-border-main hover:border-text-muted/40 transition-all flex flex-col gap-1 text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold uppercase tracking-tight text-text-main group-hover:text-accent-main transition-colors">
                          {preset.name}
                        </span>
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.vars.bgPrimary }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.vars.bgSecondary }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.vars.accentMain }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-text-muted uppercase tracking-wider font-mono">
                        {preset.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw CSS Variable Tuning */}
              <div className="space-y-4 border-t border-border-main/50 pt-5">
                <h4 className="text-[10px] font-bold uppercase text-text-muted tracking-widest font-mono flex items-center gap-1.5">
                  <Sliders size={12} className="text-accent-main" /> CSS Variables Customizer
                </h4>

                <div className="space-y-3">
                  {/* bgPrimary */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">Primary Canvas</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-bg-primary</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.bgPrimary}
                        onChange={(e) => handleUpdateField('bgPrimary', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.bgPrimary}
                        onChange={(e) => handleUpdateField('bgPrimary', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* bgSecondary */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">Card Secondary Canvas</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-bg-secondary</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.bgSecondary}
                        onChange={(e) => handleUpdateField('bgSecondary', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.bgSecondary}
                        onChange={(e) => handleUpdateField('bgSecondary', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* textMain */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">High Contrast Text</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-text-main</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.textMain}
                        onChange={(e) => handleUpdateField('textMain', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.textMain}
                        onChange={(e) => handleUpdateField('textMain', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* textMuted */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">Secondary Muted Text</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-text-muted</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.textMuted}
                        onChange={(e) => handleUpdateField('textMuted', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.textMuted}
                        onChange={(e) => handleUpdateField('textMuted', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* accentMain */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">Brand Focal Accent</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-accent-main</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.accentMain}
                        onChange={(e) => handleUpdateField('accentMain', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.accentMain}
                        onChange={(e) => handleUpdateField('accentMain', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* accentHover */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-tight leading-none text-text-main">Accent Interactive Hover</p>
                      <p className="text-[9px] text-text-muted font-mono tracking-wider mt-1">--color-accent-hover</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="color"
                        value={themeVars.accentHover}
                        onChange={(e) => handleUpdateField('accentHover', e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeVars.accentHover}
                        onChange={(e) => handleUpdateField('accentHover', e.target.value)}
                        className="w-20 bg-bg-primary border border-border-main text-[10px] font-mono text-center py-1.5 rounded uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save & Reset Panel Action Footer */}
              <div className="mt-auto pt-6 border-t border-border-main/50 space-y-3 shrink-0">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex-1 px-4 py-3 bg-bg-primary border border-border-main text-text-muted hover:text-text-main rounded-xl text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} /> Default
                  </button>

                  <button
                    type="button"
                    onClick={handlePushToFirestore}
                    disabled={isSaving}
                    className="flex-2 px-5 py-3 bg-accent-main hover:bg-accent-main/90 disabled:opacity-50 text-stone-950 font-black rounded-xl text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Syncing...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check size={13} /> Live Synced!
                      </>
                    ) : (
                      <>
                        <Save size={13} /> Save to Firestore
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-text-muted uppercase text-center tracking-widest leading-none">
                  <Lock size={9} /> Authorized Administrator Level
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
