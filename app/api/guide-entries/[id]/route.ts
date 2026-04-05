import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const entry = await prisma.guideEntry.update({
    where: { id: params.id },
    data: {
      title: body.title,
      content: body.content,
      externalLink: body.external_link ?? undefined,
      linkLabel: body.link_label ?? undefined,
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.guideEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
