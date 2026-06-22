import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Building, 
  Smartphone, 
  Mail, 
  Lock, 
  Check, 
  UploadCloud, 
  MapPin, 
  UserPlus, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';

interface SecureRegistrationPageProps {
  onSuccess?: (payload: any) => void;
  onRoleChange?: (role: 'admin' | 'showroom_admin' | 'outside_seller') => void;
}

export default function SecureRegistrationPage({ onSuccess, onRoleChange }: SecureRegistrationPageProps) {
  // Role State Machine
  const [userRole, setUserRole] = useState<'admin' | 'showroom_admin' | 'outside_seller'>('outside_seller');

  // Input states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsAppSync, setWhatsAppSync] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Conditional: Admin
  const [masterToken, setMasterToken] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [clearances, setClearances] = useState<string[]>([]);

  // Conditional: Showroom Admin
  const [showroomName, setShowroomName] = useState('');
  const [showroomAddress, setShowroomAddress] = useState('');
  const [showroomCity, setShowroomCity] = useState('Peshawar');
  const [businessNtn, setBusinessNtn] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Conditional: Outside Seller
  const [cnicNumber, setCnicNumber] = useState('');
  const [residentialCity, setResidentialCity] = useState('');

  // Status & Feedback messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successPayload, setSuccessPayload] = useState<any | null>(null);

  const availableClearances = ['Inventory Auditing', 'Showroom Approval', 'Financial Ledger Lock', 'Customer Grievances'];

  const handleRoleSwitch = (role: 'admin' | 'showroom_admin' | 'outside_seller') => {
    setUserRole(role);
    setErrorMessage('');
    if (onRoleChange) onRoleChange(role);
  };

  const handleClearanceToggle = (clearance: string) => {
    if (clearances.includes(clearance)) {
      setClearances(clearances.filter(c => c !== clearance));
    } else {
      setClearances([...clearances, clearance]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedDocName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocName(e.target.files[0].name);
    }
  };

  const validatePakistanPhone = (num: string) => {
    // Basic verification for Pakistan phone formats
    const clean = num.replace(/[-\s]/g, '');
    const mobileRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    return mobileRegex.test(clean);
  };

  const validateCnic = (cnic: string) => {
    const clean = cnic.replace(/[^0-9]/g, '');
    return clean.length === 13;
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessPayload(null);

    // Common standard validation
    if (!fullName.trim()) {
      setErrorMessage('Full Display Name is required.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Primary Contact Number is required.');
      return;
    }
    if (!validatePakistanPhone(phoneNumber)) {
      setErrorMessage('Please enter a valid Pakistan phone number format (e.g., 03219876543 or +923143600000).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Confirm Password does not match your password.');
      return;
    }

    // Role-specific validation
    let roleData: any = {};
    if (userRole === 'admin') {
      if (!masterToken.trim()) {
        setErrorMessage('Platform Admin Master Access Token is required.');
        return;
      }
      if (!employeeId.trim()) {
        setErrorMessage('Corporate Employee ID is required.');
        return;
      }
      if (clearances.length === 0) {
        setErrorMessage('Please select at least one departmental clearance module.');
        return;
      }
      roleData = { masterToken, employeeId, clearances };
    } else if (userRole === 'showroom_admin') {
      if (!showroomName.trim()) {
        setErrorMessage('Showroom Business Name is required.');
        return;
      }
      if (!showroomAddress.trim()) {
        setErrorMessage('Registered Dealership Physical Address is required.');
        return;
      }
      if (!businessNtn.trim()) {
        setErrorMessage('Business NTN Number is required for tax-filing validation.');
        return;
      }
      if (!uploadedDocName) {
        setErrorMessage('Please upload dynamic verification proof or a business registry PDF.');
        return;
      }
      roleData = { showroomName, showroomAddress, showroomCity, businessNtn, uploadedDocName };
    } else if (userRole === 'outside_seller') {
      if (!cnicNumber.trim()) {
        setErrorMessage('National Identity Card CNIC is required.');
        return;
      }
      if (!validateCnic(cnicNumber)) {
        setErrorMessage('Invalid CNIC format. CNIC must contain exactly 13 numeric digits (e.g., 3740512345671).');
        return;
      }
      if (!residentialCity.trim()) {
        setErrorMessage('Permanent Residential City Location is required.');
        return;
      }
      roleData = { cnicNumber, residentialCity };
    }

    // Success package
    const finalPayload = {
      fullName,
      phoneNumber,
      whatsAppSync,
      email,
      userRole,
      ...roleData,
      timestamp: new Date().toISOString(),
      onboardedSecurely: true
    };

    setSuccessPayload(finalPayload);
    if (onSuccess) onSuccess(finalPayload);
  };

  return (
    <div className="w-full bg-[#070c18] text-white py-4 rounded-3xl" id="secure-registration-wrapper">
      
      {/* Dynamic Security Badge Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#1f2937] pb-6 mb-8 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] font-mono text-[9.5px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2">
            ✦ FEDERATED SECURE AUDITING PROTOCOL
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Security Registration & Onboarding
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Access multi-role authorizations securely. Swapping roles instantly mutates verification requirements.
          </p>
        </div>
        <div className="flex bg-[#0b1324] border border-[#1f2937] rounded-xl p-1 shrink-0" id="role-selector-container">
          <button
            type="button"
            onClick={() => handleRoleSwitch('outside_seller')}
            className={`px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg transition-all ${
              userRole === 'outside_seller'
                ? 'bg-[#00d2ff] text-slate-950 shadow-md shadow-[#00d2ff]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Individual Seller
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('showroom_admin')}
            className={`px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg transition-all ${
              userRole === 'showroom_admin'
                ? 'bg-[#00d2ff] text-slate-950 shadow-md shadow-[#00d2ff]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Showroom Owner
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-lg transition-all ${
              userRole === 'admin'
                ? 'bg-[#ff6b00] text-slate-950 shadow-md shadow-[#ff6b00]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Platform Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Submissions */}
        <div className="lg:col-span-8 bg-[#0b1324] border border-[#1f2937] rounded-3xl p-6 relative overflow-hidden" id="onboarding-form-card">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#00d2ff]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            
            {/* Standard Universal Information Block */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
                <User size={14} /> 1. Standard Identity Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Full Name <span className="text-[#ff6b00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g., Zeyas Al-Peshawari"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#070c18] hover:bg-slate-900 border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-sans focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Primary Contact Number <span className="text-[#ff6b00]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 03219876543 or +923143600000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#070c18] hover:bg-slate-900 border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="whatsapp-sync-cb"
                      checked={whatsAppSync}
                      onChange={(e) => setWhatsAppSync(e.target.checked)}
                      className="rounded border-[#1f2937] text-[#00d2ff] focus:ring-[#00d2ff] bg-[#070c18]"
                    />
                    <label htmlFor="whatsapp-sync-cb" className="text-[9px] text-[#00d2ff] font-mono font-bold uppercase tracking-tight cursor-pointer select-none">
                      Enable Direct WhatsApp Broadcast Sync
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                  Email Address <span className="text-[#ff6b00]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    <Mail size={12} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g., partner@bazar360.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070c18] hover:bg-slate-900 border border-[#1f2937] focus:border-[#00d2ff] rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Password <span className="text-[#ff6b00]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      <Lock size={12} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070c18] hover:bg-slate-900 border border-[#1f2937] focus:border-[#00d2ff] rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                    Confirm Password <span className="text-[#ff6b00]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">
                      <Lock size={12} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#070c18] hover:bg-slate-900 border border-[#1f2937] focus:border-[#00d2ff] rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Switcher Dynamic Content */}
            <div className="pt-2 border-t border-[#1f2937] space-y-4">
              
              {/* ADMIN VIEW */}
              {userRole === 'admin' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-mono font-black uppercase text-[#ff6b00] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
                    <Shield size={14} /> 2. Platform Administrator Safe Lock
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Admin Secret Access Token <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter master cryptographic secret key"
                        value={masterToken}
                        onChange={(e) => setMasterToken(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#ff6b00] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Corporate Employee ID <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., B360-ADMIN-0294"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#ff6b00] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block mb-1">
                      Privilege Clearance Modules <span className="text-[#ff6b00]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {availableClearances.map(clearance => (
                        <div
                          key={clearance}
                          onClick={() => handleClearanceToggle(clearance)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            clearances.includes(clearance)
                              ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-white font-semibold'
                              : 'bg-[#070c18] border-[#1f2937] text-gray-400 hover:border-[#1f2937]/80'
                          }`}
                        >
                          <span className="text-xs">{clearance}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            clearances.includes(clearance)
                              ? 'bg-[#ff6b00] border-[#ff6b00] text-slate-950'
                              : 'border-gray-600'
                          }`}>
                            {clearances.includes(clearance) && <Check size={10} strokeWidth={3} />}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SHOWROOM ADMIN VIEW */}
              {userRole === 'showroom_admin' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
                    <Building size={14} /> 2. Showroom Domain Authorization Matrix
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Showroom Business Name <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Almas Car Valley Peshawar"
                        value={showroomName}
                        onChange={(e) => setShowroomName(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Dealership City Location <span className="text-[#ff6b00]">*</span>
                      </label>
                      <select
                        value={showroomCity}
                        onChange={(e) => setShowroomCity(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                      >
                        <option value="Peshawar">Peshawar (Division Hub)</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Business NTN Number <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., NTN-4029105-2"
                        value={businessNtn}
                        onChange={(e) => setBusinessNtn(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Showroom Physical Address <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Main Ring Road Near Khyber Spot, Peshawar"
                        value={showroomAddress}
                        onChange={(e) => setShowroomAddress(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                      Dealership Authenticity File / NTN Registry Proof <span className="text-[#ff6b00]">*</span>
                    </label>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                        isDragging 
                          ? 'border-[#00d2ff] bg-[#00d2ff]/5' 
                          : uploadedDocName 
                            ? 'border-emerald-500/50 bg-emerald-500/5' 
                            : 'border-[#1f2937] bg-[#070c18] hover:border-[#1f2937]/80'
                      }`}
                    >
                      <input
                        type="file"
                        id="document-file-picker"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                      <label htmlFor="document-file-picker" className="cursor-pointer block w-full">
                        <UploadCloud className={`mx-auto h-8 w-8 mb-2 ${uploadedDocName ? 'text-emerald-400' : 'text-gray-500'}`} />
                        {uploadedDocName ? (
                          <div>
                            <p className="text-xs text-emerald-400 font-extrabold truncate">✓ Doc Added: {uploadedDocName}</p>
                            <p className="text-[9px] text-gray-500 mt-1 uppercase font-mono">Click to replace file</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-white font-bold">Drag and drop file here, or click to browse</p>
                            <p className="text-[9px] text-gray-500 mt-1 uppercase font-mono">SUPPORTS PDF, PNG, JPG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* OUTSIDE SELLER VIEW */}
              {userRole === 'outside_seller' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-mono font-black uppercase text-[#00d2ff] tracking-widest flex items-center gap-2 border-b border-[#1f2937] pb-2">
                    <Briefcase size={14} /> 2. Individual Safe Verification Info
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        CNIC Number (National Identity) <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 3740512345671 (13 digits, no dashes)"
                        value={cnicNumber}
                        maxLength={13}
                        onChange={(e) => setCnicNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-600 font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400">
                        Permanent Residential City Location <span className="text-[#ff6b00]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Peshawar City"
                        value={residentialCity}
                        onChange={(e) => setResidentialCity(e.target.value)}
                        className="w-full bg-[#070c18] border border-[#1f2937] focus:border-[#00d2ff] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Error alerts */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs animate-pulse">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Block */}
            <div className="pt-4 border-t border-[#1f2937]">
              <button
                type="submit"
                className="w-full bg-[#ff6b00] hover:bg-[#ff8533] duration-200 text-slate-950 font-sans font-black tracking-widest text-[11px] uppercase py-3.5 px-6 rounded-xl shadow-lg shadow-orange-950/20 cursor-pointer active:scale-[0.98] select-none"
              >
                Secure Submit & Onboard Credentials
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Status Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0b1324] border border-[#1f2937] rounded-3xl p-5 space-y-4">
            <h4 className="text-[10px] font-mono font-black uppercase text-gray-400 tracking-wider">
              Verification Ledger Status
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Privilege Mode:</span>
                <span className="font-mono text-[10px] font-bold text-white uppercase bg-white/5 py-0.5 px-2 rounded">
                  {userRole}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Identity Checks:</span>
                <span className={`font-mono text-[9px] font-bold tracking-tight uppercase ${fullName ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {fullName ? '✓ Input Completed' : 'Pending Name'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Phone Verified via WhatsApp:</span>
                <span className={`font-mono text-[9px] font-bold tracking-tight uppercase ${whatsAppSync ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {whatsAppSync ? '✓ Enabled Sync' : 'Static Mode'}
                </span>
              </div>
              {userRole === 'showroom_admin' && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Business Registry Doc:</span>
                  <span className={`font-mono text-[9px] font-bold tracking-tight uppercase ${uploadedDocName ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`}>
                    {uploadedDocName ? '✓ Attached' : '✘ Required File'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submited Output Validation View */}
          {successPayload && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 space-y-4"
              id="submission-success-indicator"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-wider">Onboarding Authenticated!</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Your role has been verified in the sandbox. Below is the structured JSON record committed to Auto Choice federated database:
              </p>
              <pre className="bg-[#070c18] p-3 rounded-xl text-[9px] font-mono text-[#00d2ff] overflow-x-auto border border-white/5 max-h-48 leading-relaxed">
                {JSON.stringify(successPayload, null, 2)}
              </pre>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
}
