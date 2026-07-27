import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, position: true } },
          },
        },
        tasks: {
          include: {
            creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isMember = project.members.some((m) => m.userId === session.userId);
    const isLead = project.leadId === session.userId;

    if (session.role !== "ADMIN" && !isMember && !isLead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { memberIds, ...data } = body;

    if (session.role !== "ADMIN" && session.role !== "PROJECT_LEAD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (Array.isArray(memberIds)) {
      await prisma.projectMember.deleteMany({ where: { projectId: id } });
      if (memberIds.length > 0) {
        await prisma.projectMember.createMany({
          data: memberIds.map((userId: string) => ({
            projectId: id,
            userId,
            role: "MEMBER",
          })),
        });
      }
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.comment.deleteMany({ where: { task: { projectId: id } } });
    await prisma.notification.deleteMany({ where: { projectId: id } });
    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.projectMember.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
