import { GoogleGenAI, Type } from "@google/genai";
import { TaskConfig, AIResult, ReactionResult } from "../types";
import { LOCAL_REACTIONS, NO_REACTION_TEMPLATE } from "../data/reactionDatabase";

// API Keyni tekshirish
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey: apiKey });

// --- 1. REAKSIYANI TAHLIL QILISH ---
export const analyzeReaction = async (reactants: string[]): Promise<ReactionResult> => {
  const sortedKey = [...reactants].sort().join('-');

  // 1. Lokal bazani tekshirish
  if (LOCAL_REACTIONS[sortedKey]) {
    console.log(`Lokal bazadan topildi: ${sortedKey}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return LOCAL_REACTIONS[sortedKey];
  }

  // 2. API Key yo'q bo'lsa fallback
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
            ...NO_REACTION_TEMPLATE,
            explanation: "Demo rejim: API kalit yo'q. Iltimos, lokal bazadagi elementlardan foydalaning (H + O, Na + Cl)."
          });
      }, 1000);
    });
  }

  // 3. AI orqali tekshirish
  const prompt = `
    You are a Chemistry Engine. User inputs: ${reactants.join(", ")}.
    Task: Simulate reaction under IDEAL conditions.
    Output Language: UZBEK.
    Return JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possible: { type: Type.BOOLEAN },
            reaction_type: { type: Type.STRING },
            products: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            why_no_reaction: { type: Type.STRING, nullable: true },
            visualization_plan: {
              type: Type.OBJECT,
              properties: {
                template: { type: Type.STRING },
                duration_ms: { type: Type.NUMBER },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommended_3d_assets: {
                  type: Type.OBJECT,
                  properties: { product_model: { type: Type.STRING, nullable: true } }
                },
                effects: {
                   type: Type.OBJECT,
                   properties: {
                       bubbles: { type: Type.OBJECT, properties: { enabled: {type: Type.BOOLEAN} } },
                       flash: { type: Type.OBJECT, properties: { enabled: {type: Type.BOOLEAN} } },
                       crystals: { type: Type.OBJECT, properties: { enabled: {type: Type.BOOLEAN} } }
                   }
                }
              }
            }
          },
          required: ["possible", "products", "explanation", "visualization_plan"]
        }
      }
    });

    const resultText = response.text();
    if (!resultText) throw new Error("Empty Response");
    return JSON.parse(resultText) as ReactionResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      possible: false,
      products: [],
      explanation: "Xatolik yuz berdi.",
      visualization_plan: { template: "none", duration_ms: 0, colors: [], recommended_3d_assets: { product_model: null }, effects: {} as any }
    };
  }
};

// --- 2. HINT BERISH ---
export const getAIHint = async (
  taskConfig: TaskConfig,
  currentParams: Record<string, number>,
  level: 'nudge' | 'guide' | 'explain'
): Promise<string> => {
  if (!apiKey) return "Demo rejim: Maslahat olish uchun API kalit kerak.";

  const prompt = `Tutor task: ${taskConfig.instructions}. State: ${JSON.stringify(currentParams)}. Level: ${level}. Language: Uzbek. Short hint.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text() || "Yordam mavjud emas.";
  } catch (error) {
    return "Tarmoq xatosi.";
  }
};

// --- 3. BAHOLASH ---
export const gradeTaskWithAI = async (
  taskConfig: TaskConfig,
  finalParams: Record<string, number>,
  timeTaken: number
): Promise<AIResult> => {
  if (!apiKey) return { score: 100, explanation: "Demo rejim: Zo'r natija!", confidence: 1 };

  const prompt = `Evaluate task: ${taskConfig.instructions}. Target: ${taskConfig.targetValue}. Student State: ${JSON.stringify(finalParams)}. Time: ${timeTaken}. Language: Uzbek. Return JSON: {score, explanation, confidence}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
            }
        }
      },
    });
    const text = response.text();
    return JSON.parse(text || '{}');
  } catch (error) {
    return { score: 0, explanation: "Xatolik.", confidence: 0 };
  }
};

// --- 4. LABORANT CHAT (YANGI QO'SHILDI) ---
export const askLabAssistant = async (
  message: string, 
  contextData: string, 
  history: { role: string, content: string }[]
): Promise<string> => {
  
  // Agar API kalit yo'q bo'lsa
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `(Demo Rejim) Siz "${message}" deb so'radingiz. Afsuski, menda hozircha haqiqiy miya (API Key) yo'q, shuning uchun faqat oldindan yozilgan javoblarni ayta olaman.`;
  }

  try {
    // Chat tarixini va kontekstni shakllantiramiz
    const prompt = `
      Role: You are a helpful Biology Lab Assistant for a student.
      Context: The student is currently working on: ${contextData}.
      Language: Uzbek (O'zbek tili).
      Tone: Encouraging, scientific, educational, concise.
      User Question: ${message}
      
      Answer the user's question based on the experiment context provided. Keep it short (max 3 sentences).
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    return result.response.text();
  } catch (error) {
    console.error("Lab Assistant Error:", error);
    return "Kechirasiz, server bilan bog'lanishda xatolik yuz berdi. Internetni tekshiring.";
  }
};