import express from "express";
import { submitOnboarding } from "../controllers/onboarding.controller.js";
import {protectRoute }from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/submit", protectRoute, submitOnboarding);
export default router;
