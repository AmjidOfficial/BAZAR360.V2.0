import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface VisitorData {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  frequencyCategory: '1st Time' | '2nd Time' | '3rd Time' | 'Regular';
  sessionCount: number;
  totalViews: number;
  searchHistory: string[];
  viewHistory: string[];
  clicksToCall: number;
  clicksToWhatsApp: number;
  deviceMetrics: {
    viewportWidth: number;
    viewportHeight: number;
    userAgent: string;
  };
}

// Generate an elegant, short UUID
function generateUUID(): string {
  return 'vst-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString().slice(-4);
}

// Retrieve or initialize the visitor session
export async function initializeVisitorTracking(): Promise<VisitorData> {
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('bazar360_visitor_id') || '';
  } catch (e) {
    console.warn('Storage restrictions active, creating temporary tracking session.');
  }

  let isNewVisitor = false;
  if (!visitorId) {
    visitorId = generateUUID();
    isNewVisitor = true;
    try {
      localStorage.setItem('bazar360_visitor_id', visitorId);
    } catch (e) {}
  }

  const visitorRef = doc(db, 'visitors', visitorId);
  const nowStr = new Date().toISOString();
  
  // Detect standard device metrics
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Bazar360 Server Probe';

  let hasNewSession = false;
  try {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('bazar360_session_active')) {
      hasNewSession = true;
      sessionStorage.setItem('bazar360_session_active', 'true');
    }
  } catch (e) {
    hasNewSession = true; // fallback
  }

  let visitor: VisitorData;

  try {
    const snap = await getDoc(visitorRef);
    if (snap.exists()) {
      const data = snap.data() as VisitorData;
      
      const newSessionCount = hasNewSession ? (data.sessionCount + 1) : data.sessionCount;
      
      // Determine frequency categorization based on real session logs
      let category: '1st Time' | '2nd Time' | '3rd Time' | 'Regular' = '1st Time';
      if (newSessionCount === 2) category = '2nd Time';
      else if (newSessionCount === 3) category = '3rd Time';
      else if (newSessionCount >= 4) category = 'Regular';

      visitor = {
        ...data,
        lastSeen: nowStr,
        sessionCount: newSessionCount,
        frequencyCategory: category,
        deviceMetrics: { viewportWidth, viewportHeight, userAgent }
      };

      // Commit update asynchronously
      await updateDoc(visitorRef, {
        lastSeen: nowStr,
        sessionCount: newSessionCount,
        frequencyCategory: category,
        'deviceMetrics.viewportWidth': viewportWidth,
        'deviceMetrics.viewportHeight': viewportHeight,
        'deviceMetrics.userAgent': userAgent
      });
    } else {
      // First-time visitor creation
      visitor = {
        visitorId,
        firstSeen: nowStr,
        lastSeen: nowStr,
        frequencyCategory: '1st Time',
        sessionCount: 1,
        totalViews: 0,
        searchHistory: [],
        viewHistory: [],
        clicksToCall: 0,
        clicksToWhatsApp: 0,
        deviceMetrics: { viewportWidth, viewportHeight, userAgent }
      };

      await setDoc(visitorRef, visitor);
    }
  } catch (err) {
    console.warn('Visitor tracking engine using local cache proxy:', err);
    // Offline / Sandboxed Fallback
    visitor = {
      visitorId,
      firstSeen: nowStr,
      lastSeen: nowStr,
      frequencyCategory: '1st Time',
      sessionCount: 1,
      totalViews: 0,
      searchHistory: [],
      viewHistory: [],
      clicksToCall: 0,
      clicksToWhatsApp: 0,
      deviceMetrics: { viewportWidth, viewportHeight, userAgent }
    };
  }

  // Also save in localStorage for synchronous fast retrieval in UI
  try {
    localStorage.setItem('bazar360_visitor_profile', JSON.stringify(visitor));
  } catch (e) {}

  return visitor;
}

// Log an organic search query
export async function trackSearchQuery(queryText: string): Promise<void> {
  if (!queryText.trim()) return;
  
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('bazar360_visitor_id') || '';
  } catch (e) {}
  
  if (!visitorId) return;

  try {
    // Save to local cache first
    const cached = localStorage.getItem('bazar360_visitor_profile');
    if (cached) {
      const parsed = JSON.parse(cached) as VisitorData;
      if (!parsed.searchHistory.includes(queryText)) {
        parsed.searchHistory.push(queryText);
        localStorage.setItem('bazar360_visitor_profile', JSON.stringify(parsed));
      }
    }

    const visitorRef = doc(db, 'visitors', visitorId);
    await updateDoc(visitorRef, {
      searchHistory: arrayUnion(queryText),
      lastSeen: new Date().toISOString()
    });
  } catch (e) {
    console.log('Search log cached locally.');
  }
}

// Log a vehicle listing click / details view
export async function trackVehicleView(listingId: string): Promise<void> {
  if (!listingId) return;
  
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('bazar360_visitor_id') || '';
  } catch (e) {}
  
  if (!visitorId) return;

  try {
    // Save to local cache first
    const cached = localStorage.getItem('bazar360_visitor_profile');
    if (cached) {
      const parsed = JSON.parse(cached) as VisitorData;
      parsed.totalViews += 1;
      if (!parsed.viewHistory.includes(listingId)) {
        parsed.viewHistory.push(listingId);
      }
      localStorage.setItem('bazar360_visitor_profile', JSON.stringify(parsed));
    }

    const visitorRef = doc(db, 'visitors', visitorId);
    await updateDoc(visitorRef, {
      viewHistory: arrayUnion(listingId),
      totalViews: increment(1),
      lastSeen: new Date().toISOString()
    });
  } catch (e) {
    console.log('View log cached locally.');
  }
}

// Log a high-intent CTR action (WhatsApp click or direct Call click)
export async function trackHighIntentClick(action: 'whatsapp' | 'call'): Promise<void> {
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('bazar360_visitor_id') || '';
  } catch (e) {}
  
  if (!visitorId) return;

  try {
    const visitorRef = doc(db, 'visitors', visitorId);
    if (action === 'whatsapp') {
      await updateDoc(visitorRef, {
        clicksToWhatsApp: increment(1),
        lastSeen: new Date().toISOString()
      });
    } else {
      await updateDoc(visitorRef, {
        clicksToCall: increment(1),
        lastSeen: new Date().toISOString()
      });
    }
  } catch (e) {
    console.log('CTR intent cached locally.');
  }
}
