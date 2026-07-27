import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "volkova@nordflow.ru",
        password,
        firstName: "Анна",
        lastName: "Волкова",
        role: "ADMIN",
        position: "Операционный директор",
      },
    }),
    prisma.user.create({
      data: {
        email: "orlov@nordflow.ru",
        password,
        firstName: "Максим",
        lastName: "Орлов",
        role: "PROJECT_LEAD",
        position: "Руководитель проекта",
      },
    }),
    prisma.user.create({
      data: {
        email: "sokolova@nordflow.ru",
        password,
        firstName: "Елена",
        lastName: "Соколова",
        role: "EMPLOYEE",
        position: "Дизайнер",
      },
    }),
    prisma.user.create({
      data: {
        email: "morozov@nordflow.ru",
        password,
        firstName: "Илья",
        lastName: "Морозов",
        role: "EMPLOYEE",
        position: "Frontend-разработчик",
      },
    }),
    prisma.user.create({
      data: {
        email: "lebedev@nordflow.ru",
        password,
        firstName: "Виктор",
        lastName: "Лебедев",
        role: "EMPLOYEE",
        position: "Backend-разработчик",
      },
    }),
    prisma.user.create({
      data: {
        email: "krylova@nordflow.ru",
        password,
        firstName: "Ольга",
        lastName: "Крылова",
        role: "EMPLOYEE",
        position: "Маркетолог",
      },
    }),
    prisma.user.create({
      data: {
        email: "frolov@nordflow.ru",
        password,
        firstName: "Дмитрий",
        lastName: "Фролов",
        role: "EMPLOYEE",
        position: "Тестировщик",
      },
    }),
    prisma.user.create({
      data: {
        email: "belova@nordflow.ru",
        password,
        firstName: "Мария",
        lastName: "Белова",
        role: "EMPLOYEE",
        position: "Аналитик",
      },
    }),
  ]);

  const [anna, maxim, elena, ilya, viktor, olga, dmitry, maria] = users;

  const project1 = await prisma.project.create({
    data: {
      name: "Разработка сайта Greenstone",
      description: "Разработка корпоративного сайта для клиента Greenstone. Включает дизайн, вёрстку и интеграцию с CMS.",
      status: "ACTIVE",
      leadId: maxim.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-09-30"),
      members: {
        create: [
          { userId: maxim.id, role: "LEAD" },
          { userId: elena.id, role: "MEMBER" },
          { userId: ilya.id, role: "MEMBER" },
          { userId: viktor.id, role: "MEMBER" },
          { userId: maria.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Запуск рекламной кампании NordFlow",
      description: "Подготовка и запуск рекламной кампании для продвижения продукта NordFlow на рынке.",
      status: "PLANNING",
      leadId: anna.id,
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-12-31"),
      members: {
        create: [
          { userId: anna.id, role: "LEAD" },
          { userId: olga.id, role: "MEMBER" },
          { userId: maria.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Внутренняя автоматизация отдела продаж",
      description: "Автоматизация процессов отдела продаж: CRM, воронка, отчётность.",
      status: "ACTIVE",
      leadId: anna.id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-11-30"),
      members: {
        create: [
          { userId: anna.id, role: "LEAD" },
          { userId: viktor.id, role: "MEMBER" },
          { userId: dmitry.id, role: "MEMBER" },
          { userId: ilya.id, role: "MEMBER" },
        ],
      },
    },
  });

  const projectIds = [project1.id, project2.id, project3.id];
  const projectNames = ["GRN", "NFR", "AUT"];

  const taskData = [
    { title: "Дизайн главной страницы", project: 0, assignee: elena, creator: maxim, priority: "HIGH", status: "IN_PROGRESS", deadline: "2026-08-01" },
    { title: "Вёрстка шапки сайта", project: 0, assignee: ilya, creator: maxim, priority: "MEDIUM", status: "DONE", deadline: "2026-07-20" },
    { title: "Интеграция с CMS WordPress", project: 0, assignee: viktor, creator: maxim, priority: "HIGH", status: "BACKLOG", deadline: "2026-08-15" },
    { title: "Написание контента для раздела «О компании»", project: 0, assignee: maria, creator: maxim, priority: "LOW", status: "PLANNING", deadline: "2026-08-10" },
    { title: "Тестирование мобильной версии", project: 0, assignee: dmitry, creator: maxim, priority: "MEDIUM", status: "BACKLOG", deadline: "2026-08-20" },
    { title: "Настройка формы обратной связи", project: 0, assignee: ilya, creator: maxim, priority: "MEDIUM", status: "IN_PROGRESS", deadline: "2026-07-28" },
    { title: "Оптимизация изображений", project: 0, assignee: elena, creator: maxim, priority: "LOW", status: "PLANNING", deadline: "2026-08-05" },
    { title: "SEO-оптимизация мета-тегов", project: 0, assignee: maria, creator: maxim, priority: "MEDIUM", status: "BACKLOG", deadline: "2026-08-25" },
    { title: "Разработка страницы «Портфолио»", project: 0, assignee: ilya, creator: maxim, priority: "HIGH", status: "REVIEW", deadline: "2026-07-25" },
    { title: "Анализ конкурентов", project: 1, assignee: maria, creator: anna, priority: "HIGH", status: "DONE", deadline: "2026-07-15" },
    { title: "Разработка креативов для рекламы", project: 1, assignee: olga, creator: anna, priority: "HIGH", status: "IN_PROGRESS", deadline: "2026-08-01" },
    { title: "Настройка рекламных кампаний в Яндекс.Директ", project: 1, assignee: olga, creator: anna, priority: "MEDIUM", status: "PLANNING", deadline: "2026-08-10" },
    { title: "Подготовка лендинга для рекламы", project: 1, assignee: maria, creator: anna, priority: "CRITICAL", status: "IN_PROGRESS", deadline: "2026-07-28" },
    { title: "A/B тестирование рекламных объявлений", project: 1, assignee: olga, creator: anna, priority: "MEDIUM", status: "BACKLOG", deadline: "2026-09-01" },
    { title: "Настройка CRM-системы", project: 2, assignee: viktor, creator: anna, priority: "CRITICAL", status: "IN_PROGRESS", deadline: "2026-07-30" },
    { title: "Интеграция CRM с почтовыми рассылками", project: 2, assignee: viktor, creator: anna, priority: "HIGH", status: "PLANNING", deadline: "2026-08-15" },
    { title: "Автоматизация воронки продаж", project: 2, assignee: ilya, creator: anna, priority: "HIGH", status: "BACKLOG", deadline: "2026-08-20" },
    { title: "Настройка отчётности для руководства", project: 2, assignee: dmitry, creator: anna, priority: "MEDIUM", status: "PLANNING", deadline: "2026-09-01" },
    { title: "Тестирование интеграций", project: 2, assignee: dmitry, creator: anna, priority: "HIGH", status: "REVIEW", deadline: "2026-07-22" },
    { title: "Обучение сотрудников работе с CRM", project: 2, assignee: anna, creator: anna, priority: "MEDIUM", status: "BACKLOG", deadline: "2026-09-15" },
    { title: "Дизайн презентации проекта", project: 0, assignee: elena, creator: maxim, priority: "LOW", status: "DONE", deadline: "2026-07-10" },
    { title: "Написание ТЗ на мобильную версию", project: 0, assignee: maria, creator: maxim, priority: "MEDIUM", status: "DONE", deadline: "2026-07-05" },
    { title: "Настройка CI/CD пайплайна", project: 2, assignee: viktor, creator: anna, priority: "MEDIUM", status: "DONE", deadline: "2026-06-30" },
    { title: "Мониторинг рекламной кампании", project: 1, assignee: olga, creator: anna, priority: "LOW", status: "BACKLOG", deadline: "2026-10-01" },
    { title: "Проведение интервью с клиентами", project: 2, assignee: dmitry, creator: anna, priority: "LOW", status: "PLANNING", deadline: "2026-08-05" },
    { title: "Доработка личного кабинета", project: 0, assignee: ilya, creator: maxim, priority: "HIGH", status: "BACKLOG", deadline: "2026-09-01" },
    { title: "Создание email-шаблонов", project: 1, assignee: olga, creator: anna, priority: "MEDIUM", status: "PLANNING", deadline: "2026-08-12" },
  ];

  const statuses = ["BACKLOG", "PLANNING", "IN_PROGRESS", "REVIEW", "DONE"];

  for (let i = 0; i < taskData.length; i++) {
    const t = taskData[i];
    const pid = projectIds[t.project];
    const pname = projectNames[t.project];
    const taskCount = await prisma.task.count({ where: { projectId: pid } });

    const task = await prisma.task.create({
      data: {
        identifier: `${pname}-${taskCount + 1}`,
        title: t.title,
        description: `Подробное описание задачи: ${t.title}. Это важная задача в рамках проекта.`,
        status: t.status,
        priority: t.priority,
        projectId: pid,
        creatorId: t.creator.id,
        assigneeId: t.assignee.id,
        deadline: new Date(t.deadline),
        tags: i % 3 === 0 ? "важно" : i % 3 === 1 ? "дизайн" : null,
      },
    });

    if (i % 4 === 0) {
      await prisma.comment.create({
        data: {
          text: "Начал работу над задачей, завершу в срок.",
          taskId: task.id,
          authorId: t.assignee.id,
        },
      });
    }

    if (i % 5 === 0) {
      await prisma.comment.create({
        data: {
          text: "Задача требует дополнительного уточнения. Обсудим на следующей встрече.",
          taskId: task.id,
          authorId: t.creator.id,
        },
      });
    }
  }

  console.log("Seed completed!");
  console.log("Created 8 users, 3 projects, 27 tasks");
  console.log("Login: любой email @nordflow.ru, password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
