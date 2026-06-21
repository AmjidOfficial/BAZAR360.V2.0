export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number; // in PKR
  mileage: number; // in km
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  imageUrl: string;
  verified: boolean;
  featured: boolean;
  dealerId: string;
  description: string;
  createdAt: string;
  tags: string[];
  specs: {
    color: string;
    engineSize: string;
    horspower: string;
    regionalSpecs: string;
  };
  approved?: boolean;
  assignedSalesRepId?: string;
  region?: string;

  // Auto Choice Exclusive strict properties
  condition: 'New' | 'Used';
  engineCC: number;
  exteriorColor: string;
  bodyCondition: 'Total Genuine' | 'Minor Touch-ups' | 'Major Repaint';
  registrationCity: string;
  documentType: 'Smart Card' | 'Original Book' | 'Duplicate';
  tokenTaxPaid: boolean;
  images: string[];
  
  // Requirement matrix extensions
  assemblyType?: 'Local' | 'Imported';
  dentPaintDescription?: string;
  tokenTaxStatus?: 'Paid' | 'Outstanding';
}

export interface Dealer {
  id: string;
  name: string;
  avatarLetter: string;
  avatarUrl?: string;
  subtitle: string;
  location: string;
  rating: number;
  vehiclesCount: number;
  followersCount: string;
  coverImage: string;
  description: string;
  phone: string;
  whatsapp: string;
  flagshipVerified?: boolean;
  lines?: {
    lineA: string;
    lineB: string;
    lineC: string;
  };
  socials: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  activityFeed: ActivityPost[];
}

export interface ActivityPost {
  id: string;
  timestamp: string;
  badge: string;
  imageUrl: string;
  title: string;
  description: string;
  price: string;
  carId?: string;
  status?: 'pending_approval' | 'approved';
  videoUrl?: string;
  videoDuration?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface GeneratedSEOListing {
  title: string;
  description: string;
  tags: string[];
  suggestedPricePKR: number;
  highlights: string[];
}

export interface IndustryConfig {
  activeIndustry: 'Automotive' | 'Footwear' | 'Apparel';
  industryName: string;
  slogan: string;
  heroBadge: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  visitorId: string;
  searchQueries: string[];
  filterChanges: {
    make?: string;
    city?: string;
    maxPrice?: number;
    transmission?: string;
  };
  deviceMetrics: {
    viewportWidth: number;
    viewportHeight: number;
    userAgent: string;
  };
}

export interface RegisteredUserLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  savedAlerts: string[];
  activityType: 'profile_view' | 'save_car' | 'message_sent' | 'comparative_eval';
  queryDetails?: string;
}

export interface BargainOwnerLog {
  id: string;
  timestamp: string;
  dealerId: string;
  ownerEmail: string;
  action: 'monetize_analytics' | 'inventory_health_update' | 'buyer_log_accessed' | 'uploaded_listing';
  details: string;
  inventoryCountSnapshot: number;
}

