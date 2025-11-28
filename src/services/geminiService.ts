import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { TaskConfig, AIResult, ReactionResult } from "../types";

// API Keyni tekshirish va Clientni yaratish
// DIQQAT: .env faylingizda VITE_GEMINI_API_KEY yoki REACT_APP_GEMINI_API_KEY borligiga ishonch hosil qiling
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeReaction = async (reactants: string[]): Promise<ReactionResult> => {
  // Agar API kalit yo'q bo'lsa, eski soxta mantiqqa qaytadi (Demo uchun)
  if (!apiKey) {
    console.warn("API Key topilmadi, demo rejim ishga tushdi.");
    return new Promise((resolve) => {
      const isWater = reactants.includes('Vodorod') && reactants.includes('Kislorod');
      setTimeout(() => {
        if (isWater) {
          resolve({
            possible: true,
            reaction_type: "Sintez",
            explanation: "Vodorod va Kislorod portlash bilan reaksiyaga kirishib, suv hosil qiladi.",
            products: ["H₂O (Suv)"],
            visualization_plan: {
              template: "flash_bubbles",
              duration_ms: 3000,
              colors: ["#3b82f6", "#ffffff"],
              effects: { bubbles: { enabled: true }, flash: { enabled: true }, crystals: { enabled: false } },
              recommended_3d_assets: { product_model: "h2o" }
            }
          });
        } else {
          resolve({
            possible: false,
            explanation: "API Kaliti yo'q. Iltimos, .env faylga kalitni qo'shing.",
            why_no_reaction: "Demo rejimda faqat Suv reaksiyasi ishlaydi.",
            products: [],
            visualization_plan: {
              template: "none",
              duration_ms: 1000,
              colors: [],
              effects: { bubbles: { enabled: false }, flash: { enabled: false }, crystals: { enabled: false } },
              recommended_3d_assets: { product_model: null }
            }
          });
        }
      }, 1000);
    });
  }

  // --- HAQIQIY AI MANTIQI ---
  
  const prompt = `
    You are a Chemistry Engine for an educational game.
    User inputs: ${reactants.join(", ")}.
    
    Task: Simulate a reaction between these elements under IDEAL CONDITIONS.
    
    CRITICAL RULES:
    1. **IDEAL CONDITIONS:** Assume necessary heat, pressure, or catalysts exist. 
       - Example: Hydrogen + Nitrogen -> Ammonia (NH3) is POSSIBLE.
       - Example: Hydrogen + Oxygen -> Water (H2O) is POSSIBLE.
    2. **STRICT CHEMISTRY:** Only say "possible: false" if they are Noble Gases (He, Ne) or totally inert combinations (e.g. Gold + Silver).
    3. **OUTPUT LANGUAGE:** UZBEK (O'zbek tili).
    4. **3D MODEL:** For 'product_model', strictly return one of: 'h2o', 'nh3' (for Ammonia), 'co2', 'nacl', or 'generic'.
    
    Analyze the reaction and return the result matching the JSON schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Yoki 'gemini-2.0-flash'
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possible: { type: Type.BOOLEAN },
            reaction_type: { type: Type.STRING, description: "e.g., Sintez, Oksidlanish" },
            products: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING, description: "Short explanation in Uzbek" },
            why_no_reaction: { type: Type.STRING, nullable: true },
            visualization_plan: {
              type: Type.OBJECT,
              properties: {
                template: { type: Type.STRING },
                duration_ms: { type: Type.NUMBER },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommended_3d_assets: {
                  type: Type.OBJECT,
                  properties: {
                    product_model: { type: Type.STRING, nullable: true }
                  }
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

    // Javobni olish va qaytarish
    const resultText = response.text();
    if (!resultText) throw new Error("AI Empty Response");
    
    const parsedResult = JSON.parse(resultText) as ReactionResult;
    return parsedResult;

  } catch (error) {
    console.error("Gemini Reaction Error:", error);
    // Xatolik bo'lsa fallback
    return {
      possible: false,
      products: [],
      explanation: "Tizimda xatolik yuz berdi yoki kvota tugadi.",
      why_no_reaction: "Server bilan aloqa uzildi.",
      visualization_plan: {
        template: "none",
        duration_ms: 1000,
        colors: [],
        recommended_3d_assets: { product_model: null },
        effects: { bubbles: { enabled: false }, flash: { enabled: false }, crystals: { enabled: false } }
      }
    };
  }
};

// --- HINT FUNKSIYASI (O'zgarishsiz qoldi, faqat API check qo'shildi) ---
export const getAIHint = async (
  taskConfig: TaskConfig,
  currentParams: Record<string, number>,
  level: 'nudge' | 'guide' | 'explain'
): Promise<string> => {
  if (!apiKey) return "AI yordamchisi uchun API kalit kerak.";

  const prompt = `
    You are a friendly science tutor.
    Task: ${taskConfig.instructions}
    State: ${JSON.stringify(currentParams)}
    Goal: ${taskConfig.targetValue}
    Level: ${level}.
    Output: Short hint in Uzbek language. Max 20 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text || "Hozircha yordam berolmayman.";
  } catch (error) {
    return "Tarmoq xatosi.";
  }
};

// --- BAHOLASH FUNKSIYASI ---
export const gradeTaskWithAI = async (
  taskConfig: TaskConfig,
  finalParams: Record<string, number>,
  timeTaken: number
): Promise<AIResult> => {
  if (!apiKey) {
    return { score: 100, explanation: "Demo rejim: Zo'r natija!", confidence: 1 };
  }

  const prompt = `
    Evaluate student performance.
    Subject: ${taskConfig.type}
    Goal: ${taskConfig.instructions}
    Target: ${taskConfig.targetValue}
    Student State: ${JSON.stringify(finalParams)}
    Time: ${timeTaken}s.

    Return JSON with score (0-100) and explanation (in Uzbek).
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
            score: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["score", "explanation", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      score: result.score || 0,
      explanation: result.explanation || "Baholashda xatolik.",
      confidence: result.confidence || 0,
    };
  } catch (error) {
    console.error("Grading Error", error);
    return { score: 0, explanation: "Tizim xatosi", confidence: 0 };
  }
};