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
  role: 'Admin' | 'Manager' | 'SalesRep' | 'PrivateSeller' | 'Buyer';
  region?: string;
  salesPodId?: string;
  createdAt: string;
  updatedAt: string;
}

const DEALERS_COLLECTION = 'dealers';
const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';

// Seed Database helper
export async function seedDatabaseIfEmpty() {
  try {
    const dealersSnap = await getDocs(collection(db, DEALERS_COLLECTION));
    if (dealersSnap.empty) {
      console.log('Seeding initial dealers to Firestore...');
      for (const d of INITIAL_DEALERS) {
        await setDoc(doc(db, DEALERS_COLLECTION, d.id), {
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
    }

    const listingsSnap = await getDocs(collection(db, LISTINGS_COLLECTION));
    if (listingsSnap.empty) {
      console.log('Seeding initial listings to Firestore...');
      for (const l of INITIAL_LISTINGS) {
        await setDoc(doc(db, LISTINGS_COLLECTION, l.id), {
          ...l,
          approved: true, // Default list seeds approved
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Seed reviews
    for (const dId of Object.keys(INITIAL_REVIEWS)) {
      const reviewsSnap = await getDocs(collection(db, `${DEALERS_COLLECTION}/${dId}/reviews`));
      if (reviewsSnap.empty) {
        const revs = INITIAL_REVIEWS[dId];
        for (const r of revs) {
          await setDoc(doc(db, `${DEALERS_COLLECTION}/${dId}/reviews`, r.id), {
            id: r.id,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    console.log('Bazar360 Seeding completed.');
  } catch (err) {
    console.warn('Silent seeding warning:', err);
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
        activityFeed: []
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
          color: 'Standard',
          engineSize: '2.0L',
          horspower: '150 hp',
          regionalSpecs: 'Pak/Japanese Specs'
        }
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
