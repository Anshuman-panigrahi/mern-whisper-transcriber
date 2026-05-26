import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AssemblyAI } from "assemblyai";
import { Client, handle_file } from "@gradio/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const transcribeAudio = async (req, res) => {
  const audioFile = req.file ? req.file.path : null;
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

    let transcribedText = "";
    let methodUsed = "";

    // 1. Check if AssemblyAI API key is configured
    const hasAssemblyKey = process.env.ASSEMBLYAI_API_KEY && 
                           process.env.ASSEMBLYAI_API_KEY !== "YOUR_ASSEMBLYAI_API_KEY_HERE" &&
                           process.env.ASSEMBLYAI_API_KEY.trim() !== "";

    if (hasAssemblyKey) {
      try {
        console.log("Using AssemblyAI for transcription...");
        const client = new AssemblyAI({
          apiKey: process.env.ASSEMBLYAI_API_KEY,
        });

        const audioData = fs.readFileSync(audioFile);
        console.log("Uploading audio to AssemblyAI...");
        const uploadUrl = await client.files.upload(audioData);
        console.log("Upload complete:", uploadUrl);

        console.log("Starting transcription...");
        const transcript = await client.transcripts.transcribe({
          audio_url: uploadUrl,
          language_detection: true,
        });

        if (transcript.status === "error") {
          throw new Error(transcript.error || "AssemblyAI transcription failed");
        }

        transcribedText = transcript.text || "";
        methodUsed = "AssemblyAI";
      } catch (err) {
        console.warn("AssemblyAI failed, falling back to free Whisper API...", err.message);
      }
    }

    // 2. Fallback to Free Whisper API (Hugging Face / Gradio Client)
    if (!transcribedText) {
      console.log("Using Free Whisper API (Hugging Face Gradio) for transcription...");
      try {
        const app = await Client.connect("hf-audio/whisper-large-v3");
        const audioInput = handle_file(audioFile);
        
        console.log("Calling free Whisper transcribe endpoint...");
        const result = await app.predict("/transcribe", [
          audioInput,      // inputs (Audio file)
          "transcribe"     // task
        ]);

        if (result && result.data && result.data[0]) {
          transcribedText = result.data[0];
          methodUsed = "Free Whisper (Hugging Face)";
        } else {
          throw new Error("Empty transcription result from Whisper API");
        }
      } catch (whisperError) {
        console.error("Free Whisper transcription failed:", whisperError);
        throw new Error("Transcription service error. Both AssemblyAI and Free Whisper APIs failed: " + whisperError.message);
      }
    }

    console.log(`Transcription completed successfully using ${methodUsed}`);
    console.log(`Transcribed text length: ${transcribedText.length} characters`);

    // Clean up uploaded file
    try {
      fs.unlinkSync(audioFile);
      console.log(`File deleted: ${audioFile}`);
    } catch (unlinkErr) {
      console.warn(`Could not delete file: ${audioFile}`, unlinkErr.message);
    }

    res.status(200).json({
      success: true,
      transcript: transcribedText,
      status: "success",
      method: methodUsed
    });

  } catch (error) {
    console.error("Full transcription error:", error);

    if (audioFile) {
      try {
        fs.unlinkSync(audioFile);
      } catch (unlinkErr) {
        console.warn(`Could not delete file on error: ${audioFile}`);
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