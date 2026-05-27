import axios from "axios";
import fs from "fs";

export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded",
      });
    }

    const audioData = fs.readFileSync(req.file.path);

    // Upload audio to AssemblyAI
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      audioData,
      {
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY,
          "content-type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadResponse.data.upload_url;

    // Start transcription
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
      },
      {
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;

    let transcriptResult;

    while (true) {
      const polling = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            authorization: process.env.ASSEMBLY_API_KEY,
          },
        }
      );

      transcriptResult = polling.data;

      if (transcriptResult.status === "completed") {
        break;
      }

      if (transcriptResult.status === "error") {
        throw new Error(transcriptResult.error);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      transcript: transcriptResult.text,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Transcription failed",
      error: error.message,
    });
  }
};