import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { CarListing, Dealer, Review } from '../types';
import { INITIAL_DEALERS, INITIAL_LISTINGS, INITIAL_REVIEWS } from '../data';

// Standard User Profiles
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  city?: string;
  state?: string;
  role: 'Admin' | 'Showroom Owner' | 'Individual User' | 'Visitor' | 'Sales Rep' | 'Private Seller' | 'Buyer' | 'Dealer' | 'Sales Representative' | 'Super Admin';
  status: 'Active' | 'Pending Approval' | 'Suspended' | 'Pending' | 'Email Verified' | 'Blocked' | 'Deleted';
  socials?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  lastLogin: string;
  updatedAt: string;
  region?: string;    // Compatibility with existing subviews
  salesPodId?: string; // Compatibility with showroom manager bindings

  // Enterprise redesign fields
  profilePhoto?: string;
  gender?: string;
  dob?: string;
  country?: string;
  province?: string;
  address?: string;
  bio?: string;
  acceptedTerms?: boolean;
  preferredLanguage?: 'en' | 'ur';
  preferredTheme?: 'light' | 'dark';
  whatsappNumber?: string;
  cnic?: string;
  postalCode?: string;
  occupation?: string;

  notificationSettings?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    whatsappAlerts?: boolean;
  };
  privacySettings?: {
    showPhonePublicly?: boolean;
    showEmailPublicly?: boolean;
  };
}

const DEALERS_COLLECTION = 'dealers';
const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';

// Seed Database helper
export async function seedDatabaseIfEmpty() {
  try {
    // Check sentinel document to avoid 20+ parallel read queries. This is extremely fast (1 document read)
    // and ensures that if Firestore is ever reset, it auto-re-seeds on the next visit.
    const sentinelRef = doc(db, 'system', 'seeded');
    const sentinelSnap = await getDoc(sentinelRef);
    if (sentinelSnap.exists() && sentinelSnap.data()?.completed === true) {
      console.log('Firestore backend reports database is already fully seeded.');
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('bazar360_db_seeded', 'true'); } catch(e) {}
      }
      return;
    }

    console.log('Sentinel document missing. Synchronizing initial dealers & listings to Firestore in parallel...');
    
    // Concurrently verify and write dealers
    const dealerPromises = INITIAL_DEALERS.map(async (d) => {
      const docRef = doc(db, DEALERS_COLLECTION, d.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: d.id,
          name: d.name,
          avatarLetter: d.avatarLetter,
          avatarUrl: d.avatarUrl || '',
          subtitle: d.subtitle,
          location: d.location,
          rating: d.rating,
          vehiclesCount: d.vehiclesCount,
          followersCount: d.followersCount,
          coverImage: d.coverImage,
          description: d.description,
          phone: d.phone,
          whatsapp: d.whatsapp,
          socials: d.socials || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Concurrently verify and write listings
    const listingPromises = INITIAL_LISTINGS.map(async (l) => {
      const docRef = doc(db, LISTINGS_COLLECTION, l.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...l,
          approved: true, // Default list seeds approved
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Concurrently verify and write reviews
    const reviewPromises: Promise<void>[] = [];
    for (const dId of Object.keys(INITIAL_REVIEWS)) {
      const revs = INITIAL_REVIEWS[dId];
      for (const r of revs) {
        reviewPromises.push((async () => {
          const docRef = doc(db, `${DEALERS_COLLECTION}/${dId}/reviews`, r.id);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, {
              id: r.id,
              author: r.author,
              rating: r.rating,
              comment: r.comment,
              createdAt: new Date().toISOString()
            });
          }
        })());
      }
    }

    // Run ALL checks and writes concurrently
    await Promise.all([...dealerPromises, ...listingPromises, ...reviewPromises]);

    // Set the sentinel document to true
    await setDoc(sentinelRef, { completed: true, timestamp: new Date().toISOString() });

    if (typeof window !== 'undefined') {
      try { localStorage.setItem('bazar360_db_seeded', 'true'); } catch(e) {}
    }
    console.log('BAZAR360 Seeding completed/verified.');
  } catch (err) {
    console.warn('Silent seeding warning:', err);
    throw err; // rethrow so calling routine knows synchronization was bypassed/timed out
  }
}

// 1. Fetch Dealers
export async function dbFetchDealers(): Promise<Dealer[]> {
  try {
    const snap = await getDocs(collection(db, DEALERS_COLLECTION));
    if (snap.empty) {
      return INITIAL_DEALERS.map(d => d.id === 'auto-choice-peshawar' ? { ...d, name: 'Auto Choice', avatarUrl: '/auto_choice_logo_1781509565476.png', flagshipVerified: true } : d);
    }
    
    const list: Dealer[] = [];
    let autoChoiceMerged: Dealer | null = null;

    snap.forEach((doc) => {
      const data = doc.data();
      const rawAvatar = data.avatarUrl || '';
      
      const isAutoChoice = doc.id === 'auto-choice-peshawar' || doc.id === 'auto-choice' || (data.name && data.name.toLowerCase().includes('auto choice'));
      
      const avatarUrl = isAutoChoice
        ? '/auto_choice_logo_1781509565476.png'
        : (rawAvatar.startsWith('.') ? rawAvatar.substring(1) : rawAvatar);

      const currentDealer: Dealer = {
        id: doc.id,
        name: data.name || '',
        avatarLetter: data.avatarLetter || data.name?.substring(0, 2).toUpperCase() || 'D',
        avatarUrl,
        subtitle: data.subtitle || '',
        location: data.location || '',
        rating: typeof data.rating === 'number' ? data.rating : 4.9,
        vehiclesCount: typeof data.vehiclesCount === 'number' ? data.vehiclesCount : 0,
        followersCount: data.followersCount || '0',
        coverImage: data.coverImage || '',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        socials: data.socials || {},
        activityFeed: Array.isArray(data.activityFeed) ? data.activityFeed : (INITIAL_DEALERS.find((d) => d.id === doc.id)?.activityFeed || [])
      };

      if (isAutoChoice) {
        if (!autoChoiceMerged) {
          autoChoiceMerged = {
            ...currentDealer,
            id: 'auto-choice-peshawar',
            name: 'Auto Choice',
            avatarUrl: '/auto_choice_logo_1781509565476.png',
            flagshipVerified: true
          };
        } else {
          // Consolidate the data metrics gracefully
          autoChoiceMerged.vehiclesCount = Math.max(autoChoiceMerged.vehiclesCount, currentDealer.vehiclesCount);
          if (currentDealer.phone) autoChoiceMerged.phone = currentDealer.phone;
          if (currentDealer.whatsapp) autoChoiceMerged.whatsapp = currentDealer.whatsapp;
          if (currentDealer.location && currentDealer.location.includes('Ring Road')) {
            autoChoiceMerged.location = currentDealer.location;
          }
          if (currentDealer.description && currentDealer.description.length > autoChoiceMerged.description.length) {
            autoChoiceMerged.description = currentDealer.description;
          }
          if (currentDealer.activityFeed && currentDealer.activityFeed.length > 0) {
            const existingIds = new Set(autoChoiceMerged.activityFeed.map(act => act.id));
            currentDealer.activityFeed.forEach(act => {
              if (!existingIds.has(act.id)) {
                autoChoiceMerged!.activityFeed.push(act);
              }
            });
          }
        }
      } else {
        list.push(currentDealer);
      }
    });

    // Ensure Auto Choice is at the front of the list and verified
    if (autoChoiceMerged) {
      list.unshift(autoChoiceMerged);
    } else {
      const initialAC = INITIAL_DEALERS.find(d => d.id === 'auto-choice-peshawar');
      if (initialAC) {
        list.unshift({
          ...initialAC,
          name: 'Auto Choice',
          avatarUrl: '/auto_choice_logo_1781509565476.png',
          flagshipVerified: true
        });
      }
    }

    return list;
  } catch (err) {
    console.error('dbFetchDealers Error:', err);
    return INITIAL_DEALERS.map(d => d.id === 'auto-choice-peshawar' ? { ...d, name: 'Auto Choice', avatarUrl: '/auto_choice_logo_1781509565476.png', flagshipVerified: true } : d);
  }
}

// 2. Fetch Listings (all approved, as well as unapproved if requestor has permission)
export async function dbFetchListings(): Promise<CarListing[]> {
  try {
    const snap = await getDocs(collection(db, LISTINGS_COLLECTION));
    if (snap.empty) {
      return INITIAL_LISTINGS;
    }
    const list: CarListing[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        title: data.title || '',
        make: data.make || '',
        model: data.model || '',
        year: Number(data.year) || 2024,
        price: Number(data.price) || 0,
        mileage: Number(data.mileage) || 0,
        fuelType: data.fuelType || 'Petrol',
        transmission: data.transmission || 'Automatic',
        imageUrl: data.imageUrl || '',
        verified: !!data.verified,
        featured: !!data.featured,
        approved: data.approved !== false, // Default true if not explicitly false
        dealerId: (data.dealerId === 'auto-choice' || (data.dealerId && data.dealerId.includes('auto-choice'))) ? 'auto-choice-peshawar' : (data.dealerId || 'private'),
        description: data.description || '',
        createdAt: data.createdAt || new Date().toISOString(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        specs: data.specs || {
          color: data.exteriorColor || 'Standard',
          engineSize: data.engineCC ? `${data.engineCC} CC` : '2000 CC',
          horspower: '150 hp',
          regionalSpecs: data.assemblyType || 'Local'
        },
        
        // Auto Choice strict mapping with defaults
        condition: data.condition || 'Used',
        engineCC: Number(data.engineCC) || 2000,
        exteriorColor: data.exteriorColor || data.specs?.color || 'Standard White',
        bodyCondition: data.bodyCondition || 'Total Genuine',
        registrationCity: data.registrationCity || 'Peshawar',
        documentType: data.documentType || 'Smart Card',
        tokenTaxPaid: data.tokenTaxPaid !== false,
        images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),
        assemblyType: data.assemblyType || 'Local',
        dentPaintDescription: data.dentPaintDescription || '',
        tokenTaxStatus: data.tokenTaxStatus || 'Paid'
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchListings Error:', err);
    return INITIAL_LISTINGS;
  }
}

// 3. Register user profile
export async function dbSaveUserProfile(profile: UserProfile): Promise<void> {
  // Safe-guarding Firestore standard writes
  if (!profile || !profile.uid || profile.uid.startsWith('usr-default')) {
    console.log('Skipping active Firestore save for standard default offline/sandbox user profiles:', profile?.uid);
    return;
  }

  // Double check authorization mismatch to satisfy strict security rules
  if (!auth.currentUser) {
    console.log('No active authenticated session inside Firebase SDK. Postponing profile update for:', profile.uid);
    return;
  }

  if (auth.currentUser.uid !== profile.uid) {
    console.log(`Preventing writing profile payload of UID (${profile.uid}) under authenticated user session of (${auth.currentUser.uid})`);
    return;
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, profile.uid);
    const profileDocRef = doc(db, 'profiles', profile.uid);
    const timeStr = new Date().toISOString();
    
    const payload = {
      ...profile,
      updatedAt: timeStr
    };

    // Save to /users
    await setDoc(userDocRef, payload);

    // Save to /profiles (split-collection personal details)
    await setDoc(profileDocRef, payload);

    console.log('User profile saved successfully to Firestore /users and /profiles:', profile.uid);

    // Save to /auditLogs
    await dbSaveAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: profile.uid,
      userName: profile.displayName || 'System User',
      userRole: profile.role || 'Individual User',
      action: 'PROFILE_UPDATE',
      details: `Profile saved/updated in Firestore collections /users and /profiles.`,
      status: 'SUCCESS',
      timestamp: timeStr
    }).catch(e => console.warn('Audit logging skipped:', e));

  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${USERS_COLLECTION}/${profile.uid}`);
  }
}

// 4. Fetch user profile
export async function dbFetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn(`Could not fetch profile for user ${uid}, returning null`, err);
    return null;
  }
}

// 5. Create Dealership Programmatically
export async function dbRegisterDealership(dealer: Omit<Dealer, 'activityFeed'>): Promise<void> {
  try {
    await setDoc(doc(db, DEALERS_COLLECTION, dealer.id), {
      ...dealer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Showroom saved successfully:', dealer.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${DEALERS_COLLECTION}/${dealer.id}`);
  }
}

// 6. Post advertisement listed by Private Seller or Showroom dealer
export async function dbSaveListing(listing: CarListing): Promise<void> {
  try {
    await setDoc(doc(db, LISTINGS_COLLECTION, listing.id), {
      ...listing,
      createdAt: listing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Listing saved to database:', listing.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${LISTINGS_COLLECTION}/${listing.id}`);
  }
}

// 7. Update Listing Approval status (Admin / Manager action)
export async function dbApproveListing(listingId: string, approved: boolean = true): Promise<void> {
  try {
    const ref = doc(db, LISTINGS_COLLECTION, listingId);
    await updateDoc(ref, {
      approved,
      updatedAt: new Date().toISOString()
    });
    console.log(`Listing ${listingId} approval status updated to:`, approved);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${LISTINGS_COLLECTION}/${listingId}`);
  }
}

// 8. Add Review to subcollection
export async function dbAddReview(dealerId: string, review: Review): Promise<void> {
  try {
    const ref = doc(db, `${DEALERS_COLLECTION}/${dealerId}/reviews`, review.id);
    await setDoc(ref, {
      id: review.id,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString()
    });
    console.log('Review added successfully.');
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${DEALERS_COLLECTION}/${dealerId}/reviews/${review.id}`);
  }
}

// 9. Fetch Dealer Reviews
export async function dbFetchReviews(dealerId: string): Promise<Review[]> {
  try {
    const snap = await getDocs(collection(db, `${DEALERS_COLLECTION}/${dealerId}/reviews`));
    const list: Review[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        author: data.author || 'Anonymous',
        rating: Number(data.rating) || 5,
        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Recent',
        comment: data.comment || ''
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchReviews Error:', err);
    return INITIAL_REVIEWS[dealerId] || [];
  }
}

// 10. Bargains & Leads DB layer
export interface Bargain {
  id: string;
  listingId: string;
  vehicleTitle: string;
  bidAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  dealerId: string;
  status: 'Pending' | 'Approved' | 'Countered' | 'Rejected';
  createdAt: string;
}

export interface Lead {
  id: string;
  type: string;
  title: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  city?: string;
  details?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export async function dbSaveBargain(bargain: Bargain): Promise<void> {
  try {
    await setDoc(doc(db, 'bargains', bargain.id), {
      ...bargain,
      createdAt: bargain.createdAt || new Date().toISOString()
    });
    console.log('Bargain saved:', bargain.id);
  } catch (err) {
    console.warn('Silent bargain save issue:', err);
  }
}

export async function dbFetchBargains(): Promise<Bargain[]> {
  try {
    const snap = await getDocs(collection(db, 'bargains'));
    const list: Bargain[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        listingId: data.listingId || '',
        vehicleTitle: data.vehicleTitle || 'Unknown Vehicle',
        bidAmount: Number(data.bidAmount) || 0,
        buyerName: data.buyerName || 'Anonymous',
        buyerPhone: data.buyerPhone || '',
        buyerEmail: data.buyerEmail || '',
        dealerId: data.dealerId || '',
        status: data.status || 'Pending',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchBargains Error:', err);
    return [];
  }
}

export async function dbSaveLead(lead: Lead): Promise<void> {
  try {
    await setDoc(doc(db, 'leads', lead.id), {
      ...lead,
      createdAt: lead.createdAt || new Date().toISOString()
    });
    console.log('Lead saved:', lead.id);
  } catch (err) {
    console.warn('Silent lead save issue:', err);
  }
}

export async function dbFetchLeads(): Promise<Lead[]> {
  try {
    const snap = await getDocs(collection(db, 'leads'));
    const list: Lead[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        type: data.type || 'General Inquiry',
        title: data.title || 'Inquiry',
        userName: data.userName || 'Anonymous Visitor',
        userPhone: data.userPhone || '',
        userEmail: data.userEmail || '',
        city: data.city || '',
        details: data.details || '',
        metadata: data.metadata || {},
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchLeads Error:', err);
    return [];
  }
}

export async function dbFetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as UserProfile);
    });
    return list;
  } catch (err) {
    console.error('dbFetchAllUsers Error:', err);
    return [];
  }
}

export interface Suggestion {
  id: string;
  user_id: string | null;
  suggestion_text: string;
  submitted_at: string;
}

export async function dbSaveSuggestion(suggestion: Suggestion): Promise<void> {
  try {
    await setDoc(doc(db, 'suggestions', suggestion.id), {
      ...suggestion,
      submitted_at: suggestion.submitted_at || new Date().toISOString()
    });
    console.log('Suggestion saved to Firestore:', suggestion.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `suggestions/${suggestion.id}`);
  }
}

// ==========================================
// 11. Social Interactions: Likes & Comments
// ==========================================
export interface ListingComment {
  id: string;
  listingId: string;
  userName: string;
  userId?: string;
  text: string;
  createdAt: string;
}

export async function dbAddComment(listingId: string, comment: ListingComment): Promise<void> {
  try {
    const ref = doc(db, `listings/${listingId}/comments`, comment.id);
    await setDoc(ref, {
      ...comment,
      createdAt: comment.createdAt || new Date().toISOString()
    });
    console.log('Comment added to listing:', listingId);
  } catch (err) {
    console.warn('Silent comment save fallback:', err);
    // If we're offline, save to local storage fallback
    try {
      const stored = localStorage.getItem(`bazar360_comments_${listingId}`);
      const comments = stored ? JSON.parse(stored) : [];
      comments.push(comment);
      localStorage.setItem(`bazar360_comments_${listingId}`, JSON.stringify(comments));
    } catch (e) {}
  }
}

export async function dbFetchComments(listingId: string): Promise<ListingComment[]> {
  try {
    const snap = await getDocs(collection(db, `listings/${listingId}/comments`));
    const list: ListingComment[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        listingId: listingId,
        userName: data.userName || 'Anonymous',
        userId: data.userId || '',
        text: data.text || '',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    
    // Sort oldest first
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (err) {
    console.warn('Offline comment fetch fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_comments_${listingId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }
}

export async function dbToggleLike(listingId: string, userId: string, isLiking: boolean): Promise<void> {
  try {
    const ref = doc(db, `listings/${listingId}/likes`, userId);
    if (isLiking) {
      await setDoc(ref, {
        userId,
        createdAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(ref);
    }
    console.log(`Like status for listing ${listingId} updated to:`, isLiking);
  } catch (err) {
    console.warn('Silent like save fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_likes_${listingId}`);
      let likes = stored ? JSON.parse(stored) : [];
      if (isLiking) {
        if (!likes.includes(userId)) likes.push(userId);
      } else {
        likes = likes.filter((id: string) => id !== userId);
      }
      localStorage.setItem(`bazar360_likes_${listingId}`, JSON.stringify(likes));
    } catch (e) {}
  }
}

export async function dbFetchLikes(listingId: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, `listings/${listingId}/likes`));
    const list: string[] = [];
    snap.forEach((doc) => {
      list.push(doc.id); // Each doc ID is the userId who liked it
    });
    return list;
  } catch (err) {
    console.warn('Offline like fetch fallback:', err);
    try {
      const stored = localStorage.getItem(`bazar360_likes_${listingId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }
}

// 12. Lead Activity Tracking Engine (BAZAR360 v3.0 PRO)
export interface TrackedLeadAction {
  id: string;
  userName: string;
  userPhone: string;
  userWhatsApp?: string;
  userEmail: string;
  actionType: 'search' | 'vehicle_view' | 'showroom_view' | 'favorite' | 'share' | 'call_click' | 'whatsapp_click' | 'message' | 'session_start';
  details: string; // e.g. "Searched for Toyota Fortuner"
  leadSource: string; // "Web" | "Mobile"
  leadScore: number;
  leadCategory: 'Cold' | 'Warm' | 'Hot' | 'VIP';
  visitorCategory: 'Guest' | 'Registered User' | 'Dealer' | 'Admin';
  timeOnSite?: number; // seconds
  sessionHistory?: string[];
  createdAt: string;
}

export async function dbTrackLeadAction(action: Omit<TrackedLeadAction, 'id' | 'createdAt'>): Promise<void> {
  try {
    const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullAction: TrackedLeadAction = {
      ...action,
      id: actionId,
      createdAt: new Date().toISOString()
    };
    
    // Save details to lead_actions subcollection or general actions
    await setDoc(doc(db, 'lead_actions', actionId), fullAction);
    
    // Also update/aggregate a consolidated user profile under the "leads" collection
    const leadId = action.userPhone ? `lead-${action.userPhone}` : `lead-${action.userEmail.replace(/[@.]/g, '-')}`;
    const leadRef = doc(db, 'leads', leadId);
    
    const leadDoc = await getDoc(leadRef);
    let previousScore = 0;
    let previousHistory: string[] = [];
    
    if (leadDoc.exists()) {
      const data = leadDoc.data();
      previousScore = Number(data.leadScore) || 0;
      previousHistory = Array.isArray(data.sessionHistory) ? data.sessionHistory : [];
    }
    
    const newScore = previousScore + action.leadScore;
    const updatedHistory = [...previousHistory, `${action.actionType}: ${action.details}`].slice(-30); // Keep last 30 events
    
    // Determine categories
    let leadCategory: 'Cold' | 'Warm' | 'Hot' | 'VIP' = 'Cold';
    if (newScore > 250) leadCategory = 'VIP';
    else if (newScore > 120) leadCategory = 'Hot';
    else if (newScore > 50) leadCategory = 'Warm';
    
    await setDoc(leadRef, {
      id: leadId,
      userName: action.userName || 'Anonymous',
      userPhone: action.userPhone || '',
      userWhatsApp: action.userWhatsApp || action.userPhone || '',
      userEmail: action.userEmail || '',
      searchHistory: action.actionType === 'search' ? updatedHistory : previousHistory,
      leadSource: action.leadSource || 'Web',
      leadScore: newScore,
      leadCategory,
      visitorCategory: action.visitorCategory || 'Guest',
      timeOnSite: (Number(leadDoc.data()?.timeOnSite) || 0) + (action.timeOnSite || 15), // increment time
      sessionHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
      createdAt: leadDoc.data()?.createdAt || new Date().toISOString()
    }, { merge: true });
    
    console.log(`Lead Activity logged successfully to Firebase. Score updated: ${newScore}`);
  } catch (err) {
    console.warn('Silent lead action save fallback (local storage):', err);
    // LocalStorage fallback so the app continues operating perfectly offline
    try {
      const cached = localStorage.getItem('bazar360_offline_actions');
      const list = cached ? JSON.parse(cached) : [];
      list.push({ ...action, id: `offline-${Date.now()}`, createdAt: new Date().toISOString() });
      localStorage.setItem('bazar360_offline_actions', JSON.stringify(list));
    } catch (e) {}
  }
}

export async function dbFetchLeadActions(): Promise<TrackedLeadAction[]> {
  try {
    const snap = await getDocs(collection(db, 'lead_actions'));
    const list: TrackedLeadAction[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        userName: data.userName || '',
        userPhone: data.userPhone || '',
        userWhatsApp: data.userWhatsApp || '',
        userEmail: data.userEmail || '',
        actionType: data.actionType || 'session_start',
        details: data.details || '',
        leadSource: data.leadSource || 'Web',
        leadScore: Number(data.leadScore) || 0,
        leadCategory: data.leadCategory || 'Cold',
        visitorCategory: data.visitorCategory || 'Guest',
        timeOnSite: data.timeOnSite || 0,
        sessionHistory: data.sessionHistory || [],
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Offline lead actions fetch issue:', err);
    return [];
  }
}

// ==========================================================
// 13. REDESIGNED ENTERPRISE DATABASE LAYER (ALL 26 COLLECTIONS)
// ==========================================================

export async function dbSaveShowroom(showroom: any): Promise<void> {
  try {
    const ref = doc(db, 'showrooms', showroom.id);
    await setDoc(ref, {
      ...showroom,
      updatedAt: new Date().toISOString(),
      activeFlag: showroom.activeFlag !== false,
      status: showroom.status || 'Active'
    });
    console.log('Showroom saved to /showrooms:', showroom.id);
  } catch (err) {
    console.warn('Showroom save bypassed:', err);
  }
}

export async function dbFetchShowrooms(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'showrooms'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    console.warn('Showrooms fetch bypassed:', err);
    return [];
  }
}

export async function dbSaveShowroomStaff(staff: any): Promise<void> {
  try {
    const ref = doc(db, 'showroomStaff', staff.id);
    await setDoc(ref, {
      ...staff,
      updatedAt: new Date().toISOString(),
      activeFlag: staff.activeFlag !== false,
      status: staff.status || 'Active'
    });
  } catch (err) {
    console.warn('Showroom staff save bypassed:', err);
  }
}

export async function dbFetchShowroomStaff(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'showroomStaff'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveVehicle(vehicle: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicles', vehicle.id);
    await setDoc(ref, {
      ...vehicle,
      updatedAt: new Date().toISOString(),
      activeFlag: vehicle.activeFlag !== false,
      status: vehicle.status || 'Approved'
    });
    console.log('Vehicle saved to /vehicles:', vehicle.id);
  } catch (err) {
    console.warn('Vehicle save bypassed:', err);
  }
}

export async function dbFetchVehicles(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveVehicleImage(img: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicleImages', img.id);
    await setDoc(ref, {
      ...img,
      createdAt: img.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('vehicleImages save bypassed:', err);
  }
}

export async function dbSaveVehicleVideo(vid: any): Promise<void> {
  try {
    const ref = doc(db, 'vehicleVideos', vid.id);
    await setDoc(ref, {
      ...vid,
      createdAt: vid.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('vehicleVideos save bypassed:', err);
  }
}

export async function dbToggleFavorite(userId: string, vehicleId: string, isFav: boolean): Promise<void> {
  try {
    const favId = `fav-${userId}-${vehicleId}`;
    const ref = doc(db, 'favorites', favId);
    if (isFav) {
      await setDoc(ref, {
        id: favId,
        userId,
        vehicleId,
        activeFlag: true,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('Favorites write bypassed:', err);
  }
}

export async function dbFetchFavorites(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveMessage(msg: any): Promise<void> {
  try {
    const ref = doc(db, 'messages', msg.id);
    await setDoc(ref, {
      ...msg,
      timestamp: msg.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Delivered'
    });
  } catch (err) {
    console.warn('message save bypassed:', err);
  }
}

export async function dbFetchMessages(chatId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveChat(chat: any): Promise<void> {
  try {
    const ref = doc(db, 'chats', chat.id);
    await setDoc(ref, {
      ...chat,
      lastMessageAt: chat.lastMessageAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('chat save bypassed:', err);
  }
}

export async function dbFetchChats(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'chats'), where('participantIds', 'array-contains', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveNotification(notification: any): Promise<void> {
  try {
    const ref = doc(db, 'notifications', notification.id);
    await setDoc(ref, {
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('notification save bypassed:', err);
  }
}

export async function dbFetchNotifications(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSearchHistory(search: any): Promise<void> {
  try {
    const ref = doc(db, 'searchHistory', search.id);
    await setDoc(ref, {
      ...search,
      createdAt: search.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('searchHistory save bypassed:', err);
  }
}

export async function dbFetchSearchHistory(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'searchHistory'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveRecentView(view: any): Promise<void> {
  try {
    const ref = doc(db, 'recentViews', view.id);
    await setDoc(ref, {
      ...view,
      viewedAt: view.viewedAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('recentViews save bypassed:', err);
  }
}

export async function dbFetchRecentViews(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'recentViews'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveReview(review: any): Promise<void> {
  try {
    const ref = doc(db, 'reviews', review.id);
    await setDoc(ref, {
      ...review,
      createdAt: review.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: 'Approved'
    });
  } catch (err) {
    console.warn('review save bypassed:', err);
  }
}

export async function dbSaveRating(rating: any): Promise<void> {
  try {
    const ref = doc(db, 'ratings', rating.id);
    await setDoc(ref, {
      ...rating,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('rating save bypassed:', err);
  }
}

export async function dbFetchRatings(targetId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'ratings'), where('targetId', '==', targetId));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSupportTicket(ticket: any): Promise<void> {
  try {
    const ref = doc(db, 'supportTickets', ticket.id);
    await setDoc(ref, {
      ...ticket,
      updatedAt: new Date().toISOString(),
      activeFlag: ticket.activeFlag !== false,
      status: ticket.status || 'Open'
    });
  } catch (err) {
    console.warn('supportTickets save bypassed:', err);
  }
}

export async function dbFetchSupportTickets(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'supportTickets'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSavePayment(payment: any): Promise<void> {
  try {
    const ref = doc(db, 'payments', payment.id);
    await setDoc(ref, {
      ...payment,
      createdAt: payment.createdAt || new Date().toISOString(),
      activeFlag: true,
      status: payment.status || 'Completed'
    });
  } catch (err) {
    console.warn('payment save bypassed:', err);
  }
}

export async function dbFetchPayments(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSubscription(sub: any): Promise<void> {
  try {
    const ref = doc(db, 'subscriptions', sub.id);
    await setDoc(ref, {
      ...sub,
      createdAt: sub.createdAt || new Date().toISOString(),
      activeFlag: sub.activeFlag !== false,
      status: sub.status || 'Active'
    });
  } catch (err) {
    console.warn('subscription save bypassed:', err);
  }
}

export async function dbFetchSubscriptions(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAdvertisement(ad: any): Promise<void> {
  try {
    const ref = doc(db, 'advertisements', ad.id);
    await setDoc(ref, {
      ...ad,
      createdAt: ad.createdAt || new Date().toISOString(),
      activeFlag: ad.activeFlag !== false,
      status: ad.status || 'Active'
    });
  } catch (err) {
    console.warn('advertisement save bypassed:', err);
  }
}

export async function dbFetchAdvertisements(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'advertisements'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAnalytics(evt: any): Promise<void> {
  try {
    const ref = doc(db, 'analytics', evt.id);
    await setDoc(ref, {
      ...evt,
      timestamp: evt.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('analytics save bypassed:', err);
  }
}

export async function dbFetchAnalytics(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'analytics'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSetting(setting: any): Promise<void> {
  try {
    const ref = doc(db, 'settings', setting.id);
    await setDoc(ref, {
      ...setting,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('settings save bypassed:', err);
  }
}

export async function dbFetchSettings(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveAuditLog(log: any): Promise<void> {
  try {
    const ref = doc(db, 'auditLogs', log.id);
    await setDoc(ref, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Logged'
    });
  } catch (err) {
    console.warn('auditLogs save bypassed:', err);
  }
}

export async function dbFetchAuditLogs(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    return [];
  }
}

export async function dbSaveSeo(seo: any): Promise<void> {
  try {
    const ref = doc(db, 'seo', seo.id);
    await setDoc(ref, {
      ...seo,
      updatedAt: new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('seo save bypassed:', err);
  }
}

export async function dbFetchSeo(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'seo'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

export async function dbSaveSystemLog(log: any): Promise<void> {
  try {
    const ref = doc(db, 'systemLogs', log.id);
    await setDoc(ref, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
      activeFlag: true,
      status: 'Active'
    });
  } catch (err) {
    console.warn('systemLogs save bypassed:', err);
  }
}

export async function dbFetchSystemLogs(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'systemLogs'));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    return [];
  }
}

