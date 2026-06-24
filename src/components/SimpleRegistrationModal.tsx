import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Sparkles } from 'lucide-react';
import { dbSaveUserProfile, UserProfile } from '../lib/dbService';

interface SimpleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function SimpleRegistrationModal({ isOpen, onClose, onSuccess }: SimpleRegistrationModalProps) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    // Clean and validate Pakistan phone format
    const cleanPhone = mobileNumber.replace(/[-\s]/g, '');
    const mobileRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!mobileRegex.test(cleanPhone)) {
      setError('Please enter a valid Pakistan mobile number (e.g., 03149198403)');
      return;
    }

    setSubmitting(true);
    const mockUid = `usr-${Date.now()}`;
    const newProfile: UserProfile = {
      uid: mockUid,
      email: `${mockUid}@bazar360.online`,
      displayName: fullName.trim(),
      phoneNumber: mobileNumber.trim(),
      phoneVerified: true,
      role: 'Buyer',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await dbSaveUserProfile(newProfile);
      localStorage.setItem('bazar360_user', JSON.stringify(newProfile));
      onSuccess(newProfile);
      onClose();
    } catch (err) {
      console.error('Failed simple registration:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-sm"
          />

          {/* Simple Registration Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 max-w-sm mx-auto my-auto h-fit bg-bg-secondary border border-border-main rounded-3xl p-6 z-[201] shadow-2xl text-text-main text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1.5 bg-accent-main/10 px-2.5 py-1 rounded-lg border border-accent-main/20 text-accent-main text-[10px] font-bold uppercase tracking-wider shrink-0">
                <Sparkles size={11} className="animate-pulse" /> Fast Pass Onboarding
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg-primary border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black uppercase text-text-main tracking-tight">
                Unlock Social Perks
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Register in 5 seconds to like, comment, request instant callbacks, and discuss verified vehicles.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest font-mono">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Ali"
                    className="w-full bg-bg-primary text-xs text-text-main pl-11 pr-4 py-3.5 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest font-mono">Pakistan Mobile Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="03149198403"
                    className="w-full bg-bg-primary text-xs text-text-main pl-11 pr-4 py-3.5 rounded-xl border border-border-main focus:outline-none focus:border-accent-main font-mono font-semibold"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[10.5px] text-red-400 font-sans font-medium bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent-main hover:bg-accent-main/90 disabled:opacity-50 text-stone-950 font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 210, 255, 0.2)' }}
              >
                {submitting ? 'Creating Profile...' : 'Unlock Account Now'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
