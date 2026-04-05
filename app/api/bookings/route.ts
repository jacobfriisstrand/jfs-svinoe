export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { startDate: "asc" },
  });
  // Map to snake_case to match existing frontend expectations
  const mapped = bookings.map(
    (b: {
      id: string;
      familyMember: string;
      startDate: Date;
      endDate: Date;
      weekNumber: string;
    }) => ({
      id: b.id,
      family_member: b.familyMember,
      start_date: b.startDate.toISOString().split("T")[0],
      end_date: b.endDate.toISOString().split("T")[0],
      week_number: b.weekNumber,
    })
  );
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();
  const booking = await prisma.booking.create({
    data: {
      familyMember: body.family_member,
      startDate: new Date(body.start_date),
      endDate: new Date(body.end_date),
      weekNumber: String(body.week_number),
    },
  });
  return NextResponse.json({
    id: booking.id,
    family_member: booking.familyMember,
    start_date: booking.startDate.toISOString().split("T")[0],
    end_date: booking.endDate.toISOString().split("T")[0],
    week_number: booking.weekNumber,
  });
}
