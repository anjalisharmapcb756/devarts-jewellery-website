import { Router } from "express";
import { z } from "zod";
import { forgotPassword, login, logout, me, register, resetPassword, updateProfile } from "../controllers/customerAuthController.js";
import { requireUser } from "../middleware/customerAuth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", validate({ body: z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8) }) }), register);
router.post("/login", validate({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) }), login);
router.post("/logout", logout);
router.get("/me", requireUser, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile", requireUser, updateProfile);

export default router;
