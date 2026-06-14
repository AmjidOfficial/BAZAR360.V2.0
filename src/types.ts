export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number; // in AED
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
  socials: {
    facebook?: string;
    instagram?: string;
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
  suggestedPriceAED: number;
  highlights: string[];
}
