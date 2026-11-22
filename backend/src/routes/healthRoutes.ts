import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "vara-admin-backend", timestamp: new Date().toISOString() });
});

router.get("/db", asyncHandler(async (_req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  res.json({ status: state === 1 ? "ok" : "degraded", dbState: state });
}));

export default router;
