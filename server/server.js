import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import transcribeRoutes from "./routes/transcribeRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration for both development and production
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative dev
    "https://mern-whisper-transcriber-njuyrstdq-anshuman-panigrahs-projects.vercel.app", // Production
    "https://mern-whisper-transcriber.vercel.app" // Alternative production domain
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

app.use(express.json());

console.log("Environment loaded:", {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  HAS_MONGO_URI: !!process.env.MONGO_URI,
  HAS_JWT_SECRET: !!process.env.JWT_SECRET,
  HAS_ASSEMBLYAI_KEY: !!process.env.ASSEMBLYAI_API_KEY,
});

// MongoDB Connection
console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("MONGO_URI:", process.env.MONGO_URI ? "Configured" : "NOT CONFIGURED");
  });

// Auth Routes
app.use("/api/auth", authRoutes);

// Transcribe Routes
app.use("/api/transcribe", transcribeRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Serve static files from client build
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// SPA Fallback: Serve index.html for all non-API routes (React Router handling)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});