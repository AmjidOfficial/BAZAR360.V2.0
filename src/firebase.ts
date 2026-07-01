import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { initializeFirestore, setLogLevel, doc, getDocFromServer, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress verbose SDK warnings/info logs when unable to reach the Firestore backend in sandboxed preview environments
setLogLevel('error');

export const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check with reCAPTCHA v3 or local debug fallback only if a real site key is configured
export let appCheck: any = null;
if (typeof window !== 'undefined') {
  if ((import.meta as any).env?.DEV) {
    // Enable debug provider for local/sandbox preview testing
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  const hasRealKey = siteKey && siteKey !== '6Ld_placeholder_site_key_for_recaptcha_v3' && !siteKey.includes('placeholder') && siteKey.trim() !== '';
  
  if (hasRealKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('[App Check] Firebase App Check initialized successfully.');
    } catch (err: any) {
      console.warn('[App Check] Firebase App Check initialization skipped/failed:', err.message || err);
    }
  } else {
    console.log('[App Check] Firebase App Check initialization skipped: No real site key provided in environment variables.');
  }
}

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as any, firebaseConfig.firestoreDatabaseId);

// Validate Connection to Firestore as per critical skill constraint
if (typeof window !== 'undefined') {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'system', 'connection-test'));
      console.log('[Firestore] Connection test to server succeeded.');
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('[Firestore] Applet running in offline-ready sandbox mode. Local cache enabled.');
      } else {
        console.warn('[Firestore] Initial connection test complete/offline-ready:', error.message || error);
      }
    }
  };
  testConnection();
}

// Enable offline persistence to seamlessly handle sandbox iframe connectivity restrictions
// We use enableMultiTabIndexedDbPersistence so multiple tabs/previews can synchronize access gracefully.
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log('[Firestore] Multi-tab offline persistence initialized.');
    })
    .catch((err) => {
      console.warn('[Firestore] Multi-tab offline persistence not enabled:', err.code || err.message);
    });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const linkedinProvider = new OAuthProvider('linkedin.com');
export const functions = getFunctions(app, 'us-central1'); // Defaulting to us-central1 (or project default)

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
