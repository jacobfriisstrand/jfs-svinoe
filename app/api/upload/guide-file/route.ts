export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
  const key = `guide-files/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(key, buffer, file.type);

  return NextResponse.json({ url, fileName });
}
