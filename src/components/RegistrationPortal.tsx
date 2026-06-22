import React, { useState } from 'react';
import { 
  UserPlus, 
  Car, 
  Shield, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { UserProfile, dbSaveUserProfile, dbSaveListing } from '../lib/dbService';
import { CarListing, Dealer } from '../types';
import SecureRegistrationPage from './SecureRegistrationPage';
import DetailedVehiclePostingPage, { ComplexListingPayload } from './DetailedVehiclePostingPage';
import { motion } from 'motion/react';

interface RegistrationPortalProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  onDealerRegistered?: (newDealer: Dealer) => void;
  onClose?: () => void;
}

export default function RegistrationPortal({ 
  currentUser, 
  setCurrentUser, 
  onDealerRegistered,
  onClose 
}: RegistrationPortalProps) {
  // Navigation active tab for portal views
  const [activeForm, setActiveForm] = useState<'secure-onboarding' | 'detailed-posting' | 'privilege-simulator'>('secure-onboarding');
  const [portalSuccessMessage, setPortalSuccessMessage] = useState('');

  // Handle high fidelity user profile onboarding
  const handleOnboardingSuccess = async (payload: any) => {
    const updatedProfile: UserProfile = {
      uid: currentUser?.uid || `usr-${Date.now().toString().slice(-6)}`,
      email: payload.email,
      displayName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      phoneVerified: true,
      city: payload.showroomCity || payload.residentialCity || 'Peshawar',
      state: payload.showroomCity ? 'KP' : 'Khyber Pakhtunkhwa',
      role: payload.userRole === 'admin' ? 'Admin' : payload.userRole === 'showroom_admin' ? 'Dealer' : 'Private Seller',
      status: 'Active',
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salesPodId: payload.showroomName ? payload.showroomName.toLowerCase().replace(/\s+/g, '-') : undefined
    };

    try {
      await dbSaveUserProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      setPortalSuccessMessage(`✓ Multi-Role Profile "${updatedProfile.displayName}" onboarded and saved to secure server list.`);
      setTimeout(() => {
        setPortalSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.warn("Database bypass, saving locally to context:", err);
      setCurrentUser(updatedProfile);
    }
  };

  // Convert high-fidelity listing specifications to standardized BAZAR360 listing
  const handleVehiclePostingSuccess = async (payload: ComplexListingPayload) => {
    const rawPriceStr = payload.expectedPrice?.replace(/[^0-9]/g, '') || '5200000';
    const priceNum = parseInt(rawPriceStr, 10);
    const cleanEngineCC = parseInt(payload.engineCapacity.replace(/[^0-9]/g, ''), 10) || 1300;

    let bodyCond: 'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint' = 'Total Genuine';
    if (payload.paintBodyStatus.paintType === 'Touched Panels') {
      bodyCond = 'Minor Touch-ups';
    } else if (payload.paintBodyStatus.paintType === 'Fully Showered') {
      bodyCond = 'Major Repaint';
    }

    let docType: 'Smart Card' | 'Original Book' | 'Duplicate' = 'Smart Card';
    if (payload.physicalDocs === 'Old Original Book') {
      docType = 'Original Book';
    } else if (payload.physicalDocs === 'Duplicate Pages File') {
      docType = 'Duplicate';
    }

    const uniqueListingId = `lst-${Date.now()}`;
    const standardListingIdNormalized: CarListing = {
      id: uniqueListingId,
      title: `${payload.modelYear} ${payload.brand} ${payload.modelName} ${payload.variantName}`,
      make: payload.brand,
      model: payload.modelName,
      year: payload.modelYear,
      price: priceNum,
      mileage: payload.verifiedKmDriven,
      fuelType: payload.engineCapacity.toLowerCase().includes('ev') ? 'Electric' : 'Petrol',
      transmission: 'Automatic',
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      verified: true,
      featured: false,
      dealerId: currentUser?.salesPodId || 'auto-choice-peshawar',
      description: `Compression rating: Engine ${payload.engineCompression}%, Gearbox ${payload.gearboxSmoothness}%, Suspension ${payload.suspensionRigidity}%, Interior Cleanliness ${payload.interiorCleanliness}%. Paint Status: ${payload.paintBodyStatus.paintType}. Physical Venue: ${payload.physicalVenueAddress || 'Auto Choice Hub'}.`,
      createdAt: new Date().toISOString(),
      tags: [payload.brand, payload.modelName, payload.engineCapacity],
      specs: {
        color: payload.exteriorColor,
        engineSize: payload.engineCapacity,
        horspower: 'Standard Spec',
        regionalSpecs: payload.assemblyType === 'Japanese Import' ? 'Imported' : 'Local'
      },
      approved: true,
      region: payload.exciseRegistryCity,
      condition: 'Used',
      engineCC: cleanEngineCC,
      exteriorColor: payload.exteriorColor,
      bodyCondition: bodyCond,
      registrationCity: payload.exciseRegistryCity,
      documentType: docType,
      tokenTaxPaid: payload.tokenTaxStatus === 'Clear Up To Date',
      images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'],
      assemblyType: payload.assemblyType === 'Japanese Import' ? 'Imported' : 'Local',
      dentPaintDescription: payload.paintBodyStatus.accidentLogs || payload.paintBodyStatus.touchedPanels?.join(', '),
      tokenTaxStatus: payload.tokenTaxStatus === 'Clear Up To Date' ? 'Paid' : 'Outstanding'
    };

    try {
      await dbSaveListing(standardListingIdNormalized);
      setPortalSuccessMessage(`✓ Localized Vehicle listing "${standardListingIdNormalized.title}" successfully committed to active database!`);
      setTimeout(() => {
        setPortalSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.warn("Local storage write simulation:", err);
    }
  };

  // Switcher helper
  const quickSwitchRoleSim = async (targetRole: 'Admin' | 'Dealer' | 'Sales Rep' | 'Private Seller' | 'Buyer') => {
    const updatedSimUser: UserProfile = {
      uid: currentUser?.uid || `usr-tester-${Date.now().toString().slice(-4)}`,
      email: currentUser?.email || 'simulation.suite@bazar360.online',
      displayName: currentUser?.displayName || 'Architect Sandbox Controller',
      phoneNumber: currentUser?.phoneNumber || '+92 314 3600000',
      phoneVerified: true,
      city: currentUser?.city || 'Peshawar',
      state: currentUser?.state || 'Khyber Pakhtunkhwa',
      role: targetRole,
      status: 'Active',
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salesPodId: 'auto-choice-peshawar'
    };

    try {
      await dbSaveUserProfile(updatedSimUser);
      setCurrentUser(updatedSimUser);
      setPortalSuccessMessage(`✓ Simulator Swapped Profile Privilege level to "${targetRole}".`);
      setTimeout(() => {
        setPortalSuccessMessage('');
      }, 3000);
    } catch (err) {
      setCurrentUser(updatedSimUser);
    }
  };

  return (
    <div className="bg-[#0b1324] border border-[#1f2937] rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-xs text-white max-w-5xl mx-auto" id="registration-portal-outer-box">
      
      {/* Visual background ambient layers inside portal */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d2ff]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff6b00]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Tab Controller Nav Row */}
      <div className="flex border-b border-[#1f2937] pb-4 mb-6 justify-between items-center flex-wrap gap-4 relative z-10">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveForm('secure-onboarding')}
            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 duration-200 uppercase tracking-wider text-[10.5px] select-none ${
              activeForm === 'secure-onboarding'
                ? 'bg-[#00d2ff] text-slate-950 shadow-lg shadow-[#00d2ff]/20'
                : 'bg-[#070c18] text-gray-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            <UserPlus size={14} />
            Secure Multi-Role Onboarding
          </button>
          
          <button
            onClick={() => setActiveForm('detailed-posting')}
            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 duration-200 uppercase tracking-wider text-[10.5px] select-none ${
              activeForm === 'detailed-posting'
                ? 'bg-[#00d2ff] text-slate-950 shadow-lg shadow-[#00d2ff]/20'
                : 'bg-[#070c18] text-gray-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            <Car size={14} />
            Localized Car Posting Form
          </button>
        </div>

        <button
          onClick={() => setActiveForm('privilege-simulator')}
          className={`px-3 py-2.5 rounded-xl font-bold font-mono flex items-center gap-1.5 duration-200 text-[10px] border border-dashed ${
            activeForm === 'privilege-simulator'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-[#1f2937] text-gray-400 hover:text-white'
          }`}
        >
          <Shield size={12} />
          Privilege Simulator Sandbox
        </button>
      </div>

      {/* Toast Alert Success Display */}
      {portalSuccessMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-4 flex items-center gap-2 font-medium"
        >
          <Check size={14} className="shrink-0" />
          <span>{portalSuccessMessage}</span>
        </motion.div>
      )}

      {/* Pages Container */}
      <div className="relative z-10">
        {activeForm === 'secure-onboarding' && (
          <SecureRegistrationPage 
            onSuccess={handleOnboardingSuccess} 
          />
        )}

        {activeForm === 'detailed-posting' && (
          <DetailedVehiclePostingPage 
            onPostCreated={handleVehiclePostingSuccess} 
          />
        )}

        {activeForm === 'privilege-simulator' && (
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-white font-extrabold text-sm uppercase tracking-tight flex items-center gap-2">
                <Shield size={16} className="text-[#00d2ff]" /> Sandbox Authorization & RBAC Controller
              </h3>
              <p className="text-gray-400 text-xs">
                Quickly adjust your session role context parameters below to swap viewport visibility permissions dynamically across the portal!
              </p>
            </div>

            <div className="bg-[#070c18] p-5 rounded-3xl border border-[#1f2937] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-gray-500 font-mono uppercase block">Active Simulated Client:</span>
                <span className="text-sm font-extrabold text-[#00d2ff] block mt-1">
                  {currentUser?.displayName || 'Guest Sandbox Profile'}
                </span>
                <span className="text-[10px] text-gray-400 font-sans block mt-0.5">{currentUser?.email || 'simulation-pending@bazar360.com'}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-gray-500 font-mono uppercase block">Assigned RBAC Level:</span>
                <span className="inline-block mt-1 px-3 py-1 text-[10px] font-black uppercase font-mono rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {currentUser?.role || 'Guest'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {[
                { role: 'Admin', desc: 'Secure profile access & audit moderation feeds' },
                { role: 'Dealer', desc: 'Dealer tier unlocks Walkthrough video pipeline' },
                { role: 'Sales Rep', desc: 'Assign to active dealership showrooms' },
                { role: 'Private Seller', desc: 'Post ads instantly like FB Marketplace' },
                { role: 'Buyer', desc: 'Securely register offers & book inspections' }
              ].map((roleObj) => {
                const isActive = currentUser?.role === roleObj.role;
                return (
                  <button
                    key={roleObj.role}
                    type="button"
                    onClick={() => quickSwitchRoleSim(roleObj.role as any)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'border-[#00d2ff] bg-[#00d2ff]/10 text-white shadow-lg shadow-[#00d2ff]/10' 
                        : 'border-[#1f2937] bg-[#070c18] hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-[10.5px] font-mono tracking-tight uppercase block leading-none">
                        {roleObj.role}
                      </span>
                      {isActive && <Check size={12} className="text-[#00d2ff]" />}
                    </div>
                    <p className="text-[9.5px] text-gray-500 leading-normal block mt-1.5 font-sans">
                      {roleObj.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="text-center p-3 bg-[#070c18]/40 border border-white/5 rounded-xl flex items-center justify-center gap-1.5">
              <AlertTriangle size={12} className="text-orange-400 shrink-0" />
              <p className="text-[9.5px] text-[#00d2ff] font-mono uppercase tracking-wide">
                ★ SECURE PRIVILEGES INSTANTLY PROPAGATE LOCALLY TO THE CORE FRAMEWORK VIEWPORTS.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
