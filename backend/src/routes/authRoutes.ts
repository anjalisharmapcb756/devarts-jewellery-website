import { Router } from "express";
import { z } from "zod";
import { login, logout, me } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/login", validate({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }), login);
router.post("/logout", logout);
router.get("/me", requireAdmin, me);

export default router;
