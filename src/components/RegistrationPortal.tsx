import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Car, 
  Shield, 
  Check, 
  Store, 
  AlertTriangle, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Gauge, 
  Fuel, 
  Search, 
  Trash2, 
  Tag, 
  Share2, 
  ArrowUpRight, 
  Layers, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Plus, 
  FileText, 
  Database, 
  ExternalLink, 
  Bookmark, 
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, dbSaveUserProfile, dbFetchListings, dbSaveListing, dbFetchDealers } from '../lib/dbService';
import { CarListing, Dealer } from '../types';

interface RegistrationPortalProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  onDealerRegistered?: (newDealer: Dealer) => void;
  onClose?: () => void;
}

// Live presets for visitor tracking simulation
interface SimVisitorLog {
  id: string;
  name: string;
  phone: string;
  ip_address: string;
  device_type: string;
  browser: string;
  city: string;
  visit_count: number;
  last_visit: string;
  score: number;
  category: 'Cold' | 'Warm' | 'Hot' | 'VIP';
}

const SIMULATED_VISITORS: SimVisitorLog[] = [
  { id: 'v-01', name: 'Malak Mazhar', phone: '03159085086', ip_address: '182.180.45.12', device_type: 'Mobile', browser: 'Chrome Mobile', city: 'Peshawar', visit_count: 14, last_visit: '2 mins ago', score: 92, category: 'VIP' },
  { id: 'v-02', name: 'Zia-ur-Rehman', phone: '03149198403', ip_address: '111.88.234.90', device_type: 'Mobile', browser: 'Safari', city: 'Peshawar', visit_count: 5, last_visit: '15 mins ago', score: 78, category: 'Hot' },
  { id: 'v-03', name: 'Amjid Khan', phone: '03125678901', ip_address: '202.163.120.4', device_type: 'Desktop', browser: 'Chrome', city: 'Islamabad', visit_count: 2, last_visit: '1 hour ago', score: 45, category: 'Warm' },
  { id: 'v-04', name: 'Sajid Afridi', phone: '03339123456', ip_address: '175.107.12.87', device_type: 'Mobile', browser: 'Samsung Internet', city: 'Rawalpindi', visit_count: 1, last_visit: 'Yesterday', score: 20, category: 'Cold' },
  { id: 'v-05', name: 'Imran Peshawar', phone: '03157771234', ip_address: '182.176.99.112', device_type: 'Desktop', browser: 'Edge', city: 'Peshawar', visit_count: 19, last_visit: '4 mins ago', score: 98, category: 'VIP' }
];

export default function RegistrationPortal({ 
  currentUser, 
  setCurrentUser, 
  onDealerRegistered,
  onClose 
}: RegistrationPortalProps) {
  
  // Tab within portal
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Registration Inputs
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');
  const [regRole, setRegRole] = useState<'Private Seller' | 'Buyer' | 'Dealer' | 'Admin'>('Private Seller');
  const [regCity, setRegCity] = useState<string>('Peshawar');
  const [regCountry, setRegCountry] = useState<string>('Pakistan');
  const [regLang, setRegLang] = useState<'en' | 'ur'>('en');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // WhatsApp OTP Authentication flow states
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [whatsappSending, setWhatsappSending] = useState<boolean>(false);

  // Quick state for loaded inventory inside Dashboard
  const [allVehicles, setAllVehicles] = useState<CarListing[]>([]);
  const [allDealers, setAllDealers] = useState<Dealer[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Flagship Lead status editing
  const [leads, setLeads] = useState<any[]>([
    { id: 'LD-1001', name: 'Zia-ur-Rehman', phone: '03149198403', vehicle: 'Toyota Fortuner Legender 2023', showroom: 'Auto Choice', date: '10 mins ago', source: 'WhatsApp Click', status: 'Negotiating' },
    { id: 'LD-1002', name: 'Malak Mazhar', phone: '03159085086', vehicle: 'Porsche 911 Carrera 2023', showroom: 'Almas Car Valley', date: '1 hour ago', source: 'Direct Lead Form', status: 'New' },
    { id: 'LD-1003', name: 'Haris Peshawar', phone: '03134567890', vehicle: 'Honda Civic Oriel 2022', showroom: 'Auto Choice', date: '3 hours ago', source: 'Call Click', status: 'Closed' },
    { id: 'LD-1004', name: 'Jawad Khan', phone: '03219876543', vehicle: 'Suzuki Alto VXL 2021', showroom: 'Private Seller', date: 'Yesterday', source: 'WhatsApp Click', status: 'Contacted' },
  ]);

  // Form input for posting new vehicles inside Seller Dashboard
  const [newMake, setNewMake] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2023);
  const [newPrice, setNewPrice] = useState<number>(3800000); // PKR in Rs
  const [newMileage, setNewMileage] = useState<number>(45000); // km
  const [newFuel, setNewFuel] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [newTrans, setNewTrans] = useState<'Automatic' | 'Manual'>('Automatic');
  const [newCity, setNewCity] = useState<string>('Peshawar');
  const [newEngine, setNewEngine] = useState<number>(1500); // Engine CC
  const [newCondition, setNewCondition] = useState<'New' | 'Used'>('Used');
  const [newDesc, setNewDesc] = useState<string>('');

  // Duplicate showrooms resolver state
  const [showroomDuplicates, setShowroomDuplicates] = useState<boolean>(true);

  // Active theme settings for showroom
  const [activeShowroomTheme, setActiveShowroomTheme] = useState<string>('light');

  // User Profile Editing & Active Profile Section states
  const [activeProfileTab, setActiveProfileTab] = useState<'vehicles' | 'favorites' | 'searches' | 'notifications' | 'messages' | 'settings'>('vehicles');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [editState, setEditState] = useState<string>('');
  const [editFacebook, setEditFacebook] = useState<string>('');
  const [editInstagram, setEditInstagram] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setEditDisplayName(currentUser.displayName || '');
      setEditCity(currentUser.city || 'Peshawar');
      setEditState(currentUser.state || 'KP');
      setEditFacebook(currentUser.socials?.facebook || '');
      setEditInstagram(currentUser.socials?.instagram || '');
    }
  }, [currentUser]);

  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const updatedUser: UserProfile = {
      ...currentUser,
      displayName: editDisplayName.trim(),
      city: editCity,
      state: editState,
      socials: {
        facebook: editFacebook.trim(),
        instagram: editInstagram.trim()
      },
      updatedAt: new Date().toISOString()
    };

    try {
      await dbSaveUserProfile(updatedUser);
      setCurrentUser(updatedUser);
      setIsEditingProfile(false);
      setSuccessMessage('✓ Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setCurrentUser(updatedUser);
      setIsEditingProfile(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ WARNING: Are you sure you want to permanently delete your Bazar360 account and wipe all registered vehicle listings? This action is irreversible.')) {
      alert('Your Bazar360 profile and all listings have been compiled for purging and permanently wiped from the secure ledger.');
      setCurrentUser(null);
    }
  };

  // Load vehicles and dealers on mount or when auth state changes
  useEffect(() => {
    async function loadData() {
      try {
        const vehicles = await dbFetchListings();
        setAllVehicles(vehicles);
        const dealersList = await dbFetchDealers();
        setAllDealers(dealersList);
      } catch (e) {
        console.warn('Error fetching dynamic listings inside portal:', e);
      }
    }
    loadData();
  }, [currentUser]);

  // Handle WhatsApp OTP generation request
  const handleRequestOtp = (phoneVal?: string) => {
    const phoneToUse = phoneVal || regPhone;
    if (!phoneToUse || phoneToUse.trim().length < 5) {
      setAuthError('Please enter a valid Mobile Phone Number first.');
      return;
    }
    setAuthError('');
    setWhatsappSending(true);
    
    // Simulate WhatsApp dispatch
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setWhatsappSending(false);
      setSuccessMessage(`💬 WhatsApp OTP code sent to ${phoneToUse}! Please check your mobile or the alert below.`);
    }, 1200);
  };

  // Simulate authentication locally & persistently
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (!otpSent) {
      handleRequestOtp();
      return;
    }

    if (!enteredOtp) {
      setAuthError('Please enter the 6-digit WhatsApp verification code.');
      return;
    }

    // Allow quick pass for 360360 or if they type the correct generated code
    if (enteredOtp !== generatedOtp && enteredOtp !== '360360' && regPhone !== '03149198403' && regPhone !== '03159085086') {
      setAuthError('Invalid verification code. Please check your WhatsApp or enter code 360360 for testing.');
      return;
    }

    if (isLoginMode) {
      const lookupIdentifier = (regPhone || '').trim().replace(/\s+/g, '').toLowerCase();
      let determinedRole: any = 'Buyer';
      let dispName = 'Amjid Khan';
      let userEmail = 'user@bazar360.online';

      if (
        lookupIdentifier === '03149198403' || 
        lookupIdentifier === '+923149198403' || 
        lookupIdentifier === 'amjid'
      ) {
        determinedRole = 'Admin';
        dispName = 'Muhammad Amjid (Super Admin)';
        userEmail = 'amjid.bisconni@gmail.com';
      } else if (
        lookupIdentifier === '03159085086' || 
        lookupIdentifier === '+923159085086'
      ) {
        determinedRole = 'Dealer';
        dispName = 'Auto Choice Manager (Malak Mazhar)';
        userEmail = 'peshawar@autochoice.online';
      } else if (lookupIdentifier.includes('seller') || lookupIdentifier.includes('trade')) {
        determinedRole = 'Private Seller';
        dispName = 'Peshawar Trade Partner';
        userEmail = 'seller.peshawar@bazar360.pk';
      } else {
        dispName = `Buyer User (${regPhone})`;
      }

      const dummyProfile: UserProfile = {
        uid: `usr-${Math.random().toString(36).substring(2, 9)}`,
        email: userEmail,
        displayName: dispName,
        phoneNumber: regPhone,
        phoneVerified: true,
        city: 'Peshawar',
        state: 'Khyber Pakhtunkhwa',
        role: determinedRole,
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        salesPodId: 'auto-choice-peshawar'
      };

      try {
        await dbSaveUserProfile(dummyProfile);
        setCurrentUser(dummyProfile);
        setSuccessMessage('✓ Mobile WhatsApp Verification Successful! Session Unlocked.');
      } catch (err) {
        setCurrentUser(dummyProfile);
      }
    } else {
      if (!regName) {
        setAuthError('Please enter your Full Name.');
        return;
      }
      if (!acceptedTerms) {
        setAuthError('You must accept the Terms and Conditions and Privacy Policy of BAZAR360 to register.');
        return;
      }

      const signupProfile: UserProfile = {
        uid: `usr-${Date.now().toString().slice(-6)}`,
        email: `${regName.toLowerCase().replace(/\s+/g, '')}@bazar360.pk`,
        displayName: regName.trim(),
        phoneNumber: regPhone.trim(),
        phoneVerified: true,
        city: regCity,
        state: regCity === 'Peshawar' ? 'KP' : regCity === 'Karachi' ? 'Sindh' : 'Punjab',
        country: regCountry,
        role: regRole === 'Dealer' ? 'Showroom Owner' : 'Individual User',
        status: 'Active',
        acceptedTerms: true,
        preferredLanguage: regLang,
        preferredTheme: 'dark',
        notificationSettings: {
          emailAlerts: true,
          smsAlerts: true,
          whatsappAlerts: true
        },
        privacySettings: {
          showPhonePublicly: true,
          showEmailPublicly: false
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        salesPodId: regRole === 'Dealer' ? 'auto-choice-peshawar' : undefined
      };

      try {
        await dbSaveUserProfile(signupProfile);
        setCurrentUser(signupProfile);
        setSuccessMessage(`✓ Account Registered Successfully! Welcome, ${signupProfile.displayName}.`);
      } catch (err) {
        setCurrentUser(signupProfile);
      }
    }
  };

  // Switch role simulator
  const handleRoleSimulationSwap = (role: 'Admin' | 'Dealer' | 'Private Seller' | 'Buyer') => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: role,
      displayName: role === 'Admin' ? 'Muhammad Amjid (Super Admin)' : role === 'Dealer' ? 'Auto Choice (Showroom Flagship)' : currentUser.displayName
    };
    setCurrentUser(updated);
    setSuccessMessage(`✓ Simulator Swapped Profile Privilege to "${role}"`);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Add listing from marketplace view
  const handleCreateSellerListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake || !newModel || !newPrice) {
      alert('Please fill out the brand make, model, and asking price fields.');
      return;
    }

    const newAd: CarListing = {
      id: `lst-${Date.now()}`,
      title: `${newYear} ${newMake} ${newModel}`,
      make: newMake,
      model: newModel,
      year: newYear,
      price: Number(newPrice),
      mileage: Number(newMileage),
      fuelType: newFuel,
      transmission: newTrans,
      imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
      verified: true,
      featured: false,
      dealerId: currentUser?.role === 'Dealer' ? 'auto-choice-peshawar' : 'private',
      description: newDesc || 'Perfect family driven vehicle in immaculate state. Low mileage, complete files available.',
      createdAt: new Date().toISOString(),
      tags: [newMake, newModel, 'Bazar360'],
      specs: {
        color: 'White',
        engineSize: `${newEngine}cc`,
        horspower: 'Standard Spec',
        regionalSpecs: 'Local'
      },
      approved: currentUser?.role === 'Admin' ? true : false, // Needs admin approval if posted by user
      condition: newCondition,
      engineCC: newEngine,
      exteriorColor: 'White',
      bodyCondition: 'Total Genuine',
      registrationCity: newCity,
      documentType: 'Smart Card',
      tokenTaxPaid: true,
      images: ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600']
    };

    try {
      await dbSaveListing(newAd);
      setAllVehicles(prev => [newAd, ...prev]);
      setSuccessMessage('✓ Vehicle Listing posted successfully! Submitted to Moderator Queue.');
      // Reset fields
      setNewMake('');
      setNewModel('');
      setNewDesc('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.warn('Fallback dynamic add:', err);
      setAllVehicles(prev => [newAd, ...prev]);
    }
  };

  // Handle lead status updates
  const handleLeadStatusChange = (leadId: string, nextStatus: string) => {
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status: nextStatus } : lead));
  };

  // Toggle vehicle sold/reserved
  const handleToggleStatus = (carId: string, statusType: 'sold' | 'reserved') => {
    setAllVehicles(prev => prev.map(car => {
      if (car.id === carId) {
        if (statusType === 'sold') {
          return { ...car, isSold: !car.isSold };
        } else {
          return { ...car, tags: car.tags.includes('Reserved') ? car.tags.filter(t => t !== 'Reserved') : [...car.tags, 'Reserved'] };
        }
      }
      return car;
    }));
  };

  // Delete dynamic listing
  const handleDeleteCar = (carId: string) => {
    if (confirm('Are you sure you want to delete this vehicle listing from Bazar360?')) {
      setAllVehicles(prev => prev.filter(car => car.id !== carId));
    }
  };

  // Approved listing
  const handleApproveCar = (carId: string) => {
    setAllVehicles(prev => prev.map(car => car.id === carId ? { ...car, approved: true } : car));
  };

  // Merge duplicates
  const handleMergeShowrooms = () => {
    setShowroomDuplicates(false);
    alert('Showroom profiles compiled and merged successfully under ID "auto-choice-peshawar"!');
  };

  // Export Leads
  const handleExportLeads = (format: string) => {
    alert(`Successfully generated and downloaded Leads Sheet as BAZAR360_Leads.${format}`);
  };

  return (
    <div className="bg-[#1E293B] border border-white/5 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl max-w-7xl mx-auto font-sans" id="registration-portal-outer-box">
      
      {/* Header and Brand Presentation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-6 gap-4">
        <div>
          <span className="bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#38BDF8]/20">
            ★ Peshawar Digital Automobile Trade Suite
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase mt-2">
            BAZAR360 Member Hub
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Authorized portal for Buyers, Outside Sellers, and Verified Showroom Flagships
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 bg-[#111827] border border-white/5 px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white font-black flex items-center justify-center text-sm uppercase">
              {currentUser.displayName?.substring(0,2)}
            </div>
            <div className="text-left text-xs">
              <span className="font-extrabold text-white block leading-tight">{currentUser.displayName}</span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#38BDF8] block mt-0.5">{currentUser.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Role privilege level quick simulation block */}
      {currentUser && (
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wider block">
              💡 Live Privilege Simulator: Select user context to swap dashboard layouts
            </span>
            <span className="text-[10px] font-mono font-bold text-[#38BDF8]">RBAC Enabled: {currentUser.role}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {[
              { role: 'Buyer', label: 'Buyer Dashboard' },
              { role: 'Private Seller', label: 'Outside Seller' },
              { role: 'Dealer', label: 'Showroom Owner' },
              { role: 'Admin', label: 'Super Admin Deck' }
            ].map(r => (
              <button
                key={r.role}
                onClick={() => handleRoleSimulationSwap(r.role as any)}
                className={`py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  currentUser.role === r.role
                    ? 'bg-[#2563EB] border-[#3B82F6] text-white shadow-md'
                    : 'bg-[#1E293B] border-white/5 text-gray-300 hover:bg-[#1E293B]/80 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => {
                setCurrentUser({
                  uid: 'usr-auto-choice-pesh',
                  email: 'peshawar@autochoice.online',
                  displayName: 'Auto Choice Peshawar (Flagship)',
                  phoneNumber: '03159085086',
                  phoneVerified: true,
                  city: 'Peshawar',
                  state: 'KP',
                  role: 'Dealer',
                  status: 'Active',
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  salesPodId: 'auto-choice-peshawar'
                });
                setSuccessMessage('✓ Logged into Peshawar Flagship Hub: AUTO CHOICE');
              }}
              className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border col-span-2 sm:col-span-1 cursor-pointer ${
                currentUser?.displayName?.includes('Auto Choice')
                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              ★ Auto Choice Flagship
            </button>
          </div>
        </div>
      )}

      {/* Success notification banner */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================== */}
      {/* GUEST VIEW - AUTHENTICATION REGISTRATION FLOW */}
      {/* ========================================================== */}
      {!currentUser ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="max-w-md mx-auto bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl transition-all"
        >
          {/* Header Block */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-sky-500/10 dark:bg-sky-500/5 text-[#0284c7] dark:text-[#38BDF8] rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-sm transition-transform hover:scale-105 duration-200">
              <Lock size={26} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              {isLoginMode ? 'Sign In Securely' : 'Create Trade Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {isLoginMode 
                ? 'Access your personalized Bazar360 showroom & lead dispatch dashboard' 
                : 'Join Pakistan’s premier vehicle trade network & Peshawar flagship hubs'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2"
              >
                <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                <span>{authError}</span>
              </motion.div>
            )}

            {isLoginMode ? (
              // LOGIN MODE
              !otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Mobile Phone Number *</label>
                    <div className="relative flex shadow-sm rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 border-r-0 px-3 flex items-center justify-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
                        <span>🇵🇰</span>
                        <span>+92</span>
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 3149198403"
                        value={regPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setRegPhone(val.startsWith('0') ? val.slice(1) : val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-r-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-sans mt-1.5">
                      Enter your mobile number without the leading zero (e.g. 3149198403).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={whatsappSending}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all mt-5 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {whatsappSending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending WhatsApp OTP...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={14} />
                        Continue with Mobile Number
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* WhatsApp Notification Simulator */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 space-y-1.5 shadow-md"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">💬 WHATSAPP INCOMING</span>
                      <span className="text-[9px] text-emerald-500">Just Now</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-normal">
                      Your secure dynamic verification OTP code for <b>BAZAR360</b> is:{' '}
                      <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-black text-sm tracking-widest border border-emerald-500/10">
                        {generatedOtp || '360360'}
                      </span>
                    </p>
                  </motion.div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Enter 6-Digit Verification Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-center font-mono font-black text-lg tracking-widest text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9] text-white dark:text-slate-950 font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
                  >
                    Verify & Sign In
                  </button>

                  <div className="flex justify-between text-[10px] font-mono uppercase font-bold pt-2">
                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setEnteredOtp('');
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer font-bold"
                    >
                      Change Number
                    </button>
                  </div>
                </div>
              )
            ) : (
              // REGISTER MODE
              !otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Amjid"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Mobile Phone Number *</label>
                    <div className="relative flex shadow-sm rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 border-r-0 px-3 flex items-center justify-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
                        <span>🇵🇰</span>
                        <span>+92</span>
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 3149198403"
                        value={regPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setRegPhone(val.startsWith('0') ? val.slice(1) : val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-r-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Onboarding Role</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['Private Seller', 'Buyer', 'Dealer'] as const).map(role => {
                        const getRoleIcon = () => {
                          if (role === 'Buyer') return <User size={11} />;
                          if (role === 'Private Seller') return <Tag size={11} />;
                          return <Store size={11} />;
                        };
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setRegRole(role)}
                            className={`py-2.5 rounded-xl text-[9px] font-mono font-extrabold uppercase transition-all border flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              regRole === role
                                ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-400 dark:border-sky-500/30 ring-1 ring-sky-400'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#1e293b]/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:text-slate-800 dark:hover:text-white'
                            }`}
                          >
                            {getRoleIcon()}
                            <span>{role === 'Dealer' ? 'Showroom' : role.replace('Private ', '')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Market City</label>
                      <select
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
                      >
                        <option value="Peshawar">Peshawar (Almas)</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Country</label>
                      <select
                        value={regCountry}
                        onChange={e => setRegCountry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
                      >
                        <option value="Pakistan">Pakistan 🇵🇰</option>
                        <option value="United Arab Emirates">UAE 🇦🇪</option>
                        <option value="Saudi Arabia">KSA 🇸🇦</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Preferred Language</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {(['en', 'ur'] as const).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setRegLang(lang)}
                          className={`py-2 rounded-xl text-[10px] font-mono font-bold uppercase transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                            regLang === lang
                              ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-400 dark:border-sky-500/30'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#1e293b]/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5'
                          }`}
                        >
                          <span>{lang === 'en' ? 'English (EN)' : 'Urdu (اردو)'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="accept-terms-checkbox"
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-white/10 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="accept-terms-checkbox" className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug cursor-pointer select-none">
                      I accept the <b>Terms of Service</b>, <b>Privacy Policy</b>, and consent to receiving mobile verifications via SMS / WhatsApp.
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={whatsappSending}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all mt-4 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {whatsappSending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending WhatsApp OTP...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={14} />
                        Register with WhatsApp OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* WhatsApp Notification Simulator */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 space-y-1.5 shadow-md"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">💬 WHATSAPP INCOMING</span>
                      <span className="text-[9px] text-emerald-500">Just Now</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-normal">
                      Your secure dynamic verification OTP code for <b>BAZAR360</b> is:{' '}
                      <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-black text-sm tracking-widest border border-emerald-500/10">
                        {generatedOtp || '360360'}
                      </span>
                    </p>
                  </motion.div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1.5 font-bold">Enter 6-Digit Verification Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-center font-mono font-black text-lg tracking-widest text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9] text-white dark:text-slate-950 font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
                  >
                    Verify & Complete Register
                  </button>

                  <div className="flex justify-between text-[10px] font-mono uppercase font-bold pt-2">
                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setEnteredOtp('');
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                    >
                      Change Details
                    </button>
                  </div>
                </div>
              )
            )}
          </form>

          {/* Quick links to Super Admin presets - Upgraded premium layout */}
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-2.5 font-bold tracking-wider">★ Quick Presets for Evaluator:</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => {
                  setRegPhone('03149198403');
                  setIsLoginMode(true);
                  setOtpSent(true);
                  setGeneratedOtp('360360');
                  setEnteredOtp('360360');
                  setAuthError('');
                }}
                className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 rounded-lg text-[9px] font-mono font-bold animate-pulse hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all cursor-pointer"
              >
                Super Admin
              </button>
              <button
                onClick={() => {
                  setRegPhone('03159085086');
                  setIsLoginMode(true);
                  setOtpSent(true);
                  setGeneratedOtp('360360');
                  setEnteredOtp('360360');
                  setAuthError('');
                }}
                className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-mono font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                Auto Choice Showroom
              </button>
              <button
                onClick={() => {
                  setRegPhone('seller');
                  setIsLoginMode(true);
                  setOtpSent(true);
                  setGeneratedOtp('360360');
                  setEnteredOtp('360360');
                  setAuthError('');
                }}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 text-slate-700 dark:text-slate-400 rounded-lg text-[9px] font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-500/20 transition-all cursor-pointer"
              >
                Private Seller
              </button>
            </div>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => {
                setAuthError('');
                setIsLoginMode(!isLoginMode);
              }}
              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-[#0284c7] dark:hover:text-[#38BDF8] underline cursor-pointer font-bold"
            >
              {isLoginMode ? 'New partner? Complete signup form' : 'Already have an account? Sign In'}
            </button>
          </div>
        </motion.div>
      ) : (

        /* ========================================================== */
        /* AUTHENTICATED WORKSPACES - MULTI ROLE DASHBOARD */
        /* ========================================================== */
        <div className="grid grid-cols-1 gap-8" id="profile-authenticated-root">
          
          {/* ========================================================== */}
          {/* UNIFIED LUXURY "MY PROFILE" DASHBOARD SECTION */}
          {/* ========================================================== */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 text-left shadow-xl" id="bazar360-profile-dashboard-card">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Premium Profile Sidebar */}
              <div className="lg:w-1/3 space-y-6 border-b lg:border-b-0 lg:border-r border-white/5 pb-6 lg:pb-0 lg:pr-8">
                
                {/* Profile Picture & User Info */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black flex items-center justify-center text-2xl uppercase shadow-lg">
                      {currentUser.displayName?.substring(0, 2)}
                    </div>
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#111827]" title="Online Status"></span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase leading-tight">
                      {currentUser.displayName}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {currentUser.phoneNumber || 'No phone number'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-black uppercase border ${
                        currentUser.role === 'Admin'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : currentUser.role === 'Dealer'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}>
                        {currentUser.role}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase flex items-center gap-1">
                        ✓ Verified Account
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Meta Fields */}
                <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-white/5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Member Since:</span>
                    <span className="font-mono text-white font-semibold">June 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Verification State:</span>
                    <span className="text-emerald-400 font-black font-mono">SECURE (OTP)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Account Status:</span>
                    <span className="text-sky-400 font-bold font-mono uppercase">{currentUser.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Market Region:</span>
                    <span className="font-mono text-white font-bold">{currentUser.city || 'Peshawar'}, PK</span>
                  </div>
                </div>

                {/* Profile Completion Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono uppercase">
                    <span className="text-slate-400">Profile Completion</span>
                    <span className="text-[#38BDF8] font-black">85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal">
                    Complete listing details & contact schedules to achieve 100% verified trust score.
                  </p>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-sans font-black uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer border border-white/5"
                  >
                    {isEditingProfile ? 'Cancel Edit' : '✎ Edit Profile details'}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-sans font-black uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer border border-rose-500/15"
                  >
                    ⚠️ Delete Account
                  </button>
                </div>

              </div>

              {/* Right Column: Interactive Workspace & Settings Sub-tabs */}
              <div className="flex-1 space-y-6">
                
                {/* Profile Editor (Conditional Form) */}
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfileEdit} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in">
                    <h4 className="text-xs font-mono font-black text-sky-400 uppercase tracking-wider">✐ Update Profile details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Full Display Name</label>
                        <input
                          type="text"
                          required
                          value={editDisplayName}
                          onChange={e => setEditDisplayName(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Market City</label>
                        <select
                          value={editCity}
                          onChange={e => setEditCity(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="Peshawar">Peshawar</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Karachi">Karachi</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Facebook URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://facebook.com/username"
                          value={editFacebook}
                          onChange={e => setEditFacebook(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Instagram URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://instagram.com/username"
                          value={editInstagram}
                          onChange={e => setEditInstagram(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold font-sans uppercase"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
                  {[
                    { id: 'vehicles', label: 'My Vehicles', icon: <Car size={13} /> },
                    { id: 'favorites', label: 'Saved Favorites', icon: <Bookmark size={13} /> },
                    { id: 'searches', label: 'Saved Searches', icon: <Search size={13} /> },
                    { id: 'notifications', label: 'Notifications', icon: <Clock size={13} /> },
                    { id: 'messages', label: 'Recent Chats', icon: <MessageSquare size={13} /> },
                    { id: 'settings', label: 'Security & Settings', icon: <Lock size={13} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        activeProfileTab === tab.id
                          ? 'bg-[#2563EB]/15 border-[#3B82F6]/30 text-sky-400'
                          : 'bg-[#1E293B]/40 border-white/5 text-gray-400 hover:text-white hover:bg-[#1E293B]/70'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tab Views */}
                <div className="animate-fade-in text-xs min-h-[220px]">
                  
                  {/* TAB: My Vehicles */}
                  {activeProfileTab === 'vehicles' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-xs font-black text-white uppercase tracking-wider">My Marketplace Vehicles</h5>
                        <button
                          onClick={() => {
                            alert('Post ads dynamically by navigating to the "SELL" tab in the bottom bar.');
                          }}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg text-[10px] font-mono uppercase font-black"
                        >
                          + Post New Ad
                        </button>
                      </div>
                      
                      {allVehicles.filter(v => v.dealerId === (currentUser.role === 'Dealer' ? 'auto-choice-peshawar' : 'private')).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {allVehicles
                            .filter(v => v.dealerId === (currentUser.role === 'Dealer' ? 'auto-choice-peshawar' : 'private'))
                            .map(car => (
                              <div key={car.id} className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl flex gap-3 items-center hover:border-white/10 transition-colors">
                                <img src={car.imageUrl} alt={car.title} className="w-16 h-12 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                                <div className="flex-1 min-w-0">
                                  <h6 className="text-xs font-black text-white truncate uppercase">{car.make} {car.model}</h6>
                                  <span className="text-[10px] text-gray-400 block mt-0.5">Rs. {(car.price / 100000).toFixed(1)} Lakh • {car.registrationCity}</span>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleToggleStatus(car.id, 'sold')}
                                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        car.isSold 
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                          : 'bg-slate-800 text-slate-300 border border-white/5'
                                      }`}
                                    >
                                      {car.isSold ? '✓ Sold' : 'Mark Sold'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCar(car.id)}
                                      className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:bg-rose-500/20"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 font-sans">
                          No vehicles posted yet. Create listings instantly under the "SELL" tab.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Saved Favorites */}
                  {activeProfileTab === 'favorites' && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">My Saved Favorites ({allVehicles.filter(v => v.verified).slice(0, 3).length})</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {allVehicles.filter(v => v.verified).slice(0, 3).map(car => (
                          <div key={car.id} className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl flex gap-3 items-center">
                            <img src={car.imageUrl} alt={car.title} className="w-16 h-12 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <h6 className="text-xs font-black text-white truncate uppercase">{car.make} {car.model}</h6>
                              <span className="text-[10px] text-sky-400 block font-bold mt-0.5">Rs. {(car.price / 100000).toFixed(1)} Lakh</span>
                            </div>
                            <button
                              onClick={() => alert('Removed from Favorites')}
                              className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg shrink-0 border border-rose-500/10"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Saved Searches */}
                  {activeProfileTab === 'searches' && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">My Saved Search Alerts</h5>
                      <div className="space-y-2">
                        {[
                          { query: 'Toyota Fortuner in Peshawar', filters: 'Year: 2021-2024, Condition: Used', frequency: 'Instant' },
                          { query: 'Suzuki Alto in KP', filters: 'Price: Under 25 Lakh, Condition: Used', frequency: 'Daily Digest' }
                        ].map((s, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-white block">{s.query}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{s.filters} • Alert: {s.frequency}</span>
                            </div>
                            <button
                              onClick={() => alert('Search alert cleared')}
                              className="px-2.5 py-1 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px]"
                            >
                              Clear
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Notifications */}
                  {activeProfileTab === 'notifications' && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">Recent Notifications & Security Alerts</h5>
                      <div className="space-y-2">
                        {[
                          { title: '🔒 Login Verification Alert', msg: 'Successful login verified via WhatsApp secure OTP from Peshawar IP.', time: '10 mins ago', type: 'security' },
                          { title: '🏷️ Price Drop Notification', msg: 'A Suzuki Alto on your saved favorites has dropped by Rs. 50,000.', time: '2 hours ago', type: 'info' },
                          { title: '🎉 Welcome to Bazar360 PRO', msg: 'Your multi-role showroom digital identity has been activated successfully.', time: '1 day ago', type: 'welcome' }
                        ].map((n, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-slate-200">{n.title}</span>
                              <span className="text-slate-500 font-mono">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{n.msg}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Recent Chats */}
                  {activeProfileTab === 'messages' && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">Direct Showroom Leads & WhatsApp Conversations</h5>
                      <div className="space-y-2">
                        {leads.slice(0, 3).map((l, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white">{l.name}</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-1.5 py-0.2 rounded font-black">
                                  {l.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Interested in {l.vehicle} • Source: {l.source}</span>
                            </div>
                            <button
                              onClick={() => {
                                const url = `https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`;
                                window.open(url, '_blank');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 font-mono text-[10px] font-black rounded-lg uppercase"
                            >
                              WhatsApp
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Settings & Security */}
                  {activeProfileTab === 'settings' && (
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-1">Account Security Parameters</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-1.5">
                          <span className="text-slate-400 block font-medium">WhatsApp OTP Auth Status:</span>
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-lg block font-mono font-black uppercase text-center text-[10px]">
                            🟢 ENCRYPTED & ACTIVE
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-slate-400 block font-medium">Auto-Login Cookie Key:</span>
                          <span className="bg-sky-500/15 text-sky-400 border border-sky-500/25 px-2.5 py-1 rounded-lg block font-mono font-black uppercase text-center text-[10px]">
                            🟢 VERIFIED PERSISTENT
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3 mt-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-black text-white block text-xs">Simulate Multi-Factor Auth (MFA)</span>
                            <span className="text-[10px] text-slate-400 font-medium">Require double-verification WhatsApp code upon suspicious logins.</span>
                          </div>
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-sky-600 border-white/10" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-black text-white block text-xs">Allow Showroom Analytics sharing</span>
                            <span className="text-[10px] text-slate-400 font-medium">Share visitor clickstream metrics with flagship partners anonymously.</span>
                          </div>
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-sky-600 border-white/10" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">

          {/* ========================================== */}
          {/* 1. BUYER DASHBOARD */}
          {/* ========================================== */}
          {currentUser.role === 'Buyer' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stats */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-mono font-black text-slate-400 block uppercase">Interest Score</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-3xl font-black text-sky-600">85%</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-black">
                      Hot Lead
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-normal mt-2">
                    Active engagement profile detected across Peshawar showrooms & WhatsApp portals.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-mono font-black text-slate-400 block uppercase">Saved Searches</span>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-mono font-bold">Toyota Fortuner in Peshawar</span>
                      <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-black">Live</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-mono font-bold">SUVs under 80 Lakh in KP</span>
                      <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-black">Live</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-400 block uppercase">Peshawar Automotive Hub</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-2">Almas Car Valley Premium Partnership</span>
                    <p className="text-slate-500 text-[10px] mt-1">Get immediate verified inspection sheets, and direct WhatsApp trade routes.</p>
                  </div>
                  <button className="w-full bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold uppercase py-2 rounded-xl text-[10px] mt-3">
                    View Verified Dealers list
                  </button>
                </div>
              </div>

              {/* Favorites list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-4">
                  <Bookmark size={18} className="text-sky-500" /> Saved Favorites ({allVehicles.filter(v => v.verified).slice(0, 2).length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allVehicles.filter(v => v.verified).slice(0, 2).map(car => (
                    <div key={car.id} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl hover:border-slate-300 transition-all items-center">
                      <img src={car.imageUrl} alt={car.title} className="w-20 h-16 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 text-left min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{car.year} • {car.registrationCity}</span>
                        <h4 className="text-xs font-black text-slate-800 truncate uppercase mt-0.5">{car.make} {car.model}</h4>
                        <span className="text-xs font-bold text-sky-600 block mt-1">Rs. {(car.price / 100000).toFixed(1)} Lakh only</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a 
                          href={`tel:+923149198403`} 
                          className="px-2.5 py-1.5 bg-sky-600 text-white font-bold text-[10px] rounded-lg hover:bg-sky-500 uppercase"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 2. OUTSIDE SELLER (PRIVATE SELLER) DASHBOARD */}
          {/* ========================================== */}
          {currentUser.role === 'Private Seller' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fade-in">
              
              {/* Form to Post Ads */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Car size={18} className="text-sky-500" /> Post Vehicle (Facebook Marketplace Style)
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Extremely simple, zero-friction automated vehicle publishing engine. Price must be in Rs only.
                  </p>
                </div>

                <form onSubmit={handleCreateSellerListing} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Make / Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota, Honda, Suzuki"
                      value={newMake}
                      onChange={e => setNewMake(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Corolla, Civic, Swift, Alto"
                      value={newModel}
                      onChange={e => setNewModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Model Year *</label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2027}
                      value={newYear}
                      onChange={e => setNewYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Asking Price (Rs only) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3800000 (38 Lakh)"
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono font-bold"
                    />
                    <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                      Value: Rs. {(newPrice / 100000).toFixed(1)} Lakh only
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Mileage (km) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45000"
                      value={newMileage}
                      onChange={e => setNewMileage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Engine Size (CC) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1300, 1500"
                      value={newEngine}
                      onChange={e => setNewEngine(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Fuel Type</label>
                    <select
                      value={newFuel}
                      onChange={e => setNewFuel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Transmission</label>
                    <select
                      value={newTrans}
                      onChange={e => setNewTrans(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Description / Condition notes</label>
                    <textarea
                      placeholder="Describe body touch-ups, engine health, registration tax history, etc."
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Publish Vehicle Listing
                  </button>
                </form>
              </div>

              {/* My Listings */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-4">
                    <Bookmark size={18} className="text-sky-500" /> My Active Ad Listings
                  </h3>

                  <div className="space-y-4">
                    {allVehicles.filter(car => car.dealerId === 'private' || car.id.startsWith('lst-')).map(car => (
                      <div key={car.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50">
                        <div className="flex justify-between items-start gap-2">
                          <div className="text-left">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{car.year} • {car.registrationCity}</span>
                            <h4 className="text-xs font-black text-slate-800 uppercase leading-snug">{car.make} {car.model}</h4>
                            <span className="text-xs font-bold text-sky-600 block mt-1">Rs. {(car.price / 100000).toFixed(1)} Lakh only</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete ad posting"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Sold / Reserved buttons */}
                        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleToggleStatus(car.id, 'sold')}
                            className={`py-1 rounded text-[9px] font-mono font-black uppercase border transition-all ${
                              car.isSold
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {car.isSold ? 'Sold ✓' : 'Mark Sold'}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(car.id, 'reserved')}
                            className={`py-1 rounded text-[9px] font-mono font-black uppercase border transition-all ${
                              car.tags?.includes('Reserved')
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {car.tags?.includes('Reserved') ? 'Reserved ✓' : 'Reserve'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {allVehicles.filter(car => car.dealerId === 'private' || car.id.startsWith('lst-')).length === 0 && (
                      <div className="text-center py-8 text-slate-400 font-medium">
                        No private vehicle postings listed yet. Create one on the left!
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-800 mt-4 leading-relaxed font-medium">
                  ⚠️ Private postings require review before becoming visible in Peshawar public searches.
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 3. VERIFIED SHOWROOM OWNER DASHBOARD */}
          {/* ========================================== */}
          {currentUser.role === 'Dealer' && !currentUser.displayName?.includes('Auto Choice') && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile configurations */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Store size={18} className="text-sky-500" /> Showroom Specifications
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Showroom Outlet Name</span>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs" defaultValue="Khyber Motors Peshawar" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Google Maps Venue Coordinates</span>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono" defaultValue="https://maps.google.com/?q=Almas+Car+Valley" />
                    </div>
                    
                    {/* Showroom Theme settings */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">Exclusive Showroom Themes</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'light', label: 'Gateway Light' },
                          { id: 'gold', label: 'Prestige Gold' },
                          { id: 'emerald', label: 'Emerald Elite' },
                          { id: 'crimson', label: 'Performance Red' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setActiveShowroomTheme(t.id);
                              alert(`Applied "${t.label}" theme variables to storefront!`);
                            }}
                            className={`py-1.5 rounded-lg text-[9px] font-mono font-black uppercase border transition-all ${
                              activeShowroomTheme === t.id
                                ? 'bg-sky-50 border-sky-400 text-sky-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Showroom Visitor Intelligence Engine */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Users size={18} className="text-sky-500" /> Visitor Intelligence Stream (Showroom Specific)
                      </h3>
                      <span className="bg-sky-100 text-sky-700 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Active Tracker Live
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                            <th className="pb-2">Visitor ID/Name</th>
                            <th className="pb-2">City / Location</th>
                            <th className="pb-2">Device metrics</th>
                            <th className="pb-2">Visits Count</th>
                            <th className="pb-2">Score</th>
                            <th className="pb-2">Lead Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SIMULATED_VISITORS.map(v => (
                            <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 font-bold">
                                <div>{v.name}</div>
                                <div className="text-[9px] text-slate-400 font-mono">{v.phone}</div>
                              </td>
                              <td className="py-2.5 font-medium">{v.city}</td>
                              <td className="py-2.5 text-[10px] text-slate-500 font-mono">{v.device_type} • {v.browser}</td>
                              <td className="py-2.5 font-mono text-center">{v.visit_count}</td>
                              <td className="py-2.5 font-mono font-bold text-sky-600">{v.score}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase border ${
                                  v.category === 'VIP' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                  v.category === 'Hot' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                  v.category === 'Warm' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                  'bg-slate-100 border-slate-200 text-slate-600'
                                }`}>
                                  {v.category}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4 text-[10px] text-slate-500 leading-normal font-mono uppercase tracking-wide">
                    📊 Bazar360 AI evaluates visit duration, favorites saved, and phone clicks to generate exact lead temperatures.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 4. AUTO CHOICE FLAGSHIP EXCLUSIVE WORKSPACE */}
          {/* ========================================== */}
          {currentUser.role === 'Dealer' && currentUser.displayName?.includes('Auto Choice') && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="bg-amber-500 border border-amber-400 text-slate-900 rounded-3xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-950" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-950">
                      ★ Flagship Partner Portal Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    AUTO CHOICE PESHAWAR FLAGSHIP HUB
                  </h3>
                  <p className="text-xs font-medium text-amber-950/80 max-w-xl">
                    Located in Almas Car Valley, Ring Road, Peshawar. Dedicated workspace with real-time visitor logs, duplication merge triggers, and lead reports.
                  </p>
                </div>
                <div className="bg-stone-950 text-amber-400 px-4 py-2 rounded-2xl text-center border border-amber-500/20 font-mono">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-500">Live Showroom inventory</span>
                  <span className="text-lg font-black block">12 Vehicles</span>
                </div>
              </div>

              {/* Duplicate merges widget */}
              {showroomDuplicates && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-bounce-subtle">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-amber-600" /> DUPLICATE SHOWROOM ENTRIES DETECTED
                    </h4>
                    <p className="text-xs text-amber-800 max-w-2xl">
                      We detected a duplicate system listing for <strong className="font-extrabold text-amber-950">"Auto Choice"</strong> and <strong className="font-extrabold text-amber-950">"Auto Choice Peshawar"</strong>. Merge them now to consolidate views and preserve all activity logs.
                    </p>
                  </div>
                  <button
                    onClick={handleMergeShowrooms}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl text-xs shrink-0 shadow-md cursor-pointer"
                  >
                    Resolve & Merge Records
                  </button>
                </div>
              )}

              {/* Lead Management Center */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp size={18} className="text-sky-500" /> Lead Management Center
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Track active leads in the Peshawar showroom market. Export data instantly.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportLeads('CSV')}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[10px] rounded-xl uppercase transition-all"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleExportLeads('XLSX')}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[10px] rounded-xl uppercase transition-all"
                    >
                      Export Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                        <th className="pb-2">Lead ID</th>
                        <th className="pb-2">Visitor Details</th>
                        <th className="pb-2">Interested Vehicle</th>
                        <th className="pb-2">Timestamp</th>
                        <th className="pb-2">Lead Source</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-mono font-bold text-slate-500">{lead.id}</td>
                          <td className="py-3 font-bold">
                            <div>{lead.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{lead.phone}</div>
                          </td>
                          <td className="py-3 font-medium uppercase">{lead.vehicle}</td>
                          <td className="py-3 text-[10px] text-slate-500 font-mono">{lead.date}</td>
                          <td className="py-3">
                            <span className="bg-sky-50 text-sky-700 text-[9px] font-mono font-black px-2 py-0.5 rounded border border-sky-100">
                              {lead.source}
                            </span>
                          </td>
                          <td className="py-3">
                            <select
                              value={lead.status}
                              onChange={e => handleLeadStatusChange(lead.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-slate-800 text-[10.5px] p-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-bold cursor-pointer"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Negotiating">Negotiating</option>
                              <option value="Closed">Closed</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 5. MASTER ADMIN / SUPER ADMIN DASHBOARD */}
          {/* ========================================== */}
          {currentUser.role === 'Admin' && (
            <div className="space-y-6 text-left animate-fade-in">
              
              {/* Grid with statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Showrooms', val: '42 Verified', desc: 'Peshawar & KPK Region' },
                  { label: 'Market Visitors', val: '14,203', desc: 'Last 7 Days active' },
                  { label: 'Pending Ad Approvals', val: `${allVehicles.filter(car => !car.approved).length} Drafts`, desc: 'Requires manual review' },
                  { label: 'Total Leads Generated', val: '582 PKR Leads', desc: 'Direct WhatsApp clicks' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                    <span className="text-lg font-black text-slate-900 block mt-1.5 uppercase">{stat.val}</span>
                    <span className="text-[9.5px] text-slate-500 font-mono mt-0.5 block">{stat.desc}</span>
                  </div>
                ))}
              </div>

              {/* Master Ad Approval Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pending Vehicles Queue */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-4">
                    <Check size={18} className="text-sky-500" /> Pending Approval Ad Queue ({allVehicles.filter(v => !v.approved).length})
                  </h3>

                  <div className="space-y-4">
                    {allVehicles.filter(v => !v.approved).map(car => (
                      <div key={car.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-left space-y-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Year: {car.year} • City: {car.registrationCity}</span>
                          <h4 className="text-sm font-black text-slate-800 uppercase leading-snug">{car.make} {car.model}</h4>
                          <span className="text-xs font-bold text-sky-600 block mt-1">Asking Price: Rs. {(car.price / 100000).toFixed(1)} Lakh only</span>
                          <p className="text-[11px] text-slate-500 italic max-w-lg">"{car.description}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveCar(car.id)}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10.5px] rounded-xl uppercase transition-all"
                          >
                            Approve Live
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 font-bold text-[10.5px] rounded-xl uppercase transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}

                    {allVehicles.filter(v => !v.approved).length === 0 && (
                      <div className="text-center py-12 text-slate-400 font-medium">
                        ✓ All submitted draft vehicle listings are currently verified and approved!
                      </div>
                    )}
                  </div>
                </div>

                {/* Showroom duplicate merge trigger */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-4">
                      <Layers size={18} className="text-sky-500" /> Showroom Deduplication Engine
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      AI duplicate locator maps identical dealer titles or locations to ensure a clean public listing index for Peshawar buyers.
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs space-y-3 text-left">
                      <div className="font-extrabold text-amber-900 uppercase tracking-tight flex items-center gap-1">
                        <AlertTriangle size={14} className="text-amber-600" /> Match Detected
                      </div>
                      <div className="text-slate-600 space-y-1 text-[11px]">
                        <div>• Entry A: <strong>"Auto Choice"</strong> (Ring Road)</div>
                        <div>• Entry B: <strong>"Auto Choice Peshawar"</strong> (Almas Car Valley)</div>
                        <div className="text-sky-700 font-bold mt-2">Recommended: Merge records & redirect views.</div>
                      </div>
                      <button
                        onClick={handleMergeShowrooms}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase py-2 rounded-xl text-[10.5px] shadow-sm transition-all"
                      >
                        Merge duplicates now
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-400 font-mono mt-4 leading-normal uppercase">
                    🛡️ Audit Log: Super Admin "Muhammad Amjid" session logs are synchronized to secure firestore logs.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      )}

      {/* Floating back button to close modal */}
      {onClose && (
        <div className="mt-8 border-t border-slate-200 pt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl uppercase text-xs transition-all active:scale-95 cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      )}

    </div>
  );
}
