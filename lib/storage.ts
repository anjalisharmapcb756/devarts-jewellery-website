import fs from "node:fs";
import path from "node:path";

export async function uploadProductImageFile(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), bytes);
  return { url: `/uploads/products/${name}` };
}
