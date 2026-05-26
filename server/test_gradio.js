import { Client, handle_file } from "@gradio/client";
import path from "path";
import fs from "fs";

async function test() {
  try {
    console.log("Connecting to Gradio space...");
    const app = await Client.connect("hf-audio/whisper-large-v3");
    console.log("Connected successfully!");
    
    // Check if there is an audio file in uploads
    const uploadsDir = "./uploads";
    const files = fs.readdirSync(uploadsDir);
    if (files.length === 0) {
      console.log("No files in uploads directory.");
      return;
    }
    
    // Pick the smallest file
    const fileWithStats = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      return { name: file, path: filePath, size: fs.statSync(filePath).size };
    }).sort((a, b) => a.size - b.size);
    
    const targetFile = fileWithStats[0];
    console.log(`Testing with file: ${targetFile.path} (size: ${targetFile.size} bytes)`);
    
    // Read the file as a Blob/Buffer or use handle_file
    console.log("Uploading file...");
    
    // According to Gradio Client documentation, you can pass handle_file(filePath)
    const audioInput = handle_file(targetFile.path);
    console.log("Audio Input:", audioInput);
    
    console.log("Calling transcribe endpoint...");
    const result = await app.predict("/transcribe", [
      audioInput,      // inputs (Audio file)
      "transcribe"     // task
    ]);
    
    console.log("Transcribed Text:", result.data[0]);
  } catch (error) {
    console.error("Error during transcription:", error);
  }
}

test();
