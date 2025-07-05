import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, upsertStreamUserHandler } from "../controllers/chat.controller.js";


const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/upsert-user", protectRoute, upsertStreamUserHandler);

export default router;