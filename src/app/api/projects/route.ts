import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: session.userId },
        },
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: {
          select: { tasks: { where: { status: { notIn: ["DONE", "ARCHIVED"] } } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
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
    if (session.role !== "ADMIN" && session.role !== "PROJECT_LEAD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, leadId, startDate, endDate, status, memberIds } = body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        leadId: leadId || session.userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "PLANNING",
        members: {
          create: [
            { userId: leadId || session.userId, role: "LEAD" },
            ...(memberIds || [])
              .filter((id: string) => id !== (leadId || session.userId))
              .map((id: string) => ({ userId: id, role: "MEMBER" as const })),
          ],
        },
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
