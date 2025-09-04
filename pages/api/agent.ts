import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

/**
 * Lightweight Agent (Tavily + Gemini)
 * - Calls Tavily Search API (set TAVILY_API_KEY in .env.local)
 * - Summarizes results using Gemini (set GEMINI_API_KEY in .env.local)
 * Request body: { query: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body as { query: string };
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!TAVILY_API_KEY) {
    return res
      .status(200)
      .json({ result: "⚠️ Missing TAVILY_API_KEY. Add it in .env.local." });
  }

  try {
    // 🔎 Tavily Search
    const search = await axios.post("https://api.tavily.com/search", {
      api_key: TAVILY_API_KEY,
      query,
      search_depth: "basic",
      include_answer: true,
      include_images: false,
      include_raw_content: false,
      max_results: 5,
    });

    const answer = search.data?.answer || "";
    const results = search.data?.results || [];

    // If Gemini key missing → just return raw Tavily results
    if (!GEMINI_API_KEY) {
      return res.status(200).json({
        result: `Search results (no Gemini summary):\n\n${answer}\n\nTop links:\n${results
          .map((r: any, i: number) => `${i + 1}. ${r.title} - ${r.url}`)
          .join("\n")}`,
      });
    }

    // 📌 Build context for Gemini
    const context = `Summarize the following search results in 4-6 bullet points and a short paragraph:\n\n${results
      .map((r: any) => `Title: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.url}`)
      .join("\n\n")}`;

    // 🤖 Call Gemini
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `Query: ${query}\n\n${context}` }],
          },
        ],
      }
    );

    const summary =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || answer;

    return res.status(200).json({ result: summary });
  } catch (e: any) {
    console.error(e?.response?.data || e.message);
    return res.status(500).json({ error: "Agent failed" });
  }
}
