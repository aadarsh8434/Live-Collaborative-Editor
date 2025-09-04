import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Gemini API roles are 'user' and 'model'
type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body as { messages: ChatMsg[] };
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(200).json({
      reply: "⚠️ Missing GEMINI_API_KEY. Add it in .env.local and restart.",
    });
  }

  try {
    // Convert the chat history into the correct format for the Gemini API
    const contents = messages.map((msg) => ({
      // Map 'assistant' to 'model' for Gemini
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents,
      }
    );

    const reply =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "(no reply from Gemini)";

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Gemini API error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Gemini API request failed" });
  }
}
