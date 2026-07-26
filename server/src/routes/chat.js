import { Router } from "express";
import {
  createUnansweredQuery,
  listUnansweredQueries,
} from "../controllers/chatController.js";

const router = Router();

router.post("/unanswered", createUnansweredQuery);
router.get("/unanswered", listUnansweredQueries);

export default router;
