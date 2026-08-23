import { Router } from "express";
import { saveConsent } from "../controllers/consentController.js";

const router = Router();

router.post("/", saveConsent);

export default router;
