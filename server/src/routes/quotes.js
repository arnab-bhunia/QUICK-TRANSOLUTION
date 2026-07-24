import { Router } from "express";
import { createQuote, listQuotes } from "../controllers/quoteController.js";

const router = Router();

router.post("/", createQuote);
router.get("/", listQuotes);

export default router;
