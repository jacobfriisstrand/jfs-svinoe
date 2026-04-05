export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  deleteFile,
  fileExists,
  getPublicUrl,
  uploadFile,
} from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const pageId = formData.get("pageId") as string | null;

  if (!(file && pageId)) {
    return NextResponse.json(
      { error: "Missing file or pageId" },
      { status: 400 }
    );
  }

  const key = `cover-images/${pageId}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(key, buffer, file.type);

  return NextResponse.json({ url });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const key = `cover-images/${pageId}`;
  const exists = await fileExists(key);

  if (!exists) {
    return NextResponse.json({ url: null });
  }

  return NextResponse.json({ url: getPublicUrl(key) });
}

export async function DELETE(request: Request) {
  const { pageId } = await request.json();

  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const key = `cover-images/${pageId}`;
  await deleteFile(key);

  return NextResponse.json({ success: true });
}
