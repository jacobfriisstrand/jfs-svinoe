import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const entries = await prisma.guideEntry.findMany({
    orderBy: { title: "asc" },
  });
  const mapped = entries.map((e) => ({
    id: e.id,
    title: e.title,
    content: e.content,
    file_url: e.fileUrl,
    external_link: e.externalLink,
    link_label: e.linkLabel,
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();
  const entry = await prisma.guideEntry.create({
    data: {
      title: body.title,
      content: body.content,
      fileUrl: body.file_url || null,
      externalLink: body.external_link || null,
      linkLabel: body.link_label || null,
    },
  });
  return NextResponse.json({
    id: entry.id,
    title: entry.title,
    content: entry.content,
    file_url: entry.fileUrl,
    external_link: entry.externalLink,
    link_label: entry.linkLabel,
  });
}
