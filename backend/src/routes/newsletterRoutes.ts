import { Router } from "express";
import { z } from "zod";
import { Subscriber } from "../models/Subscriber.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

const subscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

router.post("/subscribe", asyncHandler(async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body || {});
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Enter a valid email address.");
  }

  const email = parsed.data.email.toLowerCase();
  await Subscriber.updateOne(
    { email },
    { $setOnInsert: { email, source: "homepage" } },
    { upsert: true },
  );

  res.status(201).json({
    ok: true,
    message: "Thank you for subscribing. Welcome to Vara.",
  });
}));

export default router;
