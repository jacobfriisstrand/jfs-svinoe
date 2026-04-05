export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });
  if (!page) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { content } = await request.json();
  const page = await prisma.page.update({
    where: { slug: params.slug },
    data: { content, updatedAt: new Date() },
  });
  return NextResponse.json(page);
}
