import { Router } from "express";
import {
  createUnansweredQuery,
  listUnansweredQueries,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/unanswered", createUnansweredQuery);
router.get("/unanswered", requireAuth, listUnansweredQueries);

export default router;
