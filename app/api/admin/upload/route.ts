import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const supabase = await createClient();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e: any) {
    const msg = e?.message || "Unauthorized";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}