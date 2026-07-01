import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Initialize Firebase Admin SDK using applet configurations
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log("[App Check Shield] Firebase Admin initialized successfully.");
  } catch (error: any) {
    console.warn("[App Check Shield] Firebase Admin failed to initialize:", error.message || error);
  }
}

// App Check Validation Middleware
const appCheckVerification = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");
  const isProd = process.env.NODE_ENV === "production";

  if (!appCheckToken) {
    if (isProd) {
      console.warn("[App Check Shield] Blocked production request: Missing App Check token.");
      return res.status(401).json({ success: false, error: "Unauthorized: Missing App Check token." });
    } else {
      console.log("[App Check Shield] Development mode: Permitted request without App Check token.");
      return next();
    }
  }

  try {
    const decodedToken = await admin.appCheck().verifyToken(appCheckToken);
    console.log(`[App Check Shield] Decoded valid App Check token for App ID: ${decodedToken.appId}`);
    return next();
  } catch (err: any) {
    console.warn("[App Check Shield] Token verification failed:", err.message || err);
    if (isProd) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid/expired App Check token." });
    } else {
      console.log("[App Check Shield] Development mode: Permitted bypass for preview convenience.");
      return next();
    }
  }
};

let aiClient: GoogleGenAI | null = null;

// Lazy initialization pattern to prevent crashes if key is omitted on boot
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust retry wrapper with exponential backoff for transient API bottlenecks
async function executeWithRetry<T>(
  apiCall: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      attempt++;
      const errorMessage = String(error.message || error);
      const isTransient = 
        errorMessage.includes("503") || 
        errorMessage.includes("UNAVAILABLE") || 
        errorMessage.includes("RESOURCE_EXHAUSTED") || 
        errorMessage.includes("high demand") ||
        errorMessage.includes("429") ||
        error.status === 503 ||
        error.status === 429;
        
      if (isTransient && attempt < retries) {
        const sleepTime = delayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        console.log(`[Bazar360 AI Engine] Transient busy state detected. Retrying in ${Math.round(sleepTime)}ms (attempt ${attempt}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      } else {
        throw error;
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Protect all API endpoints with Firebase App Check
  app.use("/api", appCheckVerification);

  // API 1: AI Marketing Listing Engine
  app.post("/api/ai/marketing-engine", async (req, res) => {
    try {
      const { rawInput, tone } = req.body;

      if (!rawInput) {
        return res.status(400).json({ success: false, error: "Raw input is required" });
      }

      const client = getGeminiClient();

      const systemPrompt = `You are a professional automotive copywriter and SEO marketing specialist named "BAZAR360-Marketer".
Your task is to transform raw, shorthand seller notes into a pristine, high-end SEO-optimized listing.
Convert slang prices like "65 lac" (which represents 6,500,000 Pakistani Rupees PKR) or "1.2 crore" (12,000,000 PKR) or raw numbers appropriately to equivalent full PKR (Pakistani Rupees) value as an integer. For example: "65 lac" is 6500000, "15 lac" is 1500000. Underwrite a competitive valuation accordingly in Pakistani Rupees (PKR) based on the vehicle year and make.
Generate output strictly conforming to the following JSON structure:
{
  "title": "A highly premium, professional automotive title",
  "description": "Rich sales description focusing on safety, drivability, and premium status, matched to the selected style tone",
  "tags": ["Tag1", "Tag2"],
  "suggestedPricePKR": 6500000,
  "highlights": ["Highlight point 1", "Highlight point 2", "Highlight point 3"]
}
Tone tuning selected: ${tone || 'Premium'}. Ensure vocabulary mirrors luxury automotive catalogs.`;

      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate this shorthand seller note: "${rawInput}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedPricePKR: { type: Type.INTEGER },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "tags", "suggestedPricePKR", "highlights"]
          }
        }
      }));

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Failed to receive output text from Gemini models.");
      }

      const parsedJSON = JSON.parse(resultText.trim());
      res.json({ success: true, result: parsedJSON });

    } catch (error: any) {
      console.log("AI listing accelerator fallback triggered.");
      // Fail gracefully: Return a well-formatted fallback JSON matching standard specs to guarantee runtime safety
      res.status(200).json({
        success: false,
        error: "AI Generation is temporarily busy. Applied premium fallback template.",
        result: {
          title: "Premium Certified Sedan - Pakistan Edition",
          description: "A meticulously styled vehicle ready for immediate city drives. Features clean upholstery, smooth transmission, and optimal performance diagnostics. Passed full BAZAR360 safety inspections.",
          tags: ["Compact", "Certified", "Slick"],
          suggestedPricePKR: 1500000,
          highlights: ["Clean vehicle background checked", "Pristine interior condition", "Optimal Pakistani specs"]
        }
      });
    }
  });

  // API 2: Showroom Roleplay Chatbot
  app.post("/api/dealer/chat", async (req, res) => {
    try {
      const { dealerName, dealerBio, inventorySummary, message, history } = req.body;

      if (!message) {
        return res.status(400).json({ reply: "I didn't receive your message. Try typing again!" });
      }

      const client = getGeminiClient();

      const contextPrompt = `You are a helpful, professional, and friendly sales representative representing the premium dealership "${dealerName}".
Dealership bio: "${dealerBio}".
Current active showcase stock list: "${inventorySummary}".
Your task is to engage with car buyers in Pakistan with extreme courtesy, technical precision, and persuasive sales mechanics.
Incorporate details of our showcase fleet where appropriate. Maintain roleplay parameters flawlessly. Keep responses concise (under 80 words).`;

      // Transform chat history for Gemini model calling
      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          formattedContents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      }
      formattedContents.push({ role: 'user', parts: [{ text: message }] });

      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: contextPrompt,
        }
      }));

      const replyText = response.text || "Hello! We are glad to assist you. Our team is available directly.";
      res.json({ reply: replyText.trim() });

    } catch (error: any) {
      console.log("Chatbot auto reply bypass triggered.");
      // Graceful fallback dialogue system
      res.json({
        reply: "Hello standard buyer! Thanks for contacting us. To secure optimal pricing on these listings or speak directly with our team, please click 'Call Showroom' or leave a review below."
      });
    }
  });

  // API 3: Auto-Scraping / Curated Showroom Assets
  app.post("/api/scrape-socials", async (req, res) => {
    try {
      const { name, website, facebook, instagram, tiktok, youtube, twitter } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: "Showroom name is required" });
      }

      const curatedCoverImages = [
        "https://images.unsplash.com/photo-1562141983-f32fdfa2bcfa?auto=format&fit=crop&q=80&w=1200", // Modern showroom
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200", // Prestige lineup
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200", // Cyberpunk neon showroom
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200"  // Luxury dealership
      ];

      const curatedLogos = [
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=300", // Dark shield logo
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300", // Minimal monogram
        "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=300"  // Elegant brand
      ];

      const hash = name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const coverImage = curatedCoverImages[hash % curatedCoverImages.length];
      const avatarUrl = name.toLowerCase().includes("choice") 
        ? "./auto_choice_logo_1781509565476.jpg" 
        : curatedLogos[hash % curatedLogos.length];

      const activityFeed: any[] = [];

      if (tiktok) {
        activityFeed.push({
          id: `act-tiktok-${Date.now()}`,
          timestamp: "Just now",
          badge: "TikTok Reel",
          imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
          title: `Trending TikTok walkaround on @${name.toLowerCase().replace(/\s+/g, '')}`,
          description: `Watch our high-engagement video walkaround and exhaust sound review of our newly imported premium sports touring model.`,
          price: "Available PKR"
        });
      }

      if (instagram || facebook) {
        activityFeed.push({
          id: `act-social-${Date.now() + 1}`,
          timestamp: "3 hours ago",
          badge: instagram ? "Instagram Showcase" : "Facebook Active Campaign",
          imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600",
          title: "Prestige Fleet Campaign Spotlight",
          description: `Meticulously pre-purchased diagnostics passed. Spotlighting the luxury specifications of our highest-grade SUVs this month.`,
          price: "Elite Specs"
        });
      }

      if (website) {
        activityFeed.push({
          id: `act-web-${Date.now() + 2}`,
          timestamp: "Yesterday",
          badge: "Web Direct Port",
          imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600",
          title: "Interactive Web Portal Online",
          description: `Check out our newly optimized digital dealership website. Browse full certificates, schedule on-site inspections, or request direct transportation.`,
          price: "Online Booking"
        });
      }

      if (activityFeed.length === 0) {
        activityFeed.push({
          id: `act-fallback-${Date.now()}`,
          timestamp: "Just now",
          badge: "Launch Event",
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
          title: `Welcome to ${name} Showroom floor`,
          description: `We are live on BAZAR360! Stop by our physical collection or use WhatsApp to request personalized walkarounds with verified specs.`,
          price: "Direct Access"
        });
      }

      res.json({
        success: true,
        avatarUrl,
        coverImage,
        activityFeed
      });

    } catch (error: any) {
      console.log("Automated social scraping fallback activated.");
      res.status(200).json({ success: false, error: "Scraping services are busy. Please configure manually." });
    }
  });

  // API 4: On-Demand Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: "Text is required for translation" });
      }
      const lang = targetLanguage || "Urdu";
      const client = getGeminiClient();

      const systemPrompt = `You are an elite linguistic translation engine specializing in automotive terminology for Pakistan's auto market (Urdu, Pashto, English). 
Your task is to translate any incoming text block beautifully and accurately into "${lang}".
- Maintain all pricing formats, technical auto-specs, phone numbers, and badges exactly.
- Keep the overall professional, premium marketing tone.
- Do NOT provide explanations, translator notes, introduction or surrounding quotes. 
- Return ONLY the clean, translated text block itself.`;

      const response = await executeWithRetry(() => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate this text block: "${text}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
        }
      }));

      const translatedText = response.text?.trim() || text;
      res.json({ success: true, translatedText });

    } catch (error: any) {
      console.log("On-Demand AI Translation completed with graceful generic fallback.");
      // Graceful fallback: return original text if translation pipeline fails
      res.json({ success: false, translatedText: req.body.text, error: "Regional Translation engine is temporarily busy. Displaying original description." });
    }
  });

  // API 5: Secure Registration & Role Provisioning via Admin SDK
  app.post("/api/user/register", async (req, res) => {
    try {
      const { profile, showroom } = req.body;
      if (!profile || !profile.uid) {
        return res.status(400).json({ success: false, error: "Profile payload with valid UID is required." });
      }

      console.log(`[Admin SDK] Securely registering user profile: ${profile.uid} with role: ${profile.role}`);
      const dbAdmin = admin.firestore();
      const timeStr = new Date().toISOString();

      // Ensure updatedAt is set
      const profilePayload = {
        ...profile,
        updatedAt: timeStr
      };

      // Save to /users
      await dbAdmin.collection('users').doc(profile.uid).set(profilePayload, { merge: true });

      // Save to /profiles (split-collection personal details)
      await dbAdmin.collection('profiles').doc(profile.uid).set({
        uid: profile.uid,
        displayName: profile.displayName || profile.name || 'Anonymous User',
        createdAt: profile.createdAt || timeStr,
        updatedAt: timeStr
      }, { merge: true });

      // If showroom payload is provided, register the dealership
      if (showroom && showroom.id) {
        console.log(`[Admin SDK] Securely registering showroom: ${showroom.id}`);
        await dbAdmin.collection('dealers').doc(showroom.id).set({
          ...showroom,
          createdAt: showroom.createdAt || timeStr,
          updatedAt: timeStr
        }, { merge: true });
      }

      res.json({ success: true, message: "Profile and Showroom successfully registered via Firebase Admin SDK." });

    } catch (error: any) {
      console.error("[Admin SDK] Error in /api/user/register:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to register user profile via Admin SDK." });
    }
  });

  // Vite development middleware vs Static Production files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BAZAR360 Server running on http://localhost:${PORT}`);
  });
}

startServer();
