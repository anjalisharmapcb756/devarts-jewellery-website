import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, "Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);
