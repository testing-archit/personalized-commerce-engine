import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-1.5-flash-001";

export async function generateShoppingQuestions(initialQuery) {
    const prompt = `
    You are an intelligent shopping assistant.
    The user is looking for: "${initialQuery || "something"}".
    
    Generate 3-4 qualifying questions to help narrow down their search.
    One of the questions MUST be about their price range or budget.
    
    Return the output as a JSON array of strings. 
    Example: ["Question 1?", "Question 2?", "What is your budget?"]
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json", // efficient json mode
            }
        });

        const text = response.text ? response.text.trim() : "";
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating questions:", error);
        return [
            "What specific features are you looking for?",
            "Do you have a preferred brand?",
            "What is your budget for this purchase?"
        ];
    }
}

export async function generateProductKeywords(userAnswers) {
    const prompt = `
    You are an intelligent shopping assistant.
    Based on the following user preferences, generate exactly 5 distinct search keywords or short phrases that I can feed into Amazon's search engine.
    
    User Preferences:
    ${JSON.stringify(userAnswers)}
    
    Return the output as a JSON array of strings.
    Example: ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text ? response.text.trim() : "";
        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating keywords:", error);
        return [];
    }
}
