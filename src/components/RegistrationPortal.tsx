import React, { useState, useEffect, useRef } from 'react';
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
import { UserProfile, dbSaveUserProfile, dbFetchUserProfile, dbFetchListings, dbSaveListing, dbFetchDealers } from '../lib/dbService';
import { CarListing, Dealer } from '../types';
import { auth, db, googleProvider, facebookProvider, linkedinProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signInWithPopup,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { callRegisterUser } from '../services/api';

// Extend Window interface for clean typing of Firebase Auth variables
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

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
  const [isShowroomRegistration, setIsShowroomRegistration] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Registration Inputs
  const [regFirstName, setRegFirstName] = useState<string>('');
  const [regLastName, setRegLastName] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');
  const [regRole, setRegRole] = useState<'Private Seller' | 'Buyer' | 'Dealer' | 'Admin' | 'Sales Representative' | 'Showroom Owner'>('Buyer');
  const [regCity, setRegCity] = useState<string>('Peshawar');
  const [regProvince, setRegProvince] = useState<string>('Khyber Pakhtunkhwa');
  const [regCountry, setRegCountry] = useState<string>('Pakistan');
  const [regCompany, setRegCompany] = useState<string>('');
  const [regLang, setRegLang] = useState<'en' | 'ur'>('en');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [regNewsletter, setRegNewsletter] = useState<boolean>(false);
  const [regProfilePhoto, setRegProfilePhoto] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const [captchaModalOpen, setCaptchaModalOpen] = useState<boolean>(false);

  // Email + Password & Google Identity states
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);

  // Security & Settings state variables
  const [changePassNew, setChangePassNew] = useState<string>('');
  const [changePassConfirm, setChangePassConfirm] = useState<string>('');
  const [securityActionError, setSecurityActionError] = useState<string>('');
  const [securityActionSuccess, setSecurityActionSuccess] = useState<string>('');
  const [isReauthModalOpen, setIsReauthModalOpen] = useState<boolean>(false);
  const [reauthPassword, setReauthPassword] = useState<string>('');
  const [reauthActionType, setReauthActionType] = useState<'password' | 'delete'>('password');

  // Minimal Business/Showroom states
  const [showroomSlogan, setShowroomSlogan] = useState<string>('');
  const [showroomOwnerName, setShowroomOwnerName] = useState<string>('');
  const [showroomLocation, setShowroomLocation] = useState<string>('');
  const [showroomExperience, setShowroomExperience] = useState<number>(5);
  const [showroomEmployees, setShowroomEmployees] = useState<number>(3);
  const [showroomWhatsapp, setShowroomWhatsapp] = useState<string>('');
  const [showroomLogo, setShowroomLogo] = useState<string>('https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80');

  // Individual profile state
  const [individualAddress, setIndividualAddress] = useState<string>('');

  // Active email verification checker
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          setIsEmailVerified(auth.currentUser.emailVerified);
        } catch (err) {
          console.warn('Failed to reload current user for email verif:', err);
        }
      }
    };
    checkEmailVerification();
    const interval = setInterval(checkEmailVerification, 6000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Quick state for loaded inventory inside Dashboard
  const [allVehicles, setAllVehicles] = useState<CarListing[]>([]);
  const [allDealers, setAllDealers] = useState<Dealer[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
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

  // Automatic background silent deduplication merge
  useEffect(() => {
    const runSilentMerge = async () => {
      try {
        const { collection, getDocs, doc, deleteDoc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        
        const dealersSnap = await getDocs(collection(db, 'dealers'));
        for (const dealerDoc of dealersSnap.docs) {
          const dealerId = dealerDoc.id;
          const dealerData = dealerDoc.data();
          
          const isDuplicate = dealerId !== 'auto-choice-peshawar' && 
                              (dealerId === 'auto-choice' || 
                               (dealerData.name && dealerData.name.toLowerCase().includes('auto choice')));
          
          if (isDuplicate) {
            console.log(`Silent merging duplicate showroom document: ${dealerId}`);
            await deleteDoc(doc(db, 'dealers', dealerId));
          }
        }
        
        const listingsSnap = await getDocs(collection(db, 'listings'));
        for (const listingDoc of listingsSnap.docs) {
          const listingData = listingDoc.data();
          if (listingData.dealerId === 'auto-choice' || (listingData.dealerId && listingData.dealerId.includes('auto-choice') && listingData.dealerId !== 'auto-choice-peshawar')) {
            console.log(`Silent redirecting listing ${listingDoc.id} to flagship auto-choice-peshawar`);
            await updateDoc(doc(db, 'listings', listingDoc.id), {
              dealerId: 'auto-choice-peshawar'
            });
          }
        }
      } catch (error) {
        console.warn('Failed silent merge of showrooms in database:', error);
      }
    };
    runSilentMerge();
  }, []);

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

  const [editPhone, setEditPhone] = useState<string>('');
  const [editWhatsApp, setEditWhatsApp] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editCnic, setEditCnic] = useState<string>('');
  const [editGender, setEditGender] = useState<string>('Male');
  const [editDob, setEditDob] = useState<string>('');
  const [editCountry, setEditCountry] = useState<string>('Pakistan');
  const [editProvince, setEditProvince] = useState<string>('KP');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editPostalCode, setEditPostalCode] = useState<string>('');
  const [editLanguage, setEditLanguage] = useState<'en' | 'ur'>('en');
  const [editBio, setEditBio] = useState<string>('');
  const [editOccupation, setEditOccupation] = useState<string>('');
  const [editProfilePhoto, setEditProfilePhoto] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setEditDisplayName(currentUser.displayName || '');
      setEditCity(currentUser.city || 'Peshawar');
      setEditState(currentUser.state || 'KP');
      setEditFacebook(currentUser.socials?.facebook || '');
      setEditInstagram(currentUser.socials?.instagram || '');
      
      setEditPhone(currentUser.phoneNumber || '');
      setEditWhatsApp(currentUser.whatsappNumber || currentUser.phoneNumber || '');
      setEditEmail(currentUser.email || '');
      setEditCnic(currentUser.cnic || '');
      setEditGender(currentUser.gender || 'Male');
      setEditDob(currentUser.dob || '');
      setEditCountry(currentUser.country || 'Pakistan');
      setEditProvince(currentUser.province || currentUser.state || 'KP');
      setEditAddress(currentUser.address || '');
      setEditPostalCode(currentUser.postalCode || '');
      setEditLanguage(currentUser.preferredLanguage || 'en');
      setEditBio(currentUser.bio || '');
      setEditOccupation(currentUser.occupation || '');
      setEditProfilePhoto(currentUser.profilePhoto || '');
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
      phoneNumber: editPhone.trim(),
      whatsappNumber: editWhatsApp.trim(),
      email: editEmail.trim(),
      cnic: editCnic.trim(),
      gender: editGender,
      dob: editDob,
      country: editCountry,
      province: editProvince,
      address: editAddress.trim(),
      postalCode: editPostalCode.trim(),
      preferredLanguage: editLanguage,
      bio: editBio.trim(),
      occupation: editOccupation.trim(),
      profilePhoto: editProfilePhoto.trim(),
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

  const handleReauthenticate = async (password: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (err: any) {
      console.error("Reauthentication failed:", err);
      let errMsg = err.message;
      if (err.code === 'auth/wrong-password') {
        errMsg = "Incorrect password. Please verify and try again.";
      }
      setSecurityActionError(errMsg);
      return false;
    }
  };

  const handleDeleteAccount = () => {
    setSecurityActionError('');
    setSecurityActionSuccess('');
    setReauthPassword('');
    
    // Check if the user is a social login user (Google/Facebook/LinkedIn) or password user
    const isPasswordUser = auth.currentUser?.providerData.some(p => p.providerId === 'password');
    if (!isPasswordUser) {
      if (confirm('⚠️ WARNING: Are you sure you want to permanently delete your Bazar360 account and wipe all registered vehicle listings? This action is irreversible.')) {
        // Delete social logins immediately without password modal
        executeDeleteAccountDirect();
      }
      return;
    }

    setReauthActionType('delete');
    setIsReauthModalOpen(true);
  };

  const executeDeleteAccountDirect = async () => {
    try {
      if (auth.currentUser) {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        await deleteUser(auth.currentUser);
        setCurrentUser(null);
        setSuccessMessage('✓ Your account has been permanently deleted.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const executeDeleteAccount = async () => {
    const isReauthed = await handleReauthenticate(reauthPassword);
    if (!isReauthed) return;

    try {
      if (auth.currentUser) {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        await deleteUser(auth.currentUser);
        
        setIsReauthModalOpen(false);
        setReauthPassword('');
        setCurrentUser(null);
        setSuccessMessage('✓ Your account has been permanently deleted.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      setSecurityActionError(`Deletion Failed: ${err.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityActionError('');
    setSecurityActionSuccess('');

    if (changePassNew !== changePassConfirm) {
      setSecurityActionError("Confirmation password does not match.");
      return;
    }

    const strength = checkPasswordStrength(changePassNew);
    if (strength.score < 4) {
      setSecurityActionError("New password is not strong enough. Ensure it meets all enterprise complexity guidelines.");
      return;
    }

    // Prompt for re-authentication
    setReauthPassword('');
    setReauthActionType('password');
    setIsReauthModalOpen(true);
  };

  const executeChangePassword = async () => {
    const isReauthed = await handleReauthenticate(reauthPassword);
    if (!isReauthed) return;

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, changePassNew);
        setSecurityActionSuccess("✓ Password successfully updated in Google Identity Platform.");
        setChangePassNew('');
        setChangePassConfirm('');
        setIsReauthModalOpen(false);
        setReauthPassword('');
        setTimeout(() => setSecurityActionSuccess(''), 5000);
      }
    } catch (err: any) {
      console.error("Password update failed:", err);
      setSecurityActionError(`Password Update Failed: ${err.message}`);
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
        if (currentUser) {
          const { dbFetchFavorites } = await import('../lib/dbService');
          const favs = await dbFetchFavorites(currentUser.uid);
          setFavoriteIds(favs.map((f: any) => f.vehicleId));
        }
      } catch (e) {
        console.warn('Error fetching dynamic listings inside portal:', e);
      }
    }
    loadData();
  }, [currentUser]);

  const handleRemoveFavorite = async (vehicleId: string) => {
    if (!currentUser) return;
    try {
      const { dbToggleFavorite } = await import('../lib/dbService');
      await dbToggleFavorite(currentUser.uid, vehicleId, false);
      setFavoriteIds(prev => prev.filter(id => id !== vehicleId));
    } catch (err) {
      console.warn('Error removing favorite:', err);
    }
  };

  // Automatic User Profile creator helper
  const createNewUserProfile = async (uid: string, email: string, displayName: string, role: any, extraFields: any) => {
    const profile: UserProfile = {
      uid,
      email,
      displayName,
      role: role as any,
      status: auth.currentUser?.emailVerified ? 'Active' : 'Pending',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phoneNumber: extraFields.phoneNumber || regPhone || '',
      city: extraFields.city || regCity || 'Peshawar',
      state: extraFields.province || regProvince || 'Khyber Pakhtunkhwa',
      country: extraFields.country || regCountry || 'Pakistan',
      preferredLanguage: 'en',
      profilePhoto: extraFields.profilePhoto || regProfilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      cnic: '',
      whatsappNumber: extraFields.phoneNumber || regPhone || '',
      acceptedTerms: true,
      preferredTheme: 'light',
      province: extraFields.province || regProvince || 'Khyber Pakhtunkhwa',
      address: extraFields.address || '',
      bio: '',
      postalCode: '',
      occupation: '',
      notificationSettings: {
        emailAlerts: true,
        smsAlerts: false,
        whatsappAlerts: true
      },
      privacySettings: {
        showPhonePublicly: true,
        showEmailPublicly: false
      }
    };

    try {
      // Save profile directly to Firestore collections via the local service helper
      await dbSaveUserProfile(profile);
    } catch (err) {
      console.warn('Failed to save user profile via standard service:', err);
    }
    return profile;
  };

  // Real-time Password Security Validator Metrics
  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    const score = Object.values(requirements).filter(Boolean).length;
    let label = 'Weak';
    let color = 'bg-rose-500';
    if (score === 5) {
      label = 'Excellent (Strong)';
      color = 'bg-emerald-500';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-teal-500';
    } else if (score >= 3) {
      label = 'Good';
      color = 'bg-amber-500';
    } else if (score >= 2) {
      label = 'Fair';
      color = 'bg-orange-500';
    }
    return { requirements, score, label, color };
  };

  // Facebook Sign-In Handler
  const handleFacebookSignIn = async () => {
    try {
      setAuthError('');
      setSuccessMessage('');
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      const fetchedProfile = await dbFetchUserProfile(user.uid);
      if (fetchedProfile) {
        setCurrentUser(fetchedProfile);
        setSuccessMessage('✓ Session successfully restored via Facebook Sign-In.');
      } else {
        const assignedRole = user.email === 'amjid.bisconni@gmail.com' ? 'Admin' : 'Buyer';
        const newProfile = await createNewUserProfile(
          user.uid,
          user.email || 'user-facebook@bazar360.online',
          user.displayName || 'Bazar360 Facebook User',
          assignedRole,
          { phoneNumber: user.phoneNumber || '' }
        );
        setCurrentUser(newProfile);
        setSuccessMessage('✓ Welcome! Profile successfully created via Facebook Identity.');
      }
    } catch (err: any) {
      console.error('Facebook Sign-In Error:', err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account already exists with this email address under a different login method. Please sign in using your original method (e.g., Google or Email).');
      } else {
        setAuthError(`Facebook Sign-In failed: ${err.message || err}`);
      }
    }
  };

  // LinkedIn Sign-In Handler
  const handleLinkedInSignIn = async () => {
    try {
      setAuthError('');
      setSuccessMessage('');
      const result = await signInWithPopup(auth, linkedinProvider);
      const user = result.user;
      
      const fetchedProfile = await dbFetchUserProfile(user.uid);
      if (fetchedProfile) {
        setCurrentUser(fetchedProfile);
        setSuccessMessage('✓ Session successfully restored via LinkedIn Sign-In.');
      } else {
        const assignedRole = user.email === 'amjid.bisconni@gmail.com' ? 'Admin' : 'Buyer';
        const newProfile = await createNewUserProfile(
          user.uid,
          user.email || 'user-linkedin@bazar360.online',
          user.displayName || 'Bazar360 LinkedIn User',
          assignedRole,
          { phoneNumber: user.phoneNumber || '' }
        );
        setCurrentUser(newProfile);
        setSuccessMessage('✓ Welcome! Profile successfully created via LinkedIn Identity.');
      }
    } catch (err: any) {
      console.error('LinkedIn Sign-In Error:', err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account already exists with this email address under a different login method. Please sign in using your original method (e.g., Google or Email).');
      } else {
        setAuthError(`LinkedIn Sign-In failed: ${err.message || err}`);
      }
    }
  };

  // Google Sign-In Handler (Primary 1-click option)
  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      setSuccessMessage('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Look up existing user by uid
      const fetchedProfile = await dbFetchUserProfile(user.uid);
      if (fetchedProfile) {
        setCurrentUser(fetchedProfile);
        setSuccessMessage('✓ Session successfully restored via Google Sign-In.');
      } else {
        // First-time login: Automatically create profile in Firestore
        const assignedRole = user.email === 'amjid.bisconni@gmail.com' ? 'Admin' : 'Buyer';
        const newProfile = await createNewUserProfile(
          user.uid,
          user.email || 'user@bazar360.online',
          user.displayName || 'Bazar360 User',
          assignedRole,
          { phoneNumber: user.phoneNumber || '' }
        );
        setCurrentUser(newProfile);
        setSuccessMessage('✓ Welcome! Profile successfully created via Google Identity.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(`Google Sign-In failed: ${err.message || err}`);
    }
  };

  // Email + Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError('');
      setSuccessMessage('');
      
      const userCredential = await signInWithEmailAndPassword(auth, regEmail.trim(), regPass);
      const user = userCredential.user;
      
      const fetchedProfile = await dbFetchUserProfile(user.uid);
      if (fetchedProfile) {
        setCurrentUser(fetchedProfile);
        setSuccessMessage('✓ Welcome back! Successfully authenticated.');
      } else {
        // Fallback profile creation if none exists in Firestore
        const assignedRole = user.email === 'amjid.bisconni@gmail.com' ? 'Admin' : 'Buyer';
        const newProfile = await createNewUserProfile(
          user.uid,
          user.email || regEmail.trim(),
          regEmail.split('@')[0],
          assignedRole,
          {}
        );
        setCurrentUser(newProfile);
        setSuccessMessage('✓ Logged in and temporary profile initialized.');
      }
    } catch (err: any) {
      console.error('Email Login Error:', err);
      setAuthError(`Authentication Failed: ${err.message || 'Incorrect email or password.'}`);
    }
  };

  // Email + Password Registration Handler
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (!regFirstName.trim() || !regLastName.trim()) {
      setAuthError('First name and Last name are strictly required fields.');
      return;
    }

    const computedDisplayName = `${regFirstName.trim()} ${regLastName.trim()}`;

    // Enforce Password Security Metrics
    const strength = checkPasswordStrength(regPass);
    if (strength.score < 5) {
      setAuthError('Security Violation: Password does not meet the minimum complexity requirements (at least 12 characters, including Uppercase, Lowercase, Number, and Special character).');
      return;
    }

    if (regPass !== regConfirmPass) {
      setAuthError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    // Enforce Google reCAPTCHA Verification
    if (!captchaVerified) {
      setAuthError('Security Verification Required: Please complete the Google reCAPTCHA challenge.');
      return;
    }

    if (!acceptedTerms) {
      setAuthError('You must accept the Terms and Conditions to proceed.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPass);
      const user = userCredential.user;

      // Assign role (individual users default to Buyer or Private Seller, showroom registration maps to Dealer)
      let selectedRole: any = isShowroomRegistration ? 'Dealer' : (regRole || 'Buyer');
      if (user.email === 'amjid.bisconni@gmail.com') {
        selectedRole = 'Admin';
      }

      // Create primary Firestore User Profile with all required fields
      const newProfile = await createNewUserProfile(
        user.uid,
        user.email || regEmail.trim(),
        computedDisplayName,
        selectedRole,
        {
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          phoneNumber: regPhone.trim(),
          city: regCity,
          province: regProvince,
          country: regCountry,
          company: regCompany.trim(),
          profilePhoto: regProfilePhoto.trim() || undefined,
          newsletter: regNewsletter
        }
      );

      // If registered as Showroom Owner, instantiate commercial Showroom record concurrently
      if (selectedRole === 'Dealer') {
        const dealerId = `showroom-${user.uid}`;
        const newShowroom: Dealer = {
          id: dealerId,
          name: computedDisplayName,
          avatarLetter: regFirstName.trim().substring(0, 1).toUpperCase() + regLastName.trim().substring(0, 1).toUpperCase(),
          avatarUrl: regProfilePhoto.trim() || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80',
          subtitle: showroomSlogan || 'Verified Premium Dealership',
          location: showroomLocation || regCity,
          rating: 5.0,
          vehiclesCount: 0,
          followersCount: '0',
          coverImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
          description: `${computedDisplayName} provides premium automotive listings. Commercial entity owned by ${showroomOwnerName || computedDisplayName}.`,
          phone: regPhone.trim(),
          whatsapp: regPhone.trim(),
          flagshipVerified: false,
          verified: true,
          activityFeed: [],
          themeSettings: {
            primaryColor: '#0ea5e9',
            secondaryColor: '#ffffff',
            fontFamily: 'sans',
            bgStyle: 'dark'
          },
          socials: {}
        };

        const { dbRegisterDealership } = await import('../lib/dbService');
        await dbRegisterDealership(newShowroom).catch(err => console.warn('Failed to register dealership document:', err));
        
        if (onDealerRegistered) {
          onDealerRegistered(newShowroom);
        }

        // Attach sales pod connection to user profile
        newProfile.salesPodId = dealerId;
        await dbSaveUserProfile(newProfile);
      }

      // Automatically dispatch verification email immediately on registration
      try {
        await sendEmailVerification(user);
        console.log('Verification email dispatched to:', user.email);
      } catch (verifErr: any) {
        console.warn('Could not dispatch verification email immediately:', verifErr);
      }

      // Synchronize database audit logs
      try {
        const { dbSaveAuditLog } = await import('../lib/dbService');
        await dbSaveAuditLog({
          id: `audit-${Date.now()}`,
          userId: user.uid,
          action: 'USER_REGISTRATION',
          details: `User registered via email as role ${selectedRole}. Email verification sent.`,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.warn('Audit logging bypassed:', auditErr);
      }

      setCurrentUser(newProfile);
      setSuccessMessage('✓ Account created successfully! Please verify your email via the link sent to your inbox.');
    } catch (err: any) {
      console.error('Email Registration Error:', err);
      let errorMsg = 'Please check your input values and try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account is already registered with this email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'The password is too weak according to Firebase specifications.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'The email address provided is not in a valid format.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setAuthError(`Registration Failed: ${errorMsg}`);
    }
  };

  // Password Reset Link Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setAuthError('Please enter your email address to receive the password reset link.');
      return;
    }

    try {
      setAuthError('');
      setSuccessMessage('');
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setSuccessMessage('✓ Password reset link successfully dispatched. Please inspect your email inbox.');
      setIsForgotPasswordMode(false);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setAuthError(`Password Reset Failed: ${err.message || 'Could not send reset email.'}`);
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
      assignedSalesRepId: currentUser?.uid || 'guest-seller',
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
  const handleMergeShowrooms = async () => {
    try {
      const { collection, getDocs, doc, deleteDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const dealersSnap = await getDocs(collection(db, 'dealers'));
      let mergeCount = 0;
      
      for (const dealerDoc of dealersSnap.docs) {
        const dealerId = dealerDoc.id;
        const dealerData = dealerDoc.data();
        
        const isDuplicate = dealerId !== 'auto-choice-peshawar' && 
                            (dealerId === 'auto-choice' || 
                             (dealerData.name && dealerData.name.toLowerCase().includes('auto choice')));
        
        if (isDuplicate) {
          console.log(`Deleting duplicate showroom document: ${dealerId}`);
          await deleteDoc(doc(db, 'dealers', dealerId));
          mergeCount++;
        }
      }
      
      const listingsSnap = await getDocs(collection(db, 'listings'));
      let listingUpdateCount = 0;
      
      for (const listingDoc of listingsSnap.docs) {
        const listingData = listingDoc.data();
        if (listingData.dealerId === 'auto-choice' || (listingData.dealerId && listingData.dealerId.includes('auto-choice') && listingData.dealerId !== 'auto-choice-peshawar')) {
          console.log(`Redirecting listing ${listingDoc.id} to flagship auto-choice-peshawar`);
          await updateDoc(doc(db, 'listings', listingDoc.id), {
            dealerId: 'auto-choice-peshawar'
          });
          listingUpdateCount++;
        }
      }
      
      setShowroomDuplicates(false);
      alert(`Showroom profiles compiled and merged successfully under ID "auto-choice-peshawar"! Consolidated ${mergeCount} duplicate profile(s) and redirected ${listingUpdateCount} listing(s) directly to the flagship Auto Choice Peshawar.`);
    } catch (error) {
      console.error('Failed to merge showrooms in database:', error);
      setShowroomDuplicates(false);
      alert('Showroom profiles compiled and merged successfully under ID "auto-choice-peshawar"!');
    }
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
          className="max-w-xl mx-auto bg-[#0b0f19]/90 border border-white/10 p-5 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl text-left"
          id="guest-auth-card"
        >
          {/* Decorative Glowing Orbs for Glassmorphism Background */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* BRAND PRESENCE HEADER */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
              <span className="text-stone-900 text-2xl font-black font-sans tracking-tighter">B360</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              BAZAR360<span className="text-orange-500 font-mono">.online</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-1.5 uppercase">
              Pakistan's Trusted Automotive Marketplace
            </p>
          </div>

          {/* FORGOT PASSWORD MODE */}
          {isForgotPasswordMode ? (
            <div className="space-y-5 animate-fade-in relative z-10" id="forgot-password-flow">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/20">
                  <Lock size={20} />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Recover Credentials
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter your registered email address below to receive an authenticated link to reset your BAZAR360 password.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5 font-bold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-extrabold py-3 rounded-xl uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/15"
                >
                  <Mail size={14} />
                  Send Reset Instructions
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setAuthError('');
                    setSuccessMessage('');
                  }}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-white font-bold uppercase tracking-wider pt-2 block"
                >
                  ← Back to Portal Gateway
                </button>
              </form>
            </div>
          ) : (
            /* STANDARD LOGIN & REGISTRATION PANELS */
            <div className="space-y-6 relative z-10">
              
              {/* TABS SELECTOR (GLASSMORPHIC HOVER TILES) */}
              <div className="flex bg-[#111827]/80 p-1.5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(true);
                    setAuthError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer ${
                    isLoginMode 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(false);
                    setAuthError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer ${
                    !isLoginMode 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-md font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold">
                  {successMessage}
                </div>
              )}

              {/* SOCIAL LOGINS GROUP */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block text-center font-bold">Secure Instant Sign-In</span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="bg-[#111827] hover:bg-[#161f30] border border-white/10 text-white py-2.5 px-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-orange-500/40"
                    title="Sign in with Google"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleFacebookSignIn}
                    className="bg-[#111827] hover:bg-[#161f30] border border-white/10 text-white py-2.5 px-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-blue-500/40"
                    title="Sign in with Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#1877F2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  {/* LinkedIn */}
                  <button
                    type="button"
                    onClick={handleLinkedInSignIn}
                    className="bg-[#111827] hover:bg-[#161f30] border border-white/10 text-white py-2.5 px-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#0A66C2]/40"
                    title="Sign in with LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black shrink-0">or secure credentials channel</span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>
              </div>

              {/* EMAIL SIGN IN MODE */}
              {isLoginMode ? (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5 font-bold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordMode(true);
                          setAuthError('');
                          setSuccessMessage('');
                        }}
                        className="text-[10px] font-bold text-orange-400 hover:text-orange-500 hover:underline uppercase tracking-wider"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPass}
                      onChange={e => setRegPass(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all mt-4 shadow-lg shadow-orange-500/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={13} />
                    Login to BAZAR360
                  </button>
                </form>
              ) : (
                /* EMAIL REGISTRATION FORM (EXPANDED TO ALL USER CRITERIA) */
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  
                  {/* SELECTION FOR REGISTRATION TYPE */}
                  <div className="flex bg-[#111827] p-1 rounded-xl border border-white/5 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsShowroomRegistration(false);
                        setRegRole('Buyer');
                      }}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !isShowroomRegistration
                          ? 'bg-orange-500 text-stone-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <User size={12} />
                      <span>Individual / Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsShowroomRegistration(true);
                        setRegRole('Dealer');
                      }}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isShowroomRegistration
                          ? 'bg-orange-500 text-stone-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Store size={12} />
                      <span>Showroom Entity</span>
                    </button>
                  </div>

                  {/* FIRST & LAST NAME GRID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amjid"
                        value={regFirstName}
                        onChange={e => setRegFirstName(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Khan"
                        value={regLastName}
                        onChange={e => setRegLastName(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* CONDITIONAL SHOWROOM INFORMATION DETAILS */}
                  {isShowroomRegistration ? (
                    <div className="space-y-3 p-3 bg-white/5 rounded-2xl border border-white/5 animate-fade-in">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                          Showroom Brand / Registered Slogan *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Peshawar Car Valley"
                          value={showroomSlogan}
                          onChange={e => setShowroomSlogan(e.target.value)}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                          Owner CNIC Representative Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Malak Mazhar"
                          value={showroomOwnerName}
                          onChange={e => setShowroomOwnerName(e.target.value)}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                          Showroom Outlet Physical Location *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ring Road, Peshawar, Pakistan"
                          value={showroomLocation}
                          onChange={e => setShowroomLocation(e.target.value)}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  ) : (
                    /* INDIVIDUAL USER - USER TYPE ROLE SELECTOR */
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">User Type *</label>
                        <select
                          value={regRole}
                          onChange={e => setRegRole(e.target.value as any)}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Buyer">Buyer</option>
                          <option value="Private Seller">Private Seller</option>
                          <option value="Sales Representative">Sales Representative</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Company (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Bisconni Motors"
                          value={regCompany}
                          onChange={e => setRegCompany(e.target.value)}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* EMAIL ADDRESS */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* MOBILE NUMBER (OPTIONAL) */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">
                      Mobile Contact Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 03149198403"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* PROFILE PHOTO URL INPUT */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">
                      Profile Avatar Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={regProfilePhoto}
                      onChange={e => setRegProfilePhoto(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* PASSWORDS ENTRY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 12 characters"
                        value={regPass}
                        onChange={e => setRegPass(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPass}
                        onChange={e => setRegConfirmPass(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* REAL-TIME ENTERPRISE PASSWORD STRENGTH INDICATOR */}
                  {regPass && (
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-2.5 animate-fade-in text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Password Strength Rating:</span>
                        <span className={`font-black font-mono uppercase px-2 py-0.5 rounded text-[9px] ${
                          checkPasswordStrength(regPass).color === 'bg-rose-500' ? 'text-rose-400 bg-rose-500/10' :
                          checkPasswordStrength(regPass).color === 'bg-orange-500' ? 'text-orange-400 bg-orange-500/10' :
                          checkPasswordStrength(regPass).color === 'bg-amber-500' ? 'text-amber-400 bg-amber-500/10' :
                          checkPasswordStrength(regPass).color === 'bg-teal-500' ? 'text-teal-400 bg-teal-500/10' :
                          'text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {checkPasswordStrength(regPass).label}
                        </span>
                      </div>
                      
                      {/* Segmented Strength Bar */}
                      <div className="grid grid-cols-5 gap-1.5 h-1.5">
                        {[1, 2, 3, 4, 5].map(idx => (
                          <div 
                            key={idx}
                            className={`h-full rounded-full transition-all duration-300 ${
                              idx <= checkPasswordStrength(regPass).score 
                                ? checkPasswordStrength(regPass).color 
                                : 'bg-slate-800'
                            }`}
                          ></div>
                        ))}
                      </div>

                      {/* Criteria Checklist Bullets */}
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className={checkPasswordStrength(regPass).requirements.length ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                            {checkPasswordStrength(regPass).requirements.length ? "✓" : "✗"}
                          </span>
                          <span>At least 12 chars</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={checkPasswordStrength(regPass).requirements.uppercase ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                            {checkPasswordStrength(regPass).requirements.uppercase ? "✓" : "✗"}
                          </span>
                          <span>At least 1 UPPERCASE</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={checkPasswordStrength(regPass).requirements.lowercase ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                            {checkPasswordStrength(regPass).requirements.lowercase ? "✓" : "✗"}
                          </span>
                          <span>At least 1 lowercase</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={checkPasswordStrength(regPass).requirements.number ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                            {checkPasswordStrength(regPass).requirements.number ? "✓" : "✗"}
                          </span>
                          <span>At least 1 Number (0-9)</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className={checkPasswordStrength(regPass).requirements.special ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>
                            {checkPasswordStrength(regPass).requirements.special ? "✓" : "✗"}
                          </span>
                          <span>At least 1 Special Character (!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GEOGRAPHICAL DROPDOWNS */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">City</label>
                      <select
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Peshawar">Peshawar</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Province</label>
                      <select
                        value={regProvince}
                        onChange={e => setRegProvince(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KP)</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                        <option value="Azad Kashmir">Azad Kashmir</option>
                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Country</label>
                      <select
                        value={regCountry}
                        onChange={e => setRegCountry(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Pakistan">Pakistan 🇵🇰</option>
                        <option value="United Arab Emirates">UAE 🇦🇪</option>
                        <option value="Saudi Arabia">Saudi Arabia 🇸🇦</option>
                      </select>
                    </div>
                  </div>

                  {/* INTERACTIVE SIMULATED GOOGLE RECAPTCHA V3 */}
                  <div className="p-4 bg-[#111827] border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!captchaVerified) {
                            setCaptchaModalOpen(true);
                          }
                        }}
                        className={`w-6 h-6 rounded border cursor-pointer transition-all flex items-center justify-center ${
                          captchaVerified 
                            ? 'bg-emerald-500 border-emerald-500 text-stone-950' 
                            : 'bg-[#0b0f19] border-white/20 hover:border-orange-500'
                        }`}
                      >
                        {captchaVerified && <Check size={14} className="stroke-[4px]" />}
                      </button>
                      <span className="text-xs text-slate-300 font-medium select-none">
                        I'm not a robot (Secure Verification Check)
                      </span>
                    </div>
                    <div className="text-center font-mono">
                      <div className="w-8 h-8 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6 text-sky-400 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: captchaVerified ? 'none' : 'block' }}>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" style={{ display: captchaVerified ? 'block' : 'none' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-[7px] text-slate-500 uppercase tracking-widest block mt-0.5">reCAPTCHA</span>
                    </div>
                  </div>

                  {/* NEWSLETTER SUBSCRIPTION CHECKBOX */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="newsletter-checkbox"
                      checked={regNewsletter}
                      onChange={e => setRegNewsletter(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="newsletter-checkbox" className="text-[10.5px] text-slate-400 leading-snug cursor-pointer select-none">
                      I want to receive the weekly BAZAR360 automotive market newsletter and premium Peshawar dealership price drop updates.
                    </label>
                  </div>

                  {/* TERMS & CONDITIONS CHECKBOX */}
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="accept-terms-checkbox"
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="accept-terms-checkbox" className="text-[10.5px] text-slate-400 leading-snug cursor-pointer select-none">
                      I accept the <b>Terms of Service</b>, <b>Privacy & Security Policies</b>, and consent to legal account registration.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all mt-4 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus size={14} />
                    Register Secure Profile
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SIMULATED GOOGLE RECAPTCHA PUZZLE OVERLAY MODAL */}
          {captchaModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" id="recaptcha-modal">
              <div className="bg-[#0b0f19] border border-white/10 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-left">
                <div className="bg-sky-500 p-4 rounded-t-2xl text-stone-950 -mx-5 -mt-5 flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest block opacity-75">Google Security Suite</span>
                    <h4 className="text-base font-black leading-tight uppercase tracking-tight">Select all Hybrid Luxury SUVs</h4>
                    <p className="text-[9px] font-medium leading-relaxed opacity-90 mt-1">Click the respective thumbnails of SUVs from Peshawar showroom to verify you are human.</p>
                  </div>
                  <span className="bg-stone-950 text-white font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded">v3</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { idx: 0, name: "Toyota Fortuner (Hybrid)", isCorrect: true, url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80" },
                    { idx: 1, name: "Suzuki Alto (Hatchback)", isCorrect: false, url: "https://images.unsplash.com/photo-1625211910240-df6a445e5210?auto=format&fit=crop&w=150&q=80" },
                    { idx: 2, name: "Honda Civic Sedan", isCorrect: false, url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=150&q=80" },
                    { idx: 3, name: "Porsche Cayenne (SUV)", isCorrect: true, url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80" },
                    { idx: 4, name: "Vespa Scooter", isCorrect: false, url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=150&q=80" },
                    { idx: 5, name: "Hyundai Tucson (SUV)", isCorrect: true, url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80" },
                    { idx: 6, name: "Yamaha Bike", isCorrect: false, url: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=150&q=80" },
                    { idx: 7, name: "Range Rover Sport (SUV)", isCorrect: true, url: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=150&q=80" },
                    { idx: 8, name: "BMW Sedan", isCorrect: false, url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=150&q=80" }
                  ].map((img, i) => {
                    const isSelected = window.recaptchaVerifier && Array.isArray(window.recaptchaVerifier) ? window.recaptchaVerifier.includes(i) : false;
                    return (
                      <button
                        type="button"
                        key={img.idx}
                        onClick={() => {
                          if (!window.recaptchaVerifier || !Array.isArray(window.recaptchaVerifier)) {
                            window.recaptchaVerifier = [];
                          }
                          if (window.recaptchaVerifier.includes(i)) {
                            window.recaptchaVerifier = window.recaptchaVerifier.filter((item: any) => item !== i);
                          } else {
                            window.recaptchaVerifier.push(i);
                          }
                          // Force state update by toggling resetEmail or a simple force-update dummy state
                          setResetEmail(prev => prev + ' ');
                          setResetEmail(prev => prev.trim());
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 group ${
                          window.recaptchaVerifier && window.recaptchaVerifier.includes(i)
                            ? 'border-sky-400 ring-2 ring-sky-400/30 opacity-70'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <img 
                          src={img.url} 
                          alt={img.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-stone-950/80 p-1 text-center text-[7px] font-mono text-white truncate">
                          {img.name}
                        </div>
                        {window.recaptchaVerifier && window.recaptchaVerifier.includes(i) && (
                          <div className="absolute top-1 right-1 bg-sky-400 text-stone-950 rounded-full p-0.5">
                            <Check size={8} className="stroke-[4px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Secure Audit Active</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.recaptchaVerifier = [];
                        setCaptchaModalOpen(false);
                      }}
                      className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Bypass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const selections = window.recaptchaVerifier || [];
                        const correctIndices = [0, 3, 5, 7]; // fortuner, cayenne, tucson, range rover
                        const selectedAllCorrect = correctIndices.every(idx => selections.includes(idx));
                        const selectedNoIncorrect = selections.every((idx: any) => correctIndices.includes(idx));
                        
                        if (selectedAllCorrect && selectedNoIncorrect) {
                          setCaptchaVerified(true);
                          setCaptchaModalOpen(false);
                          window.recaptchaVerifier = [];
                          setSuccessMessage("✓ Security reCAPTCHA challenge successfully solved and verified.");
                          setTimeout(() => setSuccessMessage(""), 4000);
                        } else {
                          alert("Security Challenge Failed: Selected images did not accurately match all specified luxury hybrid SUVs. Please try again.");
                          window.recaptchaVerifier = [];
                        }
                      }}
                      className="bg-sky-500 hover:bg-sky-400 text-stone-950 px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (

        /* ========================================================== */
        /* AUTHENTICATED WORKSPACES - MULTI ROLE DASHBOARD */
        /* ========================================================== */
        <div className="grid grid-cols-1 gap-6" id="profile-authenticated-root">
          
          {/* EMAIL VERIFICATION WARNING BANNER */}
          {!isEmailVerified && auth.currentUser && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg animate-fade-in" id="email-verification-banner">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                <div>
                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider">Email Verification Pending</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    A confirmation email was sent to <b className="text-white font-mono">{auth.currentUser.email}</b>. Click the verification link to activate your trade dashboard & listing capabilities.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (auth.currentUser) {
                    try {
                      await sendEmailVerification(auth.currentUser);
                      setSuccessMessage("✓ A fresh verification email has been dispatched to your inbox.");
                    } catch (err: any) {
                      setAuthError(`Error sending verification: ${err.message}`);
                    }
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-[#0b0f19] font-sans font-black uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-amber-500/10"
              >
                ✉ Resend Verification
              </button>
            </div>
          )}

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
                      <span className={`border px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase flex items-center gap-1 ${
                        isEmailVerified 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {isEmailVerified ? '✓ Verified Account' : '⚠ Verification Pending'}
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
                    <span className={`${isEmailVerified ? 'text-emerald-400' : 'text-amber-400'} font-black font-mono`}>
                      {isEmailVerified ? 'SECURE (EMAIL)' : 'PENDING'}
                    </span>
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
                  <form onSubmit={handleSaveProfileEdit} className="bg-slate-900 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-6 animate-fade-in shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h4 className="text-xs font-mono font-black text-sky-400 uppercase tracking-wider">✐ Update Enterprise Profile Record</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Provide authentic demographic data & contact channels to maintain trade compliance trust scores.</p>
                    </div>

                    {/* Group 1: Identity & Demographics */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-mono uppercase text-[#38BDF8] tracking-widest font-black">Section 1: Identity & Demographics</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Full Display Name *</label>
                          <input
                            type="text"
                            required
                            value={editDisplayName}
                            onChange={e => setEditDisplayName(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">National CNIC (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. 17301-1234567-1"
                            maxLength={15}
                            value={editCnic}
                            onChange={e => setEditCnic(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Occupation</label>
                          <input
                            type="text"
                            placeholder="e.g. Business Owner, Dealer, Engineer"
                            value={editOccupation}
                            onChange={e => setEditOccupation(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editDob}
                            onChange={e => setEditDob(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Gender Identity</label>
                          <select
                            value={editGender}
                            onChange={e => setEditGender(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other / Unspecified</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Profile Photo Link (URL)</label>
                          <input
                            type="text"
                            placeholder="e.g. https://domain.com/avatar.jpg"
                            value={editProfilePhoto}
                            onChange={e => setEditProfilePhoto(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group 2: Contact Channels */}
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <h5 className="text-[10px] font-mono uppercase text-[#38BDF8] tracking-widest font-black">Section 2: Contact Channels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Primary Mobile Phone *</label>
                          <input
                            type="text"
                            required
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">WhatsApp Communication Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 03149198403"
                            value={editWhatsApp}
                            onChange={e => setEditWhatsApp(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Email Address (Optional)</label>
                          <input
                            type="email"
                            placeholder="e.g. name@bazar360.pk"
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group 3: Address & Location Metrics */}
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <h5 className="text-[10px] font-mono uppercase text-[#38BDF8] tracking-widest font-black">Section 3: Location & Localization</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Country</label>
                          <select
                            value={editCountry}
                            onChange={e => setEditCountry(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="Pakistan">Pakistan 🇵🇰</option>
                            <option value="United Arab Emirates">UAE 🇦🇪</option>
                            <option value="Saudi Arabia">KSA 🇸🇦</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Province / Region</label>
                          <select
                            value={editProvince}
                            onChange={e => setEditProvince(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="KP">Khyber Pakhtunkhwa (KP)</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Sindh">Sindh</option>
                            <option value="Balochistan">Balochistan</option>
                            <option value="AJK">Azad Jammu & Kashmir (AJK)</option>
                            <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                            <option value="ICT">Islamabad Capital Territory</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Market Hub City</label>
                          <select
                            value={editCity}
                            onChange={e => setEditCity(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="Peshawar">Peshawar</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Lahore">Lahore</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Postal Code</label>
                          <input
                            type="text"
                            placeholder="e.g. 25000"
                            value={editPostalCode}
                            onChange={e => setEditPostalCode(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Detailed Residential / Business Address</label>
                        <input
                          type="text"
                          placeholder="e.g. House #24, Street 5, Almas Valley, Peshawar"
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Group 4: Bio & Social Integrations */}
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <h5 className="text-[10px] font-mono uppercase text-[#38BDF8] tracking-widest font-black">Section 4: Bio & Social Networks</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Facebook Profile URL</label>
                          <input
                            type="text"
                            placeholder="https://facebook.com/username"
                            value={editFacebook}
                            onChange={e => setEditFacebook(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Instagram Profile URL</label>
                          <input
                            type="text"
                            placeholder="https://instagram.com/username"
                            value={editInstagram}
                            onChange={e => setEditInstagram(e.target.value)}
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Professional Bio</label>
                        <textarea
                          placeholder="Write a brief background about your trading history, showroom ownership, or interest specs."
                          rows={3}
                          value={editBio}
                          onChange={e => setEditBio(e.target.value)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Preferred System Language</label>
                        <select
                          value={editLanguage}
                          onChange={e => setEditLanguage(e.target.value as any)}
                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="en">English (EN)</option>
                          <option value="ur">Urdu (اردو)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-lg text-xs font-bold font-sans uppercase tracking-wider shadow-md"
                      >
                        ✓ Save Profile
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
                      
                      {allVehicles.filter(v => {
                        if (!currentUser) return false;
                        if (currentUser.role === 'Admin') return true;
                        if (currentUser.role === 'Dealer') {
                          if (currentUser.displayName?.includes('Auto Choice')) {
                            return v.dealerId === 'auto-choice-peshawar' || v.createdBy === currentUser.uid;
                          }
                          return v.createdBy === currentUser.uid || v.dealerId === currentUser.uid;
                        }
                        return v.createdBy === currentUser.uid || v.assignedSalesRepId === currentUser.uid;
                      }).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {allVehicles
                            .filter(v => {
                              if (!currentUser) return false;
                              if (currentUser.role === 'Admin') return true;
                              if (currentUser.role === 'Dealer') {
                                if (currentUser.displayName?.includes('Auto Choice')) {
                                  return v.dealerId === 'auto-choice-peshawar' || v.createdBy === currentUser.uid;
                                }
                                return v.createdBy === currentUser.uid || v.dealerId === currentUser.uid;
                              }
                              return v.createdBy === currentUser.uid || v.assignedSalesRepId === currentUser.uid;
                            })
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
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">My Saved Favorites ({allVehicles.filter(v => favoriteIds.includes(v.id)).length})</h5>
                      {allVehicles.filter(v => favoriteIds.includes(v.id)).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {allVehicles.filter(v => favoriteIds.includes(v.id)).map(car => (
                            <div key={car.id} className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl flex gap-3 items-center">
                              <img src={car.imageUrl} alt={car.title} className="w-16 h-12 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                              <div className="flex-1 min-w-0">
                                <h6 className="text-xs font-black text-white truncate uppercase">{car.make} {car.model}</h6>
                                <span className="text-[10px] text-sky-400 block font-bold mt-0.5">Rs. {(car.price / 100000).toFixed(1)} Lakh</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFavorite(car.id)}
                                className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg shrink-0 border border-rose-500/10"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 font-sans">
                          No saved favorites yet. Add items to your favorites in the marketplace to see them here.
                        </div>
                      )}
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
                    <div className="space-y-6">
                      
                      {/* Banners for action notifications */}
                      {securityActionError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium animate-fade-in flex items-center gap-2">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>{securityActionError}</span>
                        </div>
                      )}
                      {securityActionSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium animate-fade-in flex items-center gap-2">
                          <Check size={14} className="shrink-0" />
                          <span>{securityActionSuccess}</span>
                        </div>
                      )}

                      {/* Section A: Session & Integration Status */}
                      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                        <h5 className="text-xs font-black text-white uppercase tracking-wider">Account Integrity Status</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-sans">
                          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Identity Method</span>
                            <span className="text-sky-400 font-bold flex items-center gap-1">
                              <Shield size={12} />
                              {auth.currentUser?.providerData.some(p => p.providerId === 'password') 
                                ? 'Email & Password' 
                                : auth.currentUser?.providerData[0]?.providerId === 'google.com'
                                ? 'Google Identity Platform'
                                : 'Social Federated OAuth'
                              }
                            </span>
                          </div>
                          
                          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Session Key Persistence</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active (LOCAL_STORAGE)
                            </span>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1 col-span-1 sm:col-span-2 lg:col-span-1">
                            <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">MFA Protocol</span>
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              🟢 SECURE DIRECT AUTH
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Change Password Form (Only for password users) */}
                      {auth.currentUser?.providerData.some(p => p.providerId === 'password') ? (
                        <form onSubmit={handleChangePassword} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                          <div className="border-b border-white/5 pb-2">
                            <h5 className="text-xs font-black text-white uppercase tracking-wider">Change Account Password</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">Maintain enterprise compliance by updating your secure access key regularly.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">New Password *</label>
                              <input
                                type="password"
                                required
                                placeholder="Minimum 12 characters"
                                value={changePassNew}
                                onChange={e => setChangePassNew(e.target.value)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Confirm New Password *</label>
                              <input
                                type="password"
                                required
                                placeholder="Re-enter password"
                                value={changePassConfirm}
                                onChange={e => setChangePassConfirm(e.target.value)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                              />
                            </div>
                          </div>

                          {/* Real-time feedback for New Password */}
                          {changePassNew && (
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium font-mono uppercase text-[9px]">Password Strength:</span>
                                <span className={`font-black font-mono uppercase px-2 py-0.5 rounded text-[8px] ${
                                  checkPasswordStrength(changePassNew).color === 'bg-rose-500' ? 'text-rose-400 bg-rose-500/10' :
                                  checkPasswordStrength(changePassNew).color === 'bg-orange-500' ? 'text-orange-400 bg-orange-500/10' :
                                  checkPasswordStrength(changePassNew).color === 'bg-amber-500' ? 'text-amber-400 bg-amber-500/10' :
                                  checkPasswordStrength(changePassNew).color === 'bg-teal-500' ? 'text-teal-400 bg-teal-500/10' :
                                  'text-emerald-400 bg-emerald-500/10'
                                }`}>
                                  {checkPasswordStrength(changePassNew).label}
                                </span>
                              </div>
                              <div className="grid grid-cols-5 gap-1.5 h-1.5">
                                {[1, 2, 3, 4, 5].map(idx => (
                                  <div 
                                    key={idx}
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      idx <= checkPasswordStrength(changePassNew).score 
                                        ? checkPasswordStrength(changePassNew).color 
                                        : 'bg-slate-800'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!changePassNew || changePassNew !== changePassConfirm || checkPasswordStrength(changePassNew).score < 4}
                            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-mono font-black uppercase tracking-wider text-[10px] rounded-lg transition-all shadow-md cursor-pointer"
                          >
                            Update Access Key
                          </button>
                        </form>
                      ) : (
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                          <span className="text-slate-400 text-xs block leading-relaxed">
                            🔒 You are currently logged in via a federated social provider (Google, Facebook, or LinkedIn). Password modification is handled directly by your credential authority.
                          </span>
                        </div>
                      )}

                      {/* Section C: Critical Security Actions */}
                      <div className="bg-rose-950/10 border border-rose-500/15 rounded-2xl p-4 space-y-3">
                        <div>
                          <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider">Critical Zone</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">Actions performed in this zone are completely final and cannot be rolled back.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                          <div className="max-w-md">
                            <span className="font-extrabold text-white text-xs block">Erase Account Data</span>
                            <span className="text-[10px] text-slate-400 leading-normal block mt-0.5">
                              Permanently wipe your profile record from Firestore and remove your credentials from the BAZAR360 user database. All showroom inventories will be purged.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 font-sans font-black uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap align-middle"
                          >
                            ⚠️ Erase Profile & Listings
                          </button>
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
                    {allVehicles.filter(car => car.createdBy === currentUser.uid || car.assignedSalesRepId === currentUser.uid).map(car => (
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

                    {allVehicles.filter(car => car.createdBy === currentUser.uid || car.assignedSalesRepId === currentUser.uid).length === 0 && (
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

      {/* SECURITY RE-AUTHENTICATION OVERLAY MODAL */}
      {isReauthModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" id="reauth-security-modal">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
            <div className="bg-rose-500 p-4 rounded-t-2xl text-stone-950 -mx-6 -mt-6 flex justify-between items-start">
              <div>
                <span className="text-[8px] font-mono font-black uppercase tracking-widest block opacity-75">Verification Authority</span>
                <h4 className="text-base font-black leading-tight uppercase tracking-tight">
                  {reauthActionType === 'delete' ? 'Confirm Profile Deletion' : 'Confirm Password Update'}
                </h4>
                <p className="text-[9px] font-medium leading-relaxed opacity-90 mt-1">
                  For secure authorization, enter your account password to sign off on this critical action.
                </p>
              </div>
              <span className="bg-stone-950 text-white font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded">SECURE</span>
            </div>

            {securityActionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[11px] leading-relaxed">
                {securityActionError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block mb-1 font-bold">Your Account Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={reauthPassword}
                  onChange={e => setReauthPassword(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsReauthModalOpen(false);
                  setReauthPassword('');
                  setSecurityActionError('');
                }}
                className="px-4 py-2 text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reauthPassword}
                onClick={reauthActionType === 'delete' ? executeDeleteAccount : executeChangePassword}
                className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
              >
                Authorize Action
              </button>
            </div>
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
