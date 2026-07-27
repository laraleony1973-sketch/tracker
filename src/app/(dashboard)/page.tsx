"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { Task, Project } from "@/lib/types"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([t, p]) => {
      setTasks(t.tasks || [])
      setProjects(p.projects || [])
    }).finally(() => setLoading(false))
  }, [])

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id)
  const activeTasks = myTasks.filter((t) => t.status !== "DONE")
  const overdueTasks = myTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "DONE"
  )
  const now = new Date()
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const dueThisWeek = myTasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) >= now &&
      new Date(t.deadline) <= weekEnd &&
      t.status !== "DONE"
  )

  const nearestDeadlines = [...myTasks]
    .filter((t) => t.deadline && t.status !== "DONE")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)

  const recentUpdates = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-snow-dark border-t-aurora-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-deep-fjord">
          Привет, {user?.firstName}!
        </h1>
        <p className="text-sm text-graphite/50 mt-1">Сводка на сегодня</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-glacier/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-glacier" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-graphite/60">Активные задачи</p>
          </div>
          <p className="text-3xl font-heading font-bold text-deep-fjord">{activeTasks.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-northern-sun/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-northern-sun" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-graphite/60">Просроченные</p>
          </div>
          <p className="text-3xl font-heading font-bold text-northern-sun">{overdueTasks.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-aurora-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-graphite/60">На этой неделе</p>
          </div>
          <p className="text-3xl font-heading font-bold text-aurora-teal">{dueThisWeek.length}</p>
        </div>
      </div>

      {/* Deadlines & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-snow-dark p-5">
          <h2 className="text-sm font-heading font-semibold text-deep-fjord mb-4">Ближайшие дедлайны</h2>
          {nearestDeadlines.length === 0 ? (
            <p className="text-sm text-graphite/50 py-4">Нет задач с дедлайнами</p>
          ) : (
            <div className="space-y-2">
              {nearestDeadlines.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-snow transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-graphite truncate">{task.title}</p>
                    <p className="text-xs text-graphite/40 mt-0.5">{task.identifier}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${
                      new Date(task.deadline!) < new Date()
                        ? "bg-northern-sun/10 text-northern-sun"
                        : "bg-snow text-graphite/60"
                    }`}
                  >
                    {new Date(task.deadline!).toLocaleDateString("ru-RU")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-snow-dark p-5">
          <h2 className="text-sm font-heading font-semibold text-deep-fjord mb-4">Последние обновления</h2>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-graphite/50 py-4">Нет обновлений</p>
          ) : (
            <div className="space-y-2">
              {recentUpdates.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-snow transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-graphite truncate">{task.title}</p>
                    <p className="text-xs text-graphite/40 mt-0.5">{task.identifier}</p>
                  </div>
                  <span className="text-xs text-graphite/40 shrink-0 ml-3">
                    {new Date(task.updatedAt).toLocaleDateString("ru-RU")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-heading font-semibold text-deep-fjord">Мои проекты</h2>
          <Link href="/projects" className="text-sm text-aurora-teal hover:text-aurora-teal-light transition-colors font-medium">
            Все проекты →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-md transition-all group"
            >
              <h3 className="font-heading font-semibold text-deep-fjord mb-1 group-hover:text-aurora-teal transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-graphite/50 line-clamp-2 mb-3">
                {project.description || "Описание отсутствует"}
              </p>
              <div className="flex items-center justify-between text-xs text-graphite/50">
                <span>{project._count?.tasks || 0} задач</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  project.status === "ACTIVE" ? "bg-aurora-teal/10 text-aurora-teal" :
                  project.status === "PLANNING" ? "bg-glacier/10 text-glacier" :
                  "bg-snow text-graphite/50"
                }`}>
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
