export interface VehicleListing {
  id: string;
  title: string;
  brand: string;
  modelYear: string;
  priceFormatted: string;
  priceRaw: number; // for sorting
  mileage: string;
  mileageRaw: number; // for sorting/filtering
  fuelType: 'Essence' | 'Diesel' | 'Hybrid' | 'Electric';
  images: string[];
  isPremium: boolean;
  category: 'Supercar' | 'Hypercar' | 'Luxury SUV' | 'Classic';
  engineCC: number;
  horsepower: number;
  exteriorColor: string;
  conditionScore: number; // 1-10 rating scale
  transmission: 'Automatic' | 'Manual';
  description: string;
  isSold: boolean;
  isReserved: boolean;
}

export interface MetricSnapshot {
  totalInventory: number;
  availableLive: number;
  reservedCount: number;
  soldCount: number;
  totalValuePKR: number;
}
