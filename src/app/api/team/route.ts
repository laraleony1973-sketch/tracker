import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        position: true,
        avatar: true,
        _count: {
          select: {
            assignedTasks: { where: { status: { notIn: ["DONE", "ARCHIVED"] } } },
          },
        },
      },
      orderBy: { firstName: "asc" },
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const overdueTasks = await prisma.task.count({
          where: {
            assigneeId: user.id,
            status: { notIn: ["DONE", "ARCHIVED"] },
            deadline: { lt: new Date() },
          },
        });
        return { ...user, overdueTasks };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
