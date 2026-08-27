import { Router } from "express";
import { createQuote, listQuotes } from "../controllers/quoteController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", createQuote);
router.get("/", requireAuth, listQuotes);

export default router;
