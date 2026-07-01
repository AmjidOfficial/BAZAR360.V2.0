# BAZAR360 - AI Agent Guidelines

**Bazar360** is a modern automotive marketplace built on React + TypeScript + Firebase, deployed at https://bazar360.online. This guide helps AI agents understand the codebase architecture, conventions, and development workflow.

## Quick Start

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (tsx server.ts)
npm run build                  # Build for production
npm run lint                   # Type check
npm run deploy                 # Deploy to GitHub Pages
```

**Prerequisites**: Node.js, `.env.local` with `GEMINI_API_KEY` and `VITE_RECAPTCHA_SITE_KEY`

## Project Structure

```
src/
├── components/               # React views & UI components
├── lib/                      # Database, currency, tracking utilities
├── services/                 # External API integrations (api.ts)
├── pages/                    # Page-level routing components
├── config/                   # Configuration (industryConfig.ts)
├── firebase.ts               # Firebase initialization & auth setup
├── types.ts                  # Shared TypeScript interfaces
├── data.ts                   # Static seed data (INITIAL_DEALERS, INITIAL_LISTINGS)
├── translations.ts           # i18n for English/Urdu
└── App.tsx                   # Main app entry point
```

## Core Architecture

### Database (Firestore)
- **Collections**: `dealers`, `listings`, `users`, `profiles`, `reviews`, `bargains`, `leads`, `auditLogs`
- **Service Layer**: [src/lib/dbService.ts](src/lib/dbService.ts) (50+ database functions)
- **Key Pattern**: Graceful fallback to `INITIAL_DATA` when Firestore unavailable
- **Security**: See [security_spec.md](security_spec.md) for RBAC, field immutability, and "Dirty Dozen" exploit payloads

### Component Architecture
- **View Components**: HomeView, SearchExplorerView, DealerStorefrontView, DetailedVehiclePostingPage
- **Card Components**: VehicleCard (with WhatsApp/call), VehicleSkeletonCard (loading)
- **Navigation**: TopAppBar, BottomNavBar, Footer
- **Admin**: AdminModerationDeck, ShowroomHQHub

**Prop Convention**:
```typescript
interface ViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  onSelectDealer: (id: string) => void;  // Event handlers: on{Action}
  setTab: (tab: string) => void;         // State setters
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
}
```

### Firebase Integration
- **Auth**: Google, Facebook, LinkedIn OAuth (signInWithPopup)
- **Firestore**: Offline persistence enabled (enableMultiTabIndexedDbPersistence)
- **App Check**: ReCaptchaV3 (production) with debug mode (dev)
- **Functions**: Cloud Functions in `functions/` directory (currently in TypeScript, deployed as Node)

### Type System
Core domain models in [types.ts](src/types.ts):
- `CarListing`: Vehicle with specs (make, model, year, price, condition, engineCC, bodyCondition, documentType, tokenTaxPaid, images)
- `Dealer`: Showroom profile with ratings, location, socials, activity feed
- `UserProfile`: User account with role (Admin, Showroom Owner, Individual User, Sales Rep, etc.)
- `Bargain`: Negotiation offers between buyers and dealers

### Styling & Theming
- **Framework**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Theme System**: CSS custom properties + class variants (theme-cosmic-dark, theme-luxury-light, theme-emerald, theme-gold)
- **Component**: [src/components/ThemeContext.tsx](src/components/ThemeContext.tsx) manages theme state
- **Dealer Customization**: `theme_choice` field on Dealer model for showroom-specific branding

### Multi-Locale & Multi-Currency
- **Localization**: [src/translations.ts](src/translations.ts) (English + Urdu)
- **Currency**: [src/lib/currency.ts](src/lib/currency.ts) (PKR/USD/DUAL modes, 278 PKR = 1 USD)
- **Visitor Tracking**: [src/lib/visitorTracking.ts](src/lib/visitorTracking.ts) logs search queries and vehicle views

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `HomeView.tsx`, `VehicleCard.tsx` |
| Functions | camelCase | `dbFetchDealers()`, `seedDatabaseIfEmpty()` |
| Constants | UPPER_SNAKE_CASE | `DEALERS_COLLECTION` |
| Event Props | `on{Action}` | `onSelectDealer`, `onToggleCompare` |
| Document IDs | kebab-case | `auto-choice-peshawar`, `car-fortuner-legender` |
| Type Aliases | PascalCase | `CarListing`, `UserProfile` |

## Development Workflow

### Adding a New Feature
1. **Create Component** in `src/components/` with TypeScript interface props
2. **Add DB Functions** in `src/lib/dbService.ts` (fetch, save, delete patterns)
3. **Define Types** in `src/types.ts` or `dbService.ts`
4. **Add Translations** to `src/translations.ts` for both languages
5. **Update Theme** in `src/components/ThemeContext.tsx` if styling needed
6. **Wire into App.tsx** with state management and routing

### Database Operations
**Pattern**: All DB operations use async/await with try/catch

```typescript
// In dbService.ts:
export async function dbFetchListings(): Promise<CarListing[]> {
  try {
    const snapshot = await getDocs(collection(db, 'listings'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarListing));
  } catch (error) {
    console.error('[Firestore] Error fetching listings:', error);
    return INITIAL_LISTINGS; // Graceful fallback
  }
}

// In component:
const [listings, setListings] = useState<CarListing[]>([]);
useEffect(() => {
  dbFetchListings().then(setListings);
}, []);
```

### Styling
- Use Tailwind classes exclusively (no CSS-in-JS or separate CSS files)
- Reference theme variables: `text-[var(--color-text-main)]`, `bg-[var(--color-bg-primary)]`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes

### TypeScript
- Target: ES2022
- Path alias: `@/*` → workspace root
- JSX: react-jsx (automatic runtime)
- Skip lib check enabled for faster builds

## Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| Firestore unavailable in preview | Code gracefully falls back to INITIAL_DATA; App Check debug token auto-enabled in dev |
| Missing auth context | Wrap components in auth check: `useEffect(() => { onAuthStateChanged(auth, setUser) })` |
| Theme/language not updating | Ensure component subscribes to ThemeContext and passes lang state to child views |
| Build fails with server.ts errors | esbuild requires Node dependencies to be external; check `--packages=external` flag |
| Components re-render excessively | Props like `dealers`, `listings` should be stable refs; memoize with `useMemo()` if needed |
| DB writes failing in Firestore rules | Check [security_spec.md](security_spec.md); common: immutable fields (createdAt, ownerId), role-based checks, field validation |

## Key Files to Know

| File | Purpose |
|------|---------|
| [src/lib/dbService.ts](src/lib/dbService.ts) | 50+ Firestore CRUD functions; source of truth for DB patterns |
| [src/types.ts](src/types.ts) | Core domain models (CarListing, Dealer, UserProfile, Bargain) |
| [src/firebase.ts](src/firebase.ts) | Firebase initialization, auth providers, App Check setup |
| [src/App.tsx](src/App.tsx) | Main component with routing, theme/language state, data loading |
| [src/components/ThemeContext.tsx](src/components/ThemeContext.tsx) | Theme system (CSS variables, class switching) |
| [src/translations.ts](src/translations.ts) | i18n strings (en/ur) |
| [security_spec.md](security_spec.md) | Firestore rules, RBAC, security invariants, exploit payloads to prevent |
| [firestore.rules](firestore.rules) | Active security rules (enforce [security_spec.md](security_spec.md)) |
| [tailwind.config.ts](tailwind.config.ts) | Tailwind configuration (plugins, custom colors/fonts) |
| [vite.config.ts](vite.config.ts) | Vite build config (React plugin, Tailwind integration, HMR settings) |

## Environment Variables

Required in `.env.local`:
```
VITE_RECAPTCHA_SITE_KEY=<reCAPTCHA v3 site key>
GEMINI_API_KEY=<Google Gemini API key>
FIREBASE_API_KEY=<from firebase-applet-config.json>
```

## Deployment

- **Host**: GitHub Pages (https://bazar360.online via CNAME)
- **Build**: `npm run build` → vite build + esbuild server.ts
- **Deploy**: `npm run deploy` → gh-pages -d dist
- **Server**: Express middleware at root for App Check validation + Gemini API

## Testing & Validation

- **Type Check**: `npm run lint` (tsc --noEmit)
- **Security**: Manual test with [security_spec.md](security_spec.md) payloads against firestore.rules
- **Offline**: Test with Firestore offline (DevTools Network → offline); should fallback to INITIAL_DATA
- **Auth Flow**: Test OAuth providers in dev mode (Google, Facebook, LinkedIn)

## Multi-Tenancy & Future Expansion

- **industryConfig.ts**: Currently locked to Automotive; future support for Footwear, Apparel
- **Schema Design**: Flexible enough to extend with new collections (e.g., `products`, `inventory`)
- **Type Extensions**: CarListing has optional fields for extensibility (assemblyType, range, topSpeed)

---

**Last Updated**: 2026-07-01  
**Framework Versions**: React 19, Vite 6, Firebase 12.14, TypeScript 5.8  
**Maintained By**: Bazar360 Development Team
