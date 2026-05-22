import express from "express";
import { generateEmail, getHistory, deleteHistoryItem } from "../controllers/aiController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate-email", protect, generateEmail);
router.get("/history", protect, getHistory);
router.delete("/history/:id", protect, deleteHistoryItem);

export default router;