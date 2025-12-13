import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExplanationResult, ScamAnalysisResult, SchemeResult, FomoAnalysisResult } from "../types";

// Helper to get a fresh instance, important for API key updates
const getAIClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const explainConcept = async (concept: string): Promise<ExplanationResult> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain the financial concept "${concept}" to a beginner. Use a friendly, vibrant Indian English tone, drawing metaphors from Indian daily life (e.g., local markets, cricket, festivals, family weddings, chai shops, Bollywood). Be enthusiastic, slightly dramatic, and wise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            simpleDefinition: { type: Type.STRING, description: "A simple, clear definition." },
            analogy: { type: Type.STRING, description: "A colorful, culturally relevant Indian analogy." },
            keyTakeaway: { type: Type.STRING, description: "One punchy 'Filmy' dialogue style takeaway." }
          },
          required: ["concept", "simpleDefinition", "analogy", "keyTakeaway"]
        },
        systemInstruction: "You are 'Guru-ji', a wise and colorful financial advisor from a bustling Indian market. You love metaphors, you speak with warmth and flair, and you want everyone to have 'Paisa Vasool' (value for money). Your style is like a vintage bollywood poster: bold, dramatic, and memorable."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExplanationResult;
    }
    
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Arey yaar! The connection is loose like a kite string. Try again!");
  }
};

export const analyzeScheme = async (schemeDescription: string): Promise<ScamAnalysisResult> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this financial offer for a rural Indian user: "${schemeDescription}". Check for signs of Ponzi schemes, fake promises, or unrealistic returns. Compare it to safe government schemes like Post Office or SBI FD.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
            verdict: { type: Type.STRING, description: "Short verdict like 'Fake!', 'Be Careful', or 'Safe'." },
            explanation: { type: Type.STRING, description: "Simple explanation in Hinglish/Indian English about why it is risky." },
            safeComparison: { type: Type.STRING, description: "Comparison with a real benchmark (e.g., 'Post Office gives 7%, this claims 20% - Impossible')." }
          },
          required: ["riskLevel", "verdict", "explanation", "safeComparison"]
        },
        systemInstruction: "You are a strict financial guard protecting innocent people from scams. If the return is over 12-15% per year guaranteed, mark it HIGH RISK immediately. Be blunt and protective."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScamAnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Scam Detector Error:", error);
    throw new Error("Could not analyze. Please ask a bank official.");
  }
};

export const findSchemes = async (profile: any): Promise<SchemeResult[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find 3 best Indian government schemes for a person with this profile: 
      Age: ${profile.age}, Gender: ${profile.gender}, Caste/Category: ${profile.category}, BPL Card Holder: ${profile.bpl ? 'Yes' : 'No'}, State: ${profile.state}.
      Focus on schemes like Lakhpati Didi, Widow Pension, PM Awas Yojna, Sukanya Samriddhi, etc.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              benefit: { type: Type.STRING, description: "What do they get? e.g. '₹2000 per month'" },
              eligibility: { type: Type.STRING, description: "Short eligibility criteria." },
              applicationSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 simple steps to apply." }
            },
            required: ["name", "benefit", "eligibility", "applicationSteps"]
          }
        },
        systemInstruction: "You are 'Scheme Didi', helping rural Indians find government benefits. Only suggest currently active, real schemes. Keep descriptions simple and in English/Hinglish."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SchemeResult[];
    }
    return [];
  } catch (error) {
    console.error("Scheme Didi Error:", error);
    return [];
  }
};

export const analyzeSalarySlip = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<{gross: number, basic: number, hraReceived: number, investments80C: number}> => {
  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
            { text: "Extract annual salary details from this payslip. If values are monthly, multiply by 12. Return 0 for missing fields." },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                gross: { type: Type.NUMBER },
                basic: { type: Type.NUMBER },
                hraReceived: { type: Type.NUMBER },
                investments80C: { type: Type.NUMBER }
            },
            required: ["gross", "basic", "hraReceived", "investments80C"]
        }
      }
    });

    return JSON.parse(response.text!) as any;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Could not read the payslip. Please try a clearer image.");
  }
};

export const analyzeFomo = async (query: string): Promise<FomoAnalysisResult> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this investment "tip" or query for FOMO (Fear Of Missing Out) and risk: "${query}".
      Assume the user is an urban Indian woman with a 'Balanced' risk profile who prefers long-term wealth over gambling.
      Check for: High volatility, speculative assets (Crypto, F&O), unverified tips, or "get rich quick" vibes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Short verdict e.g. 'Pure Hype', 'High Risk', 'Safe Bet'" },
            riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            analysis: { type: Type.STRING, description: "Rational explanation of the risks involved. Mention if it skews her risk profile." },
            recommendation: { type: Type.STRING, description: "A safer, boring but effective alternative (like Nifty 50 SIP, Gold SGB)." }
          },
          required: ["verdict", "riskLevel", "analysis", "recommendation"]
        },
        systemInstruction: "You are a 'Rational Risk Manager' and a wise elder sister. You filter out 'hot tips' from colleagues or influencers. You prioritize capital protection and steady compounding. Be direct."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FomoAnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("FOMO Analysis Error:", error);
    throw new Error("Could not analyze this tip.");
  }
};

// --- New Voice Features ---

export const askDidi = async (query: string, language: string = 'en'): Promise<string> => {
  try {
    const ai = getAIClient();
    const systemPrompt = `You are 'Didi', a helpful, older sister figure who explains money matters to rural Indian women. 
    Keep your answers extremely short (max 2-3 sentences). 
    Use simple words. 
    Mix English with Hindi words (Hinglish) naturally if the language is English/Hindi to make it relatable. 
    Be encouraging and warm.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Sorry, I didn't catch that properly.";
  } catch (error) {
    console.error("Didi Error:", error);
    return "Ah, network issue! Please ask again.";
  }
};

export const chatWithDidi = async (
  history: { role: 'user' | 'model'; text: string }[],
  message: string,
  mode: 'saral' | 'smart',
  image?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    const ai = getAIClient();
    const systemPrompt = mode === 'saral' 
      ? "You are 'Didi', a helpful, older sister figure who explains money matters to rural Indian women. Keep answers short, simple, and in Hinglish."
      : "You are 'Didi', a smart, savvy financial assistant for modern Indian women. You are witty, use finance terms but keep it accessible. You are like a 'Fin-fluencer' friend.";

    // Construct parts for the current turn
    const currentParts: any[] = [{ text: message }];
    if (image) {
        currentParts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }

    // Construct full conversation for generateContent (stateless request)
    // Note: history contains previous turns.
    const contents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));
    
    // Add current user message
    contents.push({
        role: 'user',
        parts: currentParts
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I'm listening, but can't speak right now.";
  } catch (error) {
    console.error("Chat Didi Error:", error);
    return "Network issue! Let's try that again.";
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' has a nice warm tone
          },
        },
      },
    });

    // Extract base64 audio data
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error("No audio data generated");
    }

    return audioData;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};