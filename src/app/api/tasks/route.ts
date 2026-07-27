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
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const myTasks = searchParams.get("myTasks");

    const where: Record<string, unknown> = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (myTasks === "true") {
      where.assigneeId = session.userId;
    } else if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.title = { contains: search };
    }

    if (session.role !== "ADMIN" && session.role !== "PROJECT_LEAD") {
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId: session.userId },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((m) => m.projectId);
      where.projectId = { in: projectIds };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
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
    const { title, description, projectId, assigneeId, priority, deadline, tags, status } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and project are required" }, { status: 400 });
    }

    const projectTasks = await prisma.task.count({ where: { projectId } });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const identifier = `${project?.name?.substring(0, 3).toUpperCase() || "TSK"}-${projectTasks + 1}`;

    const task = await prisma.task.create({
      data: {
        identifier,
        title,
        description,
        projectId,
        creatorId: session.userId,
        assigneeId: assigneeId || session.userId,
        priority: priority || "MEDIUM",
        status: status || "BACKLOG",
        deadline: deadline ? new Date(deadline) : null,
        tags: tags || null,
      },
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
    });

    if (assigneeId && assigneeId !== session.userId) {
      await prisma.notification.create({
        data: {
          type: "TASK_ASSIGNED",
          message: `Вам назначена задача "${title}" в проекте "${project?.name}"`,
          userId: assigneeId,
          taskId: task.id,
          projectId,
        },
      });
    }

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    if (data.deadline) {
      data.deadline = new Date(data.deadline);
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
    });

    if (data.assigneeId && data.assigneeId !== existingTask.assigneeId) {
      if (data.assigneeId && data.assigneeId !== session.userId) {
        await prisma.notification.create({
          data: {
            type: "TASK_ASSIGNED",
            message: `Вам назначена задача "${task.title}" в проекте "${task.project?.name}"`,
            userId: data.assigneeId,
            taskId: task.id,
            projectId: task.projectId,
          },
        });
      }
      if (existingTask.assigneeId && existingTask.assigneeId !== session.userId) {
        await prisma.notification.create({
          data: {
            type: "TASK_UPDATED",
            message: `Задача "${task.title}" была передана другому исполнителю`,
            userId: existingTask.assigneeId,
            taskId: task.id,
            projectId: task.projectId,
          },
        });
      }
    } else if (data.status || data.title || data.description || data.priority) {
      if (task.assigneeId && task.assigneeId !== session.userId) {
        await prisma.notification.create({
          data: {
            type: "TASK_UPDATED",
            message: `Задача "${task.title}" была обновлена`,
            userId: task.assigneeId,
            taskId: task.id,
            projectId: task.projectId,
          },
        });
      }
    }

    return NextResponse.json({ task });
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.comment.deleteMany({ where: { taskId: id } });
    await prisma.notification.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
