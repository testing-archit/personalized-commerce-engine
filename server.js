import "dotenv/config";
import express from "express";
import { searchAmazonProducts } from "./amazonClient.js";
import {
    generateShoppingQuestions,
    generateProductKeywords
} from "./geminiClient.js";

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- Existing Endpoint ---
app.post("/mcp/amazon/search", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "query required" });

        const searchResult = await searchAmazonProducts(query);
        const products = searchResult.products.map(p => ({
            title: p.title,
            price: p.price,
            image: p.imageUrl,
            url: p.url
        }));

        res.json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Amazon API error", details: err.message });
    }
});

// --- New Endpoints ---

// 1. Start Interview: Get 3-4 questions based on initial intent
app.post("/mcp/gemini/interview/start", async (req, res) => {
    try {
        const { initialQuery } = req.body; // e.g., "I want a gaming laptop"
        const questions = await generateShoppingQuestions(initialQuery);
        res.json({ questions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gemini API error", details: err.message });
    }
});

// 2. Process Interview: Get keywords -> Search Amazon -> Return consolidated results
app.post("/mcp/gemini/interview/process", async (req, res) => {
    try {
        // Expecting: { answers: { "Question 1?": "Answer 1", ... } } OR just an array/string of context
        const { answers } = req.body;

        if (!answers) return res.status(400).json({ error: "answers required" });

        // Step 1: Generate Keywords
        const keywords = await generateProductKeywords(answers);
        console.log("Generated Keywords:", keywords);

        if (!keywords || keywords.length === 0) {
            return res.status(422).json({ error: "Failed to generate keywords from answers." });
        }

        // Step 2: Search Amazon for each keyword (Limit to 5 keywords as requested)
        const searchPromises = keywords.slice(0, 5).map(async (kw) => {
            try {
                const searchResult = await searchAmazonProducts(kw);
                const items = searchResult.products.map(p => ({
                    title: p.title,
                    price: p.price,
                    image: p.imageUrl,
                    url: p.url
                }));
                return {
                    keyword: kw,
                    items: items
                };
            } catch (error) {
                console.error(`Search failed for keyword "${kw}":`, error.message);
                return { keyword: kw, items: [], error: error.message };
            }
        });

        const results = await Promise.all(searchPromises);

        res.json({ results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Processing error", details: err.message });
    }
});

// Export for Vercel
export default app;

// Only listen if run directly (local development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () =>
        console.log(`Amazon MCP server running on port ${PORT}`)
    );
}
