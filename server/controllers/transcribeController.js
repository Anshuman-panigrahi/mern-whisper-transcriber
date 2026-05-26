import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AssemblyAI } from "assemblyai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const transcribeAudio = async (req, res) => {
  try {
    console.log("Transcribe endpoint called");
    console.log("User:", req.user);
    console.log("File info:", req.file ? { name: req.file.filename, size: req.file.size, path: req.file.path } : "No file");

    if (!req.file) {
      console.error("No audio file uploaded");
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded",
      });
    }

    if (!process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_API_KEY === "YOUR_ASSEMBLYAI_API_KEY_HERE") {
      console.error("AssemblyAI API key is not configured");
      return res.status(500).json({
        success: false,
        message: "AssemblyAI API key is not configured. Get a FREE key at https://www.assemblyai.com/dashboard/signup and add it to .env as ASSEMBLYAI_API_KEY",
      });
    }

    // Initialize AssemblyAI client
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    });

    const audioFile = req.file.path;
    console.log(`Starting transcription of: ${audioFile}`);

    try {
      // Read the audio file as a buffer for upload
      const audioData = fs.readFileSync(audioFile);

      // Upload the audio file to AssemblyAI
      console.log("Uploading audio to AssemblyAI...");
      const uploadUrl = await client.files.upload(audioData);
      console.log("Upload complete:", uploadUrl);

      // Create transcription request
      console.log("Starting transcription...");
      const transcript = await client.transcripts.transcribe({
        audio_url: uploadUrl,
        language_detection: true,
      });

      if (transcript.status === "error") {
        console.error("Transcription error:", transcript.error);
        throw new Error(transcript.error || "Transcription failed");
      }

      console.log(`Transcription completed successfully`);
      console.log(`Transcribed text length: ${(transcript.text || "").length} characters`);

      // Clean up uploaded file
      try {
        fs.unlinkSync(audioFile);
        console.log(`File deleted: ${audioFile}`);
      } catch (unlinkErr) {
        console.warn(`Could not delete file: ${audioFile}`, unlinkErr.message);
      }

      res.status(200).json({
        success: true,
        transcript: transcript.text || "",
        status: "success",
      });
    } catch (transcribeError) {
      console.error("AssemblyAI API error:", transcribeError);
      throw transcribeError;
    }
  } catch (error) {
    console.error("Full transcription error:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.warn(`Could not delete file on error: ${req.file.path}`);
      }
    }

    const errorMessage = error.message || "Transcription failed";
    const statusCode = error.status || 500;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
};