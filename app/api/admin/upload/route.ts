import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { uploadProductImageFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image must be 8MB or smaller" }, { status: 400 });
    const result = await uploadProductImageFile(file);
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
