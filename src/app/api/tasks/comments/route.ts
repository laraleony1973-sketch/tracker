import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    const comments = await prisma.comment.findMany({
      where: { taskId: taskId || "" },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, text } = body;

    const comment = await prisma.comment.create({
      data: {
        text,
        taskId,
        authorId: session.userId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task && task.assigneeId && task.assigneeId !== session.userId) {
      await prisma.notification.create({
        data: {
          type: "NEW_COMMENT",
          message: `Новый комментарий к задаче "${task.title}"`,
          userId: task.assigneeId,
          taskId,
          projectId: task.projectId,
        },
      });
    }

    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    const comment = await prisma.comment.findUnique({ where: { id: commentId || "" } });
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (comment.authorId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId || "" } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
