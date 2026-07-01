import { httpsCallable } from 'firebase/functions';
import { getToken } from 'firebase/app-check';
import { functions, appCheck } from '../firebase';

// Strong type definitions matching the Express payloads and response shapes
export interface MarketingEngineRequest {
  rawInput: string;
  tone?: string;
}

export interface MarketingEngineResponse {
  success: boolean;
  error?: string;
  result: {
    title: string;
    description: string;
    tags: string[];
    suggestedPricePKR: number;
    highlights: string[];
  };
}

export interface DealerChatRequest {
  dealerName: string;
  dealerBio: string;
  inventorySummary: string;
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
}

export interface DealerChatResponse {
  reply: string;
}

export interface ScrapeSocialsRequest {
  name: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
}

export interface ScrapeSocialsResponse {
  success: boolean;
  error?: string;
  avatarUrl: string;
  coverImage: string;
  activityFeed: Array<{
    id: string;
    timestamp: string;
    badge: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
  }>;
}

// Environment Detection Helper
const isGitHubPages = window.location.hostname.includes('github.io') || window.location.hostname.includes('bazar360.online');
const isProduction = process.env.NODE_ENV === 'production' || isGitHubPages;

/**
 * Safely fetches the current Firebase App Check token to protect our local backend.
 */
async function getAppCheckHeader(): Promise<Record<string, string>> {
  if (!appCheck) return {};
  try {
    const appCheckTokenResult = await getToken(appCheck, false);
    return { 'X-Firebase-AppCheck': appCheckTokenResult.token };
  } catch (error) {
    console.warn('[App Check] Failed to retrieve App Check token:', error);
    return {};
  }
}

/**
 * AI Marketing Engine Handler
 */
export async function callMarketingEngine(rawInput: string, tone = 'Premium'): Promise<MarketingEngineResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Marketing Engine Cloud Function...');
    try {
      const marketingEngineFn = httpsCallable<MarketingEngineRequest, MarketingEngineResponse>(functions, 'marketingEngine');
      const response = await marketingEngineFn({ rawInput, tone });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless callable failed or is unconfigured. Triggering local bypass...', error);
      throw error;
    }
  }

  // Fallback to Express backend locally in Dev container or sandbox
  console.log('BAZAR360 V2.0: Fetching from local container dev Express API...');
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/ai/marketing-engine', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({ rawInput, tone }),
  });
  if (!response.ok) {
    throw new Error('Local dev host API not responding or offline.');
  }
  return response.json();
}

/**
 * Showroom Representative Chatbot Handler
 */
export async function callDealerChat(
  dealerName: string,
  dealerBio: string,
  inventorySummary: string,
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>
): Promise<DealerChatResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Dealer Chatbot Cloud Function...');
    try {
      const dealerChatFn = httpsCallable<DealerChatRequest, DealerChatResponse>(functions, 'dealerChat');
      const response = await dealerChatFn({
        dealerName,
        dealerBio,
        inventorySummary,
        message,
        history,
      });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless dealer chatbot callable failed. Triggering fallback dialogue...', error);
      throw error;
    }
  }

  // Fallback to Local Express dev server
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/dealer/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({
      dealerName,
      dealerBio,
      inventorySummary,
      message,
      history,
    }),
  });
  if (!response.ok) {
    throw new Error('Local dev chatbot API offline.');
  }
  return response.json();
}

/**
 * Social Scraper and Asset Populator Handler
 */
export async function callScrapeSocials(socials: ScrapeSocialsRequest): Promise<ScrapeSocialsResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Social WebScraping Cloud Function...');
    try {
      const scrapeSocialsFn = httpsCallable<ScrapeSocialsRequest, ScrapeSocialsResponse>(functions, 'scrapeSocials');
      const response = await scrapeSocialsFn(socials);
      return response.data;
    } catch (error: any) {
      console.warn('Serverless scraper callable failed. Triggering sandbox fallback engine...', error);
      throw error;
    }
  }

  // Fallback to Local Express dev server
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/scrape-socials', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify(socials),
  });
  if (!response.ok) {
    throw new Error('Local dev scraper API offline.');
  }
  return response.json();
}

export interface AiTranslateRequest {
  text: string;
  targetLanguage: string;
}

export interface AiTranslateResponse {
  success: boolean;
  translatedText: string;
  error?: string;
}

/**
 * On-Demand Translation Handler
 */
export async function callAiTranslate(text: string, targetLanguage = 'Urdu'): Promise<AiTranslateResponse> {
  if (isProduction) {
    console.log('BAZAR360 V2.0: Triggering Serverless Translation Cloud Function...');
    try {
      const aiTranslateFn = httpsCallable<AiTranslateRequest, AiTranslateResponse>(functions, 'aiTranslate');
      const response = await aiTranslateFn({ text, targetLanguage });
      return response.data;
    } catch (error: any) {
      console.warn('Serverless translate callable failed. Triggering local/mock translation bypass...', error);
      // Fallback if callable is not deployed: simulate or use lightweight Urdu translation
      return {
        success: false,
        translatedText: text,
        error: error.message
      };
    }
  }

  // Fallback to Local Express dev server in Sandbox/Container
  const appCheckHeader = await getAppCheckHeader();
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...appCheckHeader
    },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!response.ok) {
    throw new Error('Local dev translation API offline.');
  }
  return response.json();
}

/**
 * Register User Profile and optional Showroom via Secure full-stack Admin SDK backend
 */
export async function callRegisterUser(
  profile: any, 
  showroom?: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const appCheckHeader = await getAppCheckHeader();
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...appCheckHeader
      },
      body: JSON.stringify({ profile, showroom }),
    });
    if (!response.ok) {
      throw new Error('Registration backend API not responding or offline.');
    }
    return response.json();
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return { success: false, error: error.message || 'Failed to communicate with registration API.' };
  }
}

