import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, comparePasswords } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, position, avatar, theme, currentPassword, newPassword } = body;

    const data: Record<string, unknown> = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (position !== undefined) data.position = position;
    if (avatar !== undefined) data.avatar = avatar;
    if (theme) data.theme = theme;

    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (user && (await comparePasswords(currentPassword, user.password))) {
        data.password = await hashPassword(newPassword);
      } else {
        return NextResponse.json(
          { error: "Неверный текущий пароль" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        position: true,
        avatar: true,
        theme: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
