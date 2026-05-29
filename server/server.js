import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import transcribeRoutes from "./routes/transcribeRoutes.js";

dotenv.config();

const app = express();

// CORS Configuration - allow all origins for deployment flexibility
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

console.log("Environment loaded:", {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  HAS_MONGO_URI: !!process.env.MONGO_URI,
  HAS_JWT_SECRET: !!process.env.JWT_SECRET,
  HAS_ASSEMBLYAI_KEY: !!process.env.ASSEMBLY_API_KEY,
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

// Root route
app.get("/", (req, res) => {
  res.json({ message: "AuraScribe API is running" });
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});