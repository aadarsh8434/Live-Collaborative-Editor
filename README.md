# Live Collaborative Editor (Test Assignment)

A minimal Next.js app that includes:
- Rich text **Editor** (tiptap)
- **Chat Sidebar** that talks to an AI model
- **Floating Toolbar** on text selection for AI-powered edits (shorten/lengthen/convert to table)
- **Bonus**: simple Agent API that does web search and (optionally) summarizes

> Built with plain CSS (no Tailwind).

---

## 1) Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

## 2) Environment Variables

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your_openai_api_key_here
# Optional for the Agent API (bonus)
TAVILY_API_KEY=your_tavily_api_key_here
```

- You can get an OpenAI key from https://platform.openai.com/
- You can get a Tavily key from https://tavily.com/ (or replace agent route with your preferred search API)

## 3) Features

### Editor (tiptap)
- Basic formatting (H2, Bold, Italic, Bullet list).

### Chat Sidebar
- Sends conversation to `/api/chat` (OpenAI Chat Completions).
- If the API returns an `edit` field, it will replace the editor content.

### Floating Toolbar
- Select any text to reveal an AI tools menu.
- Options: **Edit with AI**, **Shorten**, **Lengthen**, **Convert to Table**.
- Preview is shown inline with **Confirm**/**Cancel**.

### Bonus Agent
- POST `/api/agent` with `{ "query": "Find latest news on Next.js 15" }`.
- Calls **Tavily** for web results and (if `OPENAI_API_KEY` is present) returns a clean summary.

## 4) Deploy

### Vercel
- Push the folder to GitHub.
- Create a new Vercel project, import repo.
- Set env vars in **Project Settings → Environment Variables**.
- Deploy.

## 5) Notes

- This is not production-grade. It’s intentionally small and readable for a 6-hour assignment.
- Styling uses plain CSS for portability.
- If you want Tailwind or Gemini instead, it’s easy to swap.
