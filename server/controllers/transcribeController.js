const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      text: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    res.status(500).json({
      message: error.message || "Transcription Failed",
    });
  }
};

module.exports = {
  transcribeAudio,
};