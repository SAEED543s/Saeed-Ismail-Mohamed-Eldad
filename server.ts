import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialization for Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Enhance or generate cinematic video prompts with Gemini
app.post("/api/gemini/enhance-prompt", async (req, res) => {
  try {
    const { basePrompt, style, cameraMove } = req.body;
    const ai = getGenAI();
    const prompt = `You are an elite cinematic director and VFX specialist for medical robotics.
Expand the following user prompt for high-end AI video models (like Veo, Sora, Runway Gen-3):
Base description: "${basePrompt || 'Hospital logistics robot receiving and scanning a lab sample tube'}"
Style preference: "${style || 'Photorealistic 4K cinematic medical laboratory'}"
Camera motion: "${cameraMove || 'Slow push-in medium shot'}"

Return a JSON object with:
1. "veoPrompt": Highly optimized 80-120 word prompt with exact lighting, lens, colors, motion, and subject details.
2. "cameraSpecs": { "lens": string, "movement": string, "lighting": string, "colorPalette": string }
3. "audioCues": array of 3-4 sound design cues (e.g. "Low frequency base motor hum", "Crisp laser sweep chirp", "Pleasant dual-tone confirmation chime", "Soft mechanical latch seal")
4. "directorNotes": string giving professional tips for achieving photorealism in this hospital robotics shot.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error enhancing prompt:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to enhance prompt" });
  }
});

// 3. Veo video generation endpoint
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", resolution = "720p", model = "veo-3.1-lite-generate-preview" } = req.body;
    const ai = getGenAI();

    const finalPrompt = prompt || `A compact hospital logistics robot, about 1.2 meters tall, matte white and dark navy-blue chassis, cylindrical body on a wheeled mobile base, a front-facing camera lens embedded above a small status screen, a secure latched sample compartment on top with a small digital temperature display on its side, a soft blue LED strip along its base that pulses gently, clean rounded professional industrial design like a modern hospital service robot. Photorealistic, 4K, cinematic lighting, shallow depth of field. Interior of a modern hospital sample preparation room, clean white walls, medical shelving with labeled sample tubes in the background. A gloved hand places a small sealed lab sample tube with a printed QR code label onto the robot's open compartment tray. The robot's front camera lens emits a brief soft blue scanning light sweeping across the QR code, then its small screen flashes a green checkmark. Medium shot, slow push-in camera movement, soft overhead LED lighting.`;

    const operation = await ai.models.generateVideos({
      model: model === "veo-3.1-generate-preview" ? "veo-3.1-generate-preview" : "veo-3.1-lite-generate-preview",
      prompt: finalPrompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution === "1080p" ? "1080p" : "720p",
        aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
      },
    });

    res.json({ success: true, operationName: operation.name });
  } catch (error: any) {
    console.error("Error initiating video generation:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to start video generation" });
  }
});

// 4. Veo video operation polling
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: "Missing operationName" });
    }
    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      success: true,
      done: !!updated.done,
      error: updated.error || null,
      videoUri: updated.response?.generatedVideos?.[0]?.video?.uri ? true : false,
    });
  } catch (error: any) {
    console.error("Error checking video status:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to check video status" });
  }
});

// 5. Veo video download proxy
app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: "Missing operationName" });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY missing" });
    }
    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ success: false, error: "Video URI not ready or available" });
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ success: false, error: "Failed to download video stream from upstream" });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'inline; filename="hospital_robot_sequence.mp4"');

    if (videoRes.body) {
      // @ts-ignore
      const reader = videoRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error("Error streaming video:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to download video" });
  }
});

async function startServer() {
  // Vite middleware in dev, static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hospital Logistics Robot Server running on port ${PORT}`);
  });
}

startServer();
