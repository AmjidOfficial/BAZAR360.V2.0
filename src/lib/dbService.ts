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
  role: 'Admin' | 'Showroom Owner' | 'Sales Rep' | 'Private Seller' | 'Buyer' | 'Dealer';
  status: 'Active' | 'Pending Approval' | 'Suspended';
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
}

const DEALERS_COLLECTION = 'dealers';
const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';

// Seed Database helper
export async function seedDatabaseIfEmpty() {
  if (typeof window !== 'undefined' && localStorage.getItem('bazar360_db_seeded') === 'true') {
    console.log('BAZAR360 database already seeded on this client. Skipping check.');
    return;
  }

  try {
    // Check sentinel document first to avoid 20+ parallel read queries
    const sentinelRef = doc(db, 'system', 'seeded');
    const sentinelSnap = await getDoc(sentinelRef);
    if (sentinelSnap.exists() && sentinelSnap.data()?.completed === true) {
      console.log('Firestore backend reports database is already fully seeded. Saving Client index.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('bazar360_db_seeded', 'true');
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
      localStorage.setItem('bazar360_db_seeded', 'true');
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
      return INITIAL_DEALERS;
    }
    const list: Dealer[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        name: data.name || '',
        avatarLetter: data.avatarLetter || data.name?.substring(0, 2).toUpperCase() || 'D',
        avatarUrl: data.avatarUrl || '',
        subtitle: data.subtitle || '',
        location: data.location || '',
        rating: typeof data.rating === 'number' ? data.rating : 4.5,
        vehiclesCount: typeof data.vehiclesCount === 'number' ? data.vehiclesCount : 0,
        followersCount: data.followersCount || '0',
        coverImage: data.coverImage || '',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        socials: data.socials || {},
        activityFeed: Array.isArray(data.activityFeed) ? data.activityFeed : (INITIAL_DEALERS.find((d) => d.id === doc.id)?.activityFeed || [])
      });
    });
    return list;
  } catch (err) {
    console.error('dbFetchDealers Error:', err);
    return INITIAL_DEALERS; // Fallback
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
        dealerId: data.dealerId || 'private',
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
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    });
    console.log('User profile saved successfully to Firestore:', profile.uid);
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
