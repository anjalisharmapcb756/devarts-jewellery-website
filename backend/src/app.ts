import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { verifyOrigin } from "./middleware/origin.js";
import { authRateLimit, checkoutRateLimit, newsletterRateLimit } from "./middleware/rateLimit.js";
import { ApiError } from "./utils/ApiError.js";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminStoreRoutes from "./routes/adminStoreRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

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
app.use(verifyOrigin);

app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRateLimit, authRoutes);
app.use("/api/v1/admin", authRateLimit, adminRoutes);
app.use("/api/admin", adminStoreRoutes);
app.use("/api/auth", authRateLimit, customerAuthRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRateLimit, checkoutRoutes);
app.use("/api/newsletter", newsletterRateLimit, newsletterRoutes);

app.use(notFound);
app.use(errorHandler);
