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
    const q = searchParams.get("q") || "";

    if (!q) {
      return NextResponse.json({ projects: [], tasks: [], users: [] });
    }

    const projects = await prisma.project.findMany({
      where: {
        AND: [
          { name: { contains: q } },
          { members: { some: { userId: session.userId } } },
        ],
      },
      select: { id: true, name: true, status: true },
      take: 10,
    });

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          { title: { contains: q } },
          {
            project: {
              members: { some: { userId: session.userId } },
            },
          },
        ],
      },
      select: { id: true, title: true, status: true, identifier: true },
      take: 10,
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
      take: 10,
    });

    return NextResponse.json({ projects, tasks, users });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
