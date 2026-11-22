import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Don't throw at import time in build environments that don't need DB.
  console.warn("MONGODB_URI is not set.");
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalAny = globalThis as typeof globalThis & { __mongooseCache?: MongooseCache };
const cache: MongooseCache = globalAny.__mongooseCache ?? { conn: null, promise: null };
globalAny.__mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI environment variable.");
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
