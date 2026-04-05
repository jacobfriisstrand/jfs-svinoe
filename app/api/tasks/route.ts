export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { orderIndex: "asc" },
  });
  const mapped = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    order_index: t.orderIndex,
    assignee: t.assignee,
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = await prisma.task.create({
    data: {
      title: body.title,
      assignee: body.assignee,
      status: body.status || "not_started",
      orderIndex: body.order_index,
    },
  });
  return NextResponse.json({
    id: task.id,
    title: task.title,
    status: task.status,
    order_index: task.orderIndex,
    assignee: task.assignee,
  });
}
