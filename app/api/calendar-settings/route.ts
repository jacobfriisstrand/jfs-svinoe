export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.calendarSettings.findFirst();
  if (!settings) {
    return NextResponse.json(null);
  }
  return NextResponse.json({
    id: settings.id,
    external_link: settings.externalLink,
  });
}

export async function PUT(request: Request) {
  const { id, external_link } = await request.json();
  const settings = await prisma.calendarSettings.update({
    where: { id },
    data: { externalLink: external_link, updatedAt: new Date() },
  });
  return NextResponse.json({
    id: settings.id,
    external_link: settings.externalLink,
  });
}
