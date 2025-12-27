import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

export async function generateQuestions(initialQuery) {
    const prompt = `
You are a shopping assistant.
User wants: "${initialQuery}"

Generate 3–4 qualifying questions.
One MUST ask about budget.
Return ONLY a JSON array of strings.
`;

    const res = await ai.models.generateContent({
        model: MODEL,
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const text = res.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");

    return JSON.parse(text);
}

export async function generateKeywords(answers) {
    const prompt = `
Based on these answers:
${JSON.stringify(answers)}

Generate EXACTLY 5 Amazon search keywords.
Return ONLY JSON array of strings.
`;

    const res = await ai.models.generateContent({
        model: MODEL,
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const text = res.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");

    return JSON.parse(text);
}
