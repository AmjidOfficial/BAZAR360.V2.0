import { Dealer, CarListing, Review } from './types';

export const INITIAL_DEALERS: Dealer[] = [
  {
    id: 'almas-car-valley',
    name: 'Almas Car Valley',
    avatarLetter: 'AV',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7L3tc6G8oV2yG6bD2-4rkocsDR68Fv03AYKixBC3Jo7z3F2dxC7l1k4a5qF2lg9sOFyDrPsAyPlvZ6lr6DN1PB651SzZXlvwyRfHsTV44M01h5rtpJZP3vkPARPkwkcD8rbWhw9phqyv92EMw-dvIsScW2rCrgiunc8yMndccSDmD5SZni8J5SJF098meLiFId3ebyei-RpMdRt4bsa4Ot5PZonvepRTSshKKpywxQZF24fSlk6DLYXf6M5s4qDFp0VhtnsirnJI',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxjdmxshS1JqZkmKOnuIQnDYZHFmCE3hju62g3Xuijw0NH6ziKx3ehh71XWbAz9bRJ7tdwnwTi767TJTthdIH7vm1OVA6cLrk7A8bhVlo_lG_KOt0KxAaWqpsBXd6UJFuV8iFNzupeIIRlq5DOOX2nNaCJ35dCQJVPGFnUTr8VUoU4JT41jK1Y2PJAlGRFv5MbNEJz8JruesXMGFKjbHUozAuWoSGCdkr_ZaMLfjAvHgcF8SMPMiRrAV98zbPzw9xsMy-SmUEI7xo',
    subtitle: 'Premium Pre-owned & Luxury Vehicles',
    location: 'Dubai, UAE',
    rating: 4.8,
    vehiclesCount: 142,
    followersCount: '12.5k',
    description: 'We offer an elite, handpicked inventory of high-end sports cars, prestige SUVs, and zero-emission electric vehicles. Providing professional inspection and white-glove delivery across the entire GCC region.',
    phone: '+971 4 333 3600',
    whatsapp: '+971 50 123 4567',
    socials: {
      facebook: 'https://facebook.com/almascarvalley',
      instagram: 'https://instagram.com/almascarvalley',
    },
    activityFeed: [
      {
        id: 'act-1',
        timestamp: '2 hours ago',
        badge: 'Just Arrived',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHs7Za22_aYMs1VGHEYckNGnFgDZzkirSxzLiCJBbCB2xad7rRbbQo7M1xi7RyGNq8fvUUeGKfFFf93rh8AmKvNpWDRSLWCByW_bP0wK9XhH89wGXq5pXT2Px4I9jvkv5MBaJz82g9lonJQn3tomdmnq1xkOb7_VYzNv57n_oDsol7EzCfdb7PAysiZ_xKKaKLUSX2asp4D15fPMkZ87Rak4ev3Dn7scIHsYk-rDEk0lhfaS18RDIBh_FH8gp3SYVfy_24Oiv87Uw',
        title: '2023 Porsche 911 Carrera S',
        description: 'Pristine condition, low mileage. Experience the thrill of German engineering. Ready for a test drive today.',
        price: 'AED 457,000',
        carId: 'car-porsche-911-carrera',
      },
      {
        id: 'act-2',
        timestamp: '1 day ago',
        badge: 'Price Restructure',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI',
        title: '2021 Audi RS Q8 GCC',
        description: 'Immaculate RS Q8 SUV back with restructured premium parameters. Full dealership service logs available.',
        price: 'AED 389,000',
        carId: 'car-audi-rsq8',
      }
    ]
  },
  {
    id: 'elite-prestige-motors',
    name: 'Elite Prestige Motors',
    avatarLetter: 'EP',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7L3tc6G8oV2yG6bD2-4rkocsDR68Fv03AYKixBC3Jo7z3F2dxC7l1k4a5qF2lg9sOFyDrPsAyPlvZ6lr6DN1PB651SzZXlvwyRfHsTV44M01h5rtpJZP3vkPARPkwkcD8rbWhw9phqyv92EMw-dvIsScW2rCrgiunc8yMndccSDmD5SZni8J5SJF098meLiFId3ebyei-RpMdRt4bsa4Ot5PZonvepRTSshKKpywxQZF24fSlk6DLYXf6M5s4qDFp0VhtnsirnJI',
    avatarUrl: '',
    subtitle: 'Luxury and Ultra-Performance Dealer',
    location: 'Abu Dhabi, UAE',
    rating: 4.9,
    vehiclesCount: 18,
    followersCount: '4.2k',
    description: 'Providing elite, certified pre-owned supercars and bespoke executive luxury cruisers. Authorised dealer for leading hyper-performance customized vehicles in Abu Dhabi.',
    phone: '+971 2 555 1212',
    whatsapp: '+971 52 987 6543',
    socials: {
      instagram: 'https://instagram.com/eliteprestigemotors',
    },
    activityFeed: [
      {
        id: 'act-3',
        timestamp: '3 hours ago',
        badge: 'Newly Featured',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZtBmgc7whl0zLeKAWRQtQFFaqpX0BeFFFhv-7s4eS0XJv8a1i88YYMhBhIwgqiGj0A7rd6ANHhOigA9qyoVbvYOAnweQXtNq7ErLbCyQjxwaBqRacvP9ywt_OdSJTgjIghQ1HJJryxlmkvysweO35ZG8mIQ-GXkXc9eRcG8W6mfooetlurMVEfJwBT5kA3gsemMgkdQQ1x8uV6kvo-7Fd2TWs0eo0DbfHCrGCCkwIOepT-cmfMIReSrrjlnJsv7mXR0lNxmLRanQ',
        title: '2023 Porsche 911 GT3 RS',
        description: 'The ultimate track-focussed road weapon, now on our main launchpad in Abu Dhabi. 100% factory specifications.',
        price: 'AED 850,000',
        carId: 'car-porsche-911-gt3',
      }
    ]
  },
  {
    id: 'apex-luxury-wheels',
    name: 'Apex Luxury Wheels',
    avatarLetter: 'AL',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7L3tc6G8oV2yG6bD2-4rkocsDR68Fv03AYKixBC3Jo7z3F2dxC7l1k4a5qF2lg9sOFyDrPsAyPlvZ6lr6DN1PB651SzZXlvwyRfHsTV44M01h5rtpJZP3vkPARPkwkcD8rbWhw9phqyv92EMw-dvIsScW2rCrgiunc8yMndccSDmD5SZni8J5SJF098meLiFId3ebyei-RpMdRt4bsa4Ot5PZonvepRTSshKKpywxQZF24fSlk6DLYXf6M5s4qDFp0VhtnsirnJI',
    subtitle: 'Bespoke Executive Automotive Boutique',
    location: 'Marina Mall, Dubai',
    rating: 4.7,
    vehiclesCount: 35,
    followersCount: '8.9k',
    description: 'Specialists in high-performance electric vehicles and limited edition luxury SUVs. Delivering next-generation mobility with customized specifications.',
    phone: '+971 4 444 8888',
    whatsapp: '+971 56 777 9999',
    socials: {
      instagram: 'https://instagram.com/apexwheels',
    },
    activityFeed: [
      {
        id: 'act-4',
        timestamp: '4 hours ago',
        badge: 'Pure Electric',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRyZgqdwVho1YG4awPp4toJiKUSqH05IGmlCDeY-esoL_rsDYbAkp7FPKlnXbFzCmNSSrCuHqwrXO_non2l8_jM8QfzbMxg4aYyOMfOsMhs3rpT2R8j1Gx1Mf3knoB5B5hIqUiVq3mIkhn8Bc_376AboW7iBngDAdVbQRCj0uupxH2V2RrluMiTA106UgPdQQb-5gB_A5arpTkTHIfrGwAj737v9D8LD8iIwl-xWDtVKgoKbuQ9XpeQ3NVP4I-N1tqLxV1YsPjWs',
        title: '2024 BMW M4 Comp EV Edition',
        description: 'Elite white styling equipped with professional racing suspension. High tech handling, high sustainability.',
        price: 'AED 301,000',
        carId: 'car-bmw-m4-comp',
      }
    ]
  }
];

export const INITIAL_LISTINGS: CarListing[] = [
  {
    id: 'car-porsche-911-gt3',
    title: '2023 Porsche 911 GT3',
    make: 'Porsche',
    model: '911 GT3',
    year: 2023,
    price: 850000,
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZtBmgc7whl0zLeKAWRQtQFFaqpX0BeFFFhv-7s4eS0XJv8a1i88YYMhBhIwgqiGj0A7rd6ANHhOigA9qyoVbvYOAnweQXtNq7ErLbCyQjxwaBqRacvP9ywt_OdSJTgjIghQ1HJJryxlmkvysweO35ZG8mIQ-GXkXc9eRcG8W6mfooetlurMVEfJwBT5kA3gsemMgkdQQ1x8uV6kvo-7Fd2TWs0eo0DbfHCrGCCkwIOepT-cmfMIReSrrjlnJsv7mXR0lNxmLRanQ',
    verified: true,
    featured: true,
    dealerId: 'elite-prestige-motors',
    description: 'Astonishing 2023 Porsche 911 GT3 in pristine, unmodified showroom state. Extravagantly optioned with metallic dark gray outer coat, carbon-ceramic brakes, Clubsport safety cage, carbon fiber bucket seats, and telemetry monitors. Pre-certified under 111-point professional audit.',
    createdAt: '2026-06-12T10:00:00Z',
    tags: ['SUV', 'Luxury', 'Classic', 'Sport'],
    specs: {
      color: 'Dark Metallic Gray',
      engineSize: '4.0L H6',
      horspower: '502 hp',
      regionalSpecs: 'GCC Specification'
    }
  },
  {
    id: 'car-mercedes-g63',
    title: '2024 Mercedes-Benz G63 AMG',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    price: 1150000,
    mileage: 500,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI',
    verified: true,
    featured: true,
    dealerId: 'almas-car-valley',
    description: 'Practically delivery mileage, raw 2024 model year Mercedes Benz G63 AMG. Painted in bespoke matte Obsidian Black with carbon accent elements. Extravagant diamond-stitched red leather interiors. Absolute peak executive presence with extreme safety and double exhaust options.',
    createdAt: '2026-06-13T15:00:00Z',
    tags: ['SUV', 'Luxury'],
    specs: {
      color: 'Matte Obsidian Black',
      engineSize: '4.0L V8 BiTurbo',
      horspower: '577 hp',
      regionalSpecs: 'GCC Specification'
    }
  },
  {
    id: 'car-bmw-m4-comp',
    title: '2022 BMW M4 Competition',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2022,
    price: 301000,
    mileage: 12000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRyZgqdwVho1YG4awPp4toJiKUSqH05IGmlCDeY-esoL_rsDYbAkp7FPKlnXbFzCmNSSrCuHqwrXO_non2l8_jM8QfzbMxg4aYyOMfOsMhs3rpT2R8j1Gx1Mf3knoB5B5hIqUiVq3mIkhn8Bc_376AboW7iBngDAdVbQRCj0uupxH2V2RrluMiTA106UgPdQQb-5gB_A5arpTkTHIfrGwAj737v9D8LD8iIwl-xWDtVKgoKbuQ9XpeQ3NVP4I-N1tqLxV1YsPjWs',
    verified: true,
    featured: false,
    dealerId: 'apex-luxury-wheels',
    description: 'Immaculately customized 2022 BMW M4 Competition model in Alpine White. Equipped with adaptive sports suspension, carbon aerodynamic wings, laser lamps, and supreme interior comfort metrics.',
    createdAt: '2026-06-10T12:00:00Z',
    tags: ['Sedan', 'Luxury', 'Sport'],
    specs: {
      color: 'Alpine White',
      engineSize: '3.0L S58 Twin-Turbo I6',
      horspower: '503 hp',
      regionalSpecs: 'GCC Specification'
    }
  },
  {
    id: 'car-audi-rsq8',
    title: '2021 Audi RS Q8',
    make: 'Audi',
    model: 'RS Q8',
    year: 2021,
    price: 389000,
    mileage: 24000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJqJ3MkFiS7DRa6OqXFSkJcsI3cZ9685e7vJevGiglSWNC2IfxmZhySZymL0jE7nrtUXMK6mf7aHDMHqlrZWKmkCE0srhAhIAspnSs8zwfdjDTe-dg6nn_Aga0qdRS4HRXFWY3F_q8ZawA6LnWHg_skTG6XUMyQyjW-p2_o3ang_YT0dQhOTTRaDaYBO7_Qu4gbU9bE6JvdTXnmdtv7C205mCo97G1dOgK0FxT0Ydptt8zcbWU1l6sXYT9tEUyNWIkdrgiPIn9esI',
    verified: false,
    featured: false,
    dealerId: 'almas-car-valley',
    description: 'Outstanding 2021 Audi RS Q8 with pristine gray body configuration. Features Nappa leather seats, dynamic active chassis, massage nodes, and incredible V8 grunt.',
    createdAt: '2026-06-08T09:00:00Z',
    tags: ['SUV', 'Luxury'],
    specs: {
      color: 'Nardo Gray',
      engineSize: '4.0L twin-turbocharged V8',
      horspower: '591 hp',
      regionalSpecs: 'GCC Specification'
    }
  },
  {
    id: 'car-porsche-911-carrera',
    title: '2023 Porsche 911 Carrera S',
    make: 'Porsche',
    model: '911 Carrera S',
    year: 2023,
    price: 457000,
    mileage: 8200,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHs7Za22_aYMs1VGHEYckNGnFgDZzkirSxzLiCJBbCB2xad7rRbbQo7M1xi7RyGNq8fvUUeGKfFFf93rh8AmKvNpWDRSLWCByW_bP0wK9XhH89wGXq5pXT2Px4I9jvkv5MBaJz82g9lonJQn3tomdmnq1xkOb7_VYzNv57n_oDsol7EzCfdb7PAysiZ_xKKaKLUSX2asp4D15fPMkZ87Rak4ev3Dn7scIHsYk-rDEk0lhfaS18RDIBh_FH8gp3SYVfy_24Oiv87Uw',
    verified: true,
    featured: true,
    dealerId: 'almas-car-valley',
    description: 'Unbelievable driving dynamics from this Porsche 911 Carrera S. Clean history, low mileage, pre-inspected by Almas certified mechanics.',
    createdAt: '2026-06-14T09:30:00Z',
    tags: ['Classic', 'Luxury', 'Sport'],
    specs: {
      color: 'Chalk White',
      engineSize: '3.0L Twin-Turbo Flat-6',
      horspower: '443 hp',
      regionalSpecs: 'GCC Specification'
    }
  }
];

export const INITIAL_REVIEWS: Record<string, Review[]> = {
  'almas-car-valley': [
    {
      id: 'rev-1',
      author: 'Amjid B.',
      rating: 5,
      date: 'June 10, 2026',
      comment: 'Absolutely superb service from Almas Car Valley. From initial inquiry to personalized shipping inside Dubai, everything was handled professionally. Highly recommended dealership!'
    },
    {
      id: 'rev-2',
      author: 'Fatima K.',
      rating: 4,
      date: 'May 24, 2026',
      comment: 'Very reliable pre-owned collection. Got my Carrera inspecitoned through Bazar360 inspection service too and it was super easy!'
    }
  ],
  'elite-prestige-motors': [
    {
      id: 'rev-3',
      author: 'Zayed A.',
      rating: 5,
      date: 'June 13, 2026',
      comment: 'Top tier sports car selection. The Porsche 911 GT3 is an absolute rocket. Seamless finance transition.'
    }
  ],
  'apex-luxury-wheels': []
};
