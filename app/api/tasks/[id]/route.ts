import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const task = await prisma.task.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  return NextResponse.json({
    id: task.id,
    title: task.title,
    status: task.status,
    order_index: task.orderIndex,
    assignee: task.assignee,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
