import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Shield, 
  MapPin, 
  Phone, 
  Check, 
  CheckCircle, 
  Smartphone, 
  Mail, 
  UserPlus, 
  Lock, 
  Layers, 
  Sparkles,
  RefreshCw,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Video
} from 'lucide-react';
import { Dealer } from '../types';
import { UserProfile, dbSaveUserProfile, dbRegisterDealership } from '../lib/dbService';

interface RegistrationPortalProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  onDealerRegistered: (newDealer: Dealer) => void;
  onClose?: () => void;
}

export default function RegistrationPortal({ 
  currentUser, 
  setCurrentUser, 
  onDealerRegistered,
  onClose 
}: RegistrationPortalProps) {
  // Navigation active tab
  const [activeForm, setActiveForm] = useState<'profile' | 'dealership' | 'role-control'>('profile');

  // 1. User Registration State
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [userDisplayName, setUserDisplayName] = useState(currentUser?.displayName || '');
  const [userRole, setUserRole] = useState<'Buyer' | 'PrivateSeller'>('PrivateSeller');
  const [userRegion, setUserRegion] = useState('Lahore');
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // 2. Dealer Registration State
  const [dealerName, setDealerName] = useState('');
  const [dealerSubtitle, setDealerSubtitle] = useState('Certified Showroom & Premium Importers');
  const [dealerLocation, setDealerLocation] = useState('DHA Phase 6, Karachi');
  const [dealerPhone, setDealerPhone] = useState('+92 21 555 1212');
  const [dealerWhatsapp, setDealerWhatsapp] = useState('+92 321 987 6543');
  const [dealerCoverImage, setDealerCoverImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuB7L3tc6G8oV2yG6bD2-4rkocsDR68Fv03AYKixBC3Jo7z3F2dxC7l1k4a5qF2lg9sOFyDrPsAyPlvZ6lr6DN1PB651SzZXlvwyRfHsTV44M01h5rtpJZP3vkPARPkwkcD8rbWhw9phqyv92EMw-dvIsScW2rCrgiunc8yMndccSDmD5SZni8J5SJF098meLiFId3ebyei-RpMdRt4bsa4Ot5PZonvepRTSshKKpywxQZF24fSlk6DLYXf6M5s4qDFp0VhtnsirnJI');
  const [dealerDescription, setDealerDescription] = useState('Established boutique showroom collection offering handpicked luxury parameter vehicles and certified inspections.');
  const [dealerSuccessMessage, setDealerSuccessMessage] = useState('');

  // Dealer Social Presence State
  const [dealerWebsite, setDealerWebsite] = useState('');
  const [dealerInstagram, setDealerInstagram] = useState('');
  const [dealerFacebook, setDealerFacebook] = useState('');
  const [dealerTiktok, setDealerTiktok] = useState('');
  const [dealerYoutube, setDealerYoutube] = useState('');
  const [dealerTwitter, setDealerTwitter] = useState('');

  // Handle User Registration
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || !userDisplayName.trim()) return;

    const generatedUid = currentUser?.uid || `usr-${Date.now().toString().slice(-6)}`;
    const newProfile: UserProfile = {
      uid: generatedUid,
      email: userEmail.trim(),
      displayName: userDisplayName.trim(),
      role: userRole,
      region: userRegion,
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await dbSaveUserProfile(newProfile);
      setCurrentUser(newProfile);
      setUserSuccessMessage(`✓ Registration successful! Logged in as ${newProfile.displayName} (${newProfile.role})`);
      setTimeout(() => {
        setUserSuccessMessage('');
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      // Local fallback to guarantee absolute preview fluidity and robustness
      setCurrentUser(newProfile);
      setUserSuccessMessage(`✓ Active offline session registered: ${newProfile.displayName}`);
    }
  };

  // Handle Dealership Registration
  const handleDealerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName.trim()) return;

    const newDealerId = dealerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newDealer: Dealer = {
      id: newDealerId,
      name: dealerName,
      avatarLetter: dealerName.substring(0, 2).toUpperCase(),
      subtitle: dealerSubtitle,
      location: dealerLocation,
      rating: 5.0,
      vehiclesCount: 0,
      followersCount: '1',
      coverImage: dealerCoverImage,
      description: dealerDescription,
      phone: dealerPhone,
      whatsapp: dealerWhatsapp,
      socials: {
        website: dealerWebsite.trim() || undefined,
        instagram: dealerInstagram.trim() || undefined,
        facebook: dealerFacebook.trim() || undefined,
        tiktok: dealerTiktok.trim() || undefined,
        youtube: dealerYoutube.trim() || undefined,
        twitter: dealerTwitter.trim() || undefined
      },
      activityFeed: []
    };

    try {
      await dbRegisterDealership(newDealer);
      onDealerRegistered(newDealer);
      setDealerSuccessMessage(`✓ Showroom "${dealerName}" registered successfully! Review pending approval.`);
      // If of current user, update their profile too
      if (currentUser) {
        const updatedUsr: UserProfile = {
          ...currentUser,
          role: 'Manager', // Auto-elevate to dealership manager
          salesPodId: newDealerId
        };
        await dbSaveUserProfile(updatedUsr);
        setCurrentUser(updatedUsr);
      }
      // Reset
      setDealerName('');
      setTimeout(() => {
        setDealerSuccessMessage('');
        if (onClose) onClose();
      }, 4000);
    } catch (err) {
      console.error(err);
      onDealerRegistered(newDealer);
      setDealerSuccessMessage(`✓ Showroom registered! Defaulting sandbox values.`);
    }
  };

  // Switch role deck dynamically (Admin simulation & review bypass)
  const quickSwitchRole = async (targetRole: 'Admin' | 'Manager' | 'SalesRep' | 'PrivateSeller' | 'Buyer') => {
    const freshUid = currentUser?.uid || `usr-admin-${Date.now().toString().slice(-4)}`;
    const updated: UserProfile = {
      uid: freshUid,
      email: currentUser?.email || 'admin@bazar360.com.pk',
      displayName: currentUser?.displayName || 'Aamir S. (Executive Portal)',
      role: targetRole,
      region: currentUser?.region || 'Lahore',
      salesPodId: currentUser?.salesPodId || 'almas-car-valley',
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await dbSaveUserProfile(updated);
      setCurrentUser(updated);
    } catch (err) {
      console.warn(err);
      setCurrentUser(updated);
    }
  };

  return (
    <div className="bg-[#121a2a] border border-[#1e293b] rounded-3xl p-6 shadow-2xl relative overflow-hidden text-xs font-sans">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Upper Tab Bar Switchers */}
      <div className="flex border-b border-[#1e293b] pb-3 mb-5 justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveForm('profile')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 duration-100 uppercase tracking-wider text-[10px] ${
              activeForm === 'profile'
                ? 'bg-[#00a3ff] text-white shadow shadow-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={13} />
            User Signup/Login
          </button>
          
          <button
            onClick={() => setActiveForm('dealership')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 duration-100 uppercase tracking-wider text-[10px] ${
              activeForm === 'dealership'
                ? 'bg-[#00a3ff] text-white shadow shadow-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building size={13} />
            Showroom Registration
          </button>
        </div>

        <button
          onClick={() => setActiveForm('role-control')}
          className={`px-3 py-2 rounded-xl font-bold font-mono flex items-center gap-1 duration-100 text-[10px] border border-dashed ${
            activeForm === 'role-control'
              ? 'border-[#00a3ff] text-[#00a3ff] bg-[#00a3ff]/5'
              : 'border-[#1e293b] text-gray-400 hover:text-white'
          }`}
        >
          <Layers size={11} />
          Role Control Deck
        </button>
      </div>

      {/* FORM 1: User Profile Signup/Registration */}
      {activeForm === 'profile' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
              <UserPlus size={16} className="text-[#38bdf8]" /> Simple Marketplace User Registration
            </h3>
            <p className="text-gray-400 text-[11px]">
              Every buyer and private advertiser can sign up to post ads like FB Marketplace and place bids.
            </p>
          </div>

          {userSuccessMessage && (
            <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle size={15} />
              {userSuccessMessage}
            </div>
          )}

          <form onSubmit={handleUserRegister} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">DisplayName Moniker:</label>
                <div className="bg-[#051020] border border-[#1e293b] rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <User size={14} className="text-[#38bdf8]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zayed Al-Nafusi"
                    value={userDisplayName}
                    onChange={(e) => setUserDisplayName(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-gray-600 block text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Verified Email Address:</label>
                <div className="bg-[#051020] border border-[#1e293b] rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Mail size={14} className="text-[#38bdf8]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. zayed@bazar360.ae"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-gray-600 block text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Marketplace Role Tier:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('PrivateSeller')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      userRole === 'PrivateSeller'
                        ? 'border-[#38bdf8] bg-[#051020] text-[#38bdf8]'
                        : 'border-[#1e293b] text-gray-400'
                    }`}
                  >
                    Private Seller (Like FB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('Buyer')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      userRole === 'Buyer'
                        ? 'border-[#38bdf8] bg-[#051020] text-[#38bdf8]'
                        : 'border-[#1e293b] text-gray-400'
                    }`}
                  >
                    General Buyer
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Location Region:</label>
                <select
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-[#38bdf8]"
                >
                  <option value="Lahore">Lahore, Pakistan</option>
                  <option value="Karachi">Karachi, Pakistan</option>
                  <option value="Islamabad">Islamabad, Pakistan</option>
                  <option value="Faisalabad">Faisalabad, Pakistan</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#00a3ff] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/20 active:scale-95 duration-100"
              >
                Register & Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 2: Dealership Registration Form */}
      {activeForm === 'dealership' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
              <Building size={16} className="text-orange-400" /> Apply Showroom / Dealership License
            </h3>
            <p className="text-gray-400 text-[11px]">
              Set up a verified professional storefront representation to showcase certified sports & prestige vehicles.
            </p>
          </div>

          {dealerSuccessMessage && (
            <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle size={15} />
              {dealerSuccessMessage}
            </div>
          )}

          <form onSubmit={handleDealerRegister} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Showroom Branding Name:</label>
                <div className="bg-[#051020] border border-[#1e293b] rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Building size={14} className="text-orange-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yas Marina Motors"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-gray-600 block text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Tagline Slogan:</label>
                <input
                  type="text"
                  required
                  placeholder="Premium Performance Specialists"
                  value={dealerSubtitle}
                  onChange={(e) => setDealerSubtitle(e.target.value)}
                  className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">HQ City Location:</label>
                <input
                  type="text"
                  required
                  value={dealerLocation}
                  onChange={(e) => setDealerLocation(e.target.value)}
                  className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Hotline Phone:</label>
                <input
                  type="text"
                  required
                  value={dealerPhone}
                  onChange={(e) => setDealerPhone(e.target.value)}
                  className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">WhatsApp Secure:</label>
                <input
                  type="text"
                  required
                  value={dealerWhatsapp}
                  onChange={(e) => setDealerWhatsapp(e.target.value)}
                  className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Executive Showroom Description:</label>
              <textarea
                rows={2}
                value={dealerDescription}
                onChange={(e) => setDealerDescription(e.target.value)}
                className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none resize-none leading-relaxed text-xs"
              ></textarea>
            </div>

            {/* Digital Presence & Social Media Accounts */}
            <div className="border-t border-[#1e293b] pt-4 mt-2 space-y-3">
              <span className="text-[10px] text-orange-400 uppercase font-mono font-bold tracking-wider block">
                🌐 Social Media & Digital Accounts (Link your Showroom Channels)
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Globe size={11} className="text-[#38bdf8]" /> Website Account Link:
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourshowroom.com"
                    value={dealerWebsite}
                    onChange={(e) => setDealerWebsite(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Instagram size={11} className="text-[#38bdf8]" /> Instagram Handle:
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={dealerInstagram}
                    onChange={(e) => setDealerInstagram(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Facebook size={11} className="text-[#38bdf8]" /> Facebook Profile:
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={dealerFacebook}
                    onChange={(e) => setDealerFacebook(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Video size={11} className="text-[#38bdf8]" /> TikTok Profile Link:
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@youraccount"
                    value={dealerTiktok}
                    onChange={(e) => setDealerTiktok(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Youtube size={11} className="text-[#38bdf8]" /> YouTube Channel:
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={dealerYoutube}
                    onChange={(e) => setDealerYoutube(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Twitter size={11} className="text-[#38bdf8]" /> Twitter / X Profile:
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle"
                    value={dealerTwitter}
                    onChange={(e) => setDealerTwitter(e.target.value)}
                    className="w-full bg-[#051020] border border-[#1e293b] rounded-xl p-2.5 text-white placeholder:text-gray-600 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[9px] text-[#38bdf8] uppercase font-mono font-bold tracking-tight">
                ★ Registers showroom instantly in active dealers list
              </span>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl uppercase tracking-widest text-[10px] shadow-lg shadow-orange-950/20 active:scale-95 duration-100"
              >
                Submit Showroom Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 3: Advanced Role Swapping Dashboard */}
      {activeForm === 'role-control' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
              <Shield size={16} className="text-amber-400" /> Multi-Role Privilege Controller Deck
            </h3>
            <p className="text-gray-400 text-[11px]">
              Instantly cycle role access levels to test the fully integrated system, and moderate dealer listings!
            </p>
          </div>

          <div className="bg-[#051020] p-4 rounded-2xl border border-[#1e293b] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">Logged in User:</span>
              <span className="text-sm font-extrabold text-[#38bdf8] block">
                {currentUser?.displayName || 'Guest Tester'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-mono block">Active Privilege Role:</span>
              <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {currentUser?.role || 'Guest'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { role: 'Admin', desc: 'Full System Control & Approval' },
              { role: 'Manager', desc: 'Regional/Showroom Approval Manager' },
              { role: 'SalesRep', desc: 'Assigned Dealer Host' },
              { role: 'PrivateSeller', desc: 'FB Marketplace Seller' },
              { role: 'Buyer', desc: 'Inquire & Submit Offers' }
            ].map((roleObj) => {
              const isActive = currentUser?.role === roleObj.role;
              return (
                <button
                  key={roleObj.role}
                  onClick={() => quickSwitchRole(roleObj.role as any)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'border-[#00a3ff] bg-[#00a3ff]/10 text-white' 
                      : 'border-[#1e293b] bg-[#0c1322] hover:border-gray-700 text-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-[11px] font-mono tracking-tight uppercase block leading-none">
                      {roleObj.role}
                    </span>
                    {isActive && <Check size={12} className="text-[#00a3ff]" />}
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal block mt-1">
                    {roleObj.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="text-[9px] text-white/30 text-center font-mono uppercase tracking-wide">
            ★ Swapping roles updates the local session & Firestore User model in real-time.
          </p>
        </div>
      )}

    </div>
  );
}
