import express from "express";
import { generateMatches } from "../controllers/match.controller.js";

const router = express.Router();
router.get("/generate", generateMatches);
export default router;
