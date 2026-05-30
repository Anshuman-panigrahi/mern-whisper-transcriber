import axios from "axios";
import fs from "fs";

export const transcribeAudio = async (req, res) => {
  const startTime = Date.now();
  let filePath = null;

  try {
    // ── Step 1: Validate file upload ──
    if (!req.file) {
      console.error("❌ No audio file in request");
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded",
      });
    }

    filePath = req.file.path;
    console.log("📁 File received:", {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: filePath,
    });

    // ── Step 2: Read file from disk ──
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found on disk:", filePath);
      return res.status(500).json({
        success: false,
        message: "Uploaded file not found on server. Please try again.",
      });
    }

    const audioData = fs.readFileSync(filePath);
    console.log("✅ File read successfully, size:", audioData.length, "bytes");

    // ── Step 3: Validate API key ──
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      console.error("❌ ASSEMBLY_API_KEY is not set");
      return res.status(500).json({
        success: false,
        message: "Transcription service not configured. Missing API key.",
      });
    }
    console.log("✅ API key present, length:", apiKey.length);

    // ── Step 4: Upload audio to AssemblyAI ──
    console.log("⬆️ Uploading audio to AssemblyAI...");
    let uploadResponse;
    try {
      uploadResponse = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        audioData,
        {
          headers: {
            authorization: apiKey,
            "content-type": "application/octet-stream",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 25000,
        }
      );
    } catch (uploadErr) {
      console.error("❌ AssemblyAI upload failed:", {
        status: uploadErr.response?.status,
        statusText: uploadErr.response?.statusText,
        data: uploadErr.response?.data,
        message: uploadErr.message,
      });
      return res.status(502).json({
        success: false,
        message: "Failed to upload audio to transcription service",
        error: uploadErr.response?.data?.error || uploadErr.message,
      });
    }

    const audioUrl = uploadResponse.data.upload_url;
    console.log("✅ Audio uploaded, URL:", audioUrl);

    // ── Step 5: Start transcription ──
    console.log("🚀 Starting transcription...");
    let transcriptResponse;
    try {
      transcriptResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        {
          audio_url: audioUrl,
          speech_models: ["universal-2"],
        },
        {
          headers: {
            authorization: apiKey,
            "content-type": "application/json",
          },
          timeout: 15000,
        }
      );
    } catch (transcriptErr) {
      console.error("❌ AssemblyAI transcript request failed:", {
        status: transcriptErr.response?.status,
        statusText: transcriptErr.response?.statusText,
        data: transcriptErr.response?.data,
        message: transcriptErr.message,
      });
      return res.status(502).json({
        success: false,
        message: "Failed to start transcription",
        error: transcriptErr.response?.data?.error || transcriptErr.message,
      });
    }

    const transcriptId = transcriptResponse.data.id;
    console.log("✅ Transcription started, ID:", transcriptId);

    // ── Step 6: Safe synchronous polling under Render's 30s timeout ──
    let transcriptResult;
    // We poll at most 11 times, every 2 seconds = 22 seconds max.
    // This leaves a safe buffer so we don't exceed Render's 30s timeout.
    const maxPolls = 11;
    let completed = false;

    for (let i = 0; i < maxPolls; i++) {
      console.log(`🔄 Polling attempt ${i + 1}/${maxPolls}...`);
      try {
        const polling = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: apiKey,
            },
            timeout: 5000,
          }
        );

        transcriptResult = polling.data;
        console.log("🔄 Polling status:", transcriptResult.status);

        if (transcriptResult.status === "completed") {
          console.log("✅ Transcription completed successfully!");
          completed = true;
          break;
        }

        if (transcriptResult.status === "error") {
          console.error("❌ AssemblyAI transcription error:", transcriptResult.error);
          return res.status(502).json({
            success: false,
            message: "Transcription failed at AssemblyAI",
            error: transcriptResult.error,
          });
        }
      } catch (pollErr) {
        console.warn("⚠️ Polling network warning:", pollErr.message);
      }

      // Wait 2 seconds before the next poll
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!completed) {
      console.warn("⚠️ Polling reached safe time limit before completion. Returning processing state.");
      return res.status(202).json({
        success: true,
        status: "processing",
        transcript: "Processing is taking longer than expected. Please check back in a moment or try a shorter clip.",
        transcriptId: transcriptId
      });
    }

    // ── Step 7: Cleanup and respond ──
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Transcription complete in ${elapsed}s, text length: ${transcriptResult.text?.length || 0}`);

    res.status(200).json({
      success: true,
      transcript: transcriptResult.text,
      text: transcriptResult.text
    });
  } catch (error) {
    console.error("❌ Unexpected transcription error:", {
      message: error.message,
      stack: error.stack,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });

    res.status(500).json({
      success: false,
      message: "Transcription failed",
      error: error.message,
    });
  } finally {
    // Always clean up the temp file
    if (filePath) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🧹 Temp file cleaned up:", filePath);
        }
      } catch (cleanupErr) {
        console.warn("⚠️ Failed to clean up temp file:", cleanupErr.message);
      }
    }
  }
};