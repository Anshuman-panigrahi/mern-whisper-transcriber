import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { transcribeAudio } from "../controllers/transcribeController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  authMiddleware,
  upload.single("audio"),
  transcribeAudio
);

export default router;