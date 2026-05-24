const express = require("express");

const router = express.Router();

const { transcribeAudio } = require("../controllers/transcribeController");

const upload = require("../middleware/uploadMiddleware");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  upload.single("audio"),
  transcribeAudio
);

module.exports = router;