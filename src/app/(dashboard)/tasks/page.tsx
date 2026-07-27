"use client"

import { useState, useEffect } from "react"
import { Task, Project, TaskStatus, TaskPriority } from "@/lib/types"
import KanbanBoard from "@/components/KanbanBoard"
import TaskForm from "@/components/TaskForm"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "board">("list")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("")
  const [projectFilter, setProjectFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([t, p]) => {
      setTasks(t.tasks || [])
      setProjects(p.projects || [])
    }).finally(() => setLoading(false))
  }

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (projectFilter && t.projectId !== projectFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    if (overdueOnly && (!t.deadline || new Date(t.deadline) >= new Date() || t.status === "DONE")) return false
    return true
  })

  const priorityColors: Record<string, string> = {
    LOW: "bg-snow text-graphite/70",
    MEDIUM: "bg-glacier/10 text-glacier",
    HIGH: "bg-northern-sun/10 text-northern-sun",
    CRITICAL: "bg-northern-sun/20 text-northern-sun",
  }

  const statusLabels: Record<string, string> = {
    BACKLOG: "Бэклог",
    PLANNING: "Запланировано",
    IN_PROGRESS: "В работе",
    REVIEW: "На проверке",
    DONE: "Выполнено",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-deep-fjord">Мои задачи</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-aurora-teal text-white text-sm font-medium rounded-lg hover:bg-aurora-teal/80"
        >
          Создать задачу
        </button>
      </div>

      <div className="bg-white rounded-xl border border-snow-dark p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
            className="px-3 py-2 border border-snow-dark rounded-lg text-sm"
          >
            <option value="">Все статусы</option>
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-snow-dark rounded-lg text-sm"
          >
            <option value="">Все проекты</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
            className="px-3 py-2 border border-snow-dark rounded-lg text-sm"
          >
            <option value="">Все приоритеты</option>
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="CRITICAL">Критический</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-graphite/70">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-snow-dark text-aurora-teal"
            />
            Только просроченные
          </label>
          <div className="ml-auto flex border border-snow-dark rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-aurora-teal text-white" : "bg-white text-graphite/70"}`}
            >
              Список
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 text-sm ${view === "board" ? "bg-aurora-teal text-white" : "bg-white text-graphite/70"}`}
            >
              Доска
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
        </div>
      ) : view === "list" ? (
        <div className="bg-white rounded-xl border border-snow-dark overflow-hidden">
          <table className="w-full">
            <thead className="bg-snow border-b border-snow-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Название</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Проект</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Приоритет</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Срок</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-snow-dark">
              {filtered.map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-snow cursor-pointer"
                    onClick={() => setEditingTask(task)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-graphite/50">{task.identifier}</span>
                        <span className="text-sm font-medium text-deep-fjord">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-graphite/70">{task.project?.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-snow text-graphite/70">
                        {statusLabels[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {task.deadline ? (
                        <span className={isOverdue ? "text-northern-sun font-medium" : "text-graphite/70"}>
                          {new Date(task.deadline).toLocaleDateString("ru-RU")}
                        </span>
                      ) : (
                        <span className="text-graphite/40">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-graphite/50">Задачи не найдены</p>
          )}
        </div>
      ) : (
        <KanbanBoard
          filterByUserId={undefined}
          projectId={projectFilter || undefined}
          statusFilter={statusFilter || undefined}
          priorityFilter={priorityFilter || undefined}
          searchFilter={search || undefined}
          overdueOnly={overdueOnly}
        />
      )}

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
          onSaved={() => { setShowForm(false); setEditingTask(null); fetchData() }}
        />
      )}
    </div>
  )
}
