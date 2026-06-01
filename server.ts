import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini Client is initialized safely
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "marketplace-30272" });
  });

  // API 2: Gemini Analysis and Chat Q&A
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { prompt, contextData, systemInstruction } = req.body;

      if (!ai) {
        return res.status(403).json({ 
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets." 
        });
      }

      const promptContext = contextData 
        ? `\n\n--- DATA KONTEKS PROYEK ---\n${JSON.stringify(contextData, null, 2)}\n-------------------------\n\n`
        : "";

      const fullPrompt = `${promptContext}${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: systemInstruction || "Anda adalah AI Assistant FORSDIG dari PT. Foresyndo Global Indonesia, seorang pakar analisis manajemen konstruksi, ERP, dan audit proyek. Berikan jawaban dalam Bahasa Indonesia yang profesional dan ringkas.",
          temperature: 0.2
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Terjadi kesalahan pada Gemini AI" });
    }
  });

  // Integrate Vite dev server middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server FORSDIG Construction ERP running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
