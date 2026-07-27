"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Project, Task } from "@/lib/types"
import { useAuth } from "@/components/AuthProvider"
import KanbanBoard from "@/components/KanbanBoard"
import TaskForm from "@/components/TaskForm"
import ProjectForm from "@/components/ProjectForm"

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"board" | "list" | "members" | "info">("board")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = () => {
    setLoading(true)
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/tasks?projectId=${id}`).then((r) => r.json()),
    ]).then(([p, t]) => {
      setProject(p.project || null)
      setTasks(t.tasks || [])
    }).finally(() => setLoading(false))
  }

  const reloadTasks = () => {
    fetch(`/api/tasks?projectId=${id}`)
      .then((r) => r.json())
      .then((t) => setTasks(t.tasks || []))
  }

  const handleDeleteProject = async () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (res.ok) {
        window.location.href = "/projects"
      }
    } catch {}
  }

  const statusLabels: Record<string, string> = {
    BACKLOG: "Бэклог",
    PLANNING: "Запланировано",
    IN_PROGRESS: "В работе",
    REVIEW: "На проверке",
    DONE: "Выполнено",
  }

  const priorityColors: Record<string, string> = {
    LOW: "bg-snow text-graphite/70",
    MEDIUM: "bg-glacier/10 text-glacier",
    HIGH: "bg-northern-sun/10 text-northern-sun",
    CRITICAL: "bg-northern-sun/20 text-northern-sun",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
      </div>
    )
  }

  if (!project) {
    return <p className="text-center py-8 text-graphite/50">Проект не найден</p>
  }

  const tabs = [
    { key: "board", label: "Доска" },
    { key: "list", label: "Список задач" },
    { key: "members", label: "Участники" },
    { key: "info", label: "Информация" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-deep-fjord">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-graphite/50 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {(user?.role === "ADMIN" || user?.role === "PROJECT_LEAD") && (
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-4 py-2 bg-snow text-graphite text-sm font-medium rounded-lg hover:bg-snow-dark/30 border border-snow-dark"
            >
              Редактировать
            </button>
          )}
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-aurora-teal text-white text-sm font-medium rounded-lg hover:bg-aurora-teal/80"
          >
            Создать задачу
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-snow p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-deep-fjord shadow-sm"
                : "text-graphite/50 hover:text-graphite"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "board" && <KanbanBoard projectId={id as string} />}

      {activeTab === "list" && (
        <div className="bg-white rounded-xl border border-snow-dark overflow-hidden">
          <table className="w-full">
            <thead className="bg-snow border-b border-snow-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Название</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Приоритет</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Исполнитель</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Срок</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-snow-dark">
              {tasks.map((task) => (
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
                  <td className="px-4 py-3 text-sm text-graphite/70">
                    {task.assignee?.firstName} {task.assignee?.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-graphite/70">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString("ru-RU") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <p className="text-center py-8 text-sm text-graphite/50">Нет задач</p>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-white rounded-xl border border-snow-dark p-5">
          <h3 className="text-sm font-heading font-semibold text-deep-fjord mb-4">Участники проекта</h3>
          {project.members && project.members.length > 0 ? (
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-snow">
                  <div className="w-9 h-9 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal font-medium text-sm">
                    {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-deep-fjord">
                      {member.user?.firstName} {member.user?.lastName}
                    </p>
                    <p className="text-xs text-graphite/50">{member.user?.position || member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-graphite/50">Нет участников</p>
          )}
        </div>
      )}

      {activeTab === "info" && (
        <div className="bg-white rounded-xl border border-snow-dark p-5 space-y-4">
          <div>
            <p className="text-xs text-graphite/50 mb-1">Название</p>
            <p className="text-sm font-medium text-deep-fjord">{project.name}</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 mb-1">Описание</p>
            <p className="text-sm text-graphite/70">{project.description || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 mb-1">Статус</p>
            <p className="text-sm text-deep-fjord">{project.status}</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 mb-1">Руководитель</p>
            <p className="text-sm text-deep-fjord">
              {project.lead?.firstName} {project.lead?.lastName}
            </p>
          </div>
          {project.startDate && (
            <div>
              <p className="text-xs text-graphite/50 mb-1">Дата начала</p>
              <p className="text-sm text-deep-fjord">
                {new Date(project.startDate).toLocaleDateString("ru-RU")}
              </p>
            </div>
          )}
          {project.endDate && (
            <div>
              <p className="text-xs text-graphite/50 mb-1">Дата окончания</p>
              <p className="text-sm text-deep-fjord">
                {new Date(project.endDate).toLocaleDateString("ru-RU")}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-graphite/50 mb-1">Всего задач</p>
            <p className="text-sm text-deep-fjord">{tasks.length}</p>
          </div>
          {user?.role === "ADMIN" && (
            <div className="pt-4 border-t border-snow-dark">
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 text-sm text-northern-sun hover:bg-northern-sun/10 rounded-lg"
              >
                Удалить проект
              </button>
            </div>
          )}
        </div>
      )}

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          projectId={id as string}
          onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
          onSaved={() => { setShowTaskForm(false); setEditingTask(null); reloadTasks() }}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          project={project}
          onClose={() => setShowProjectForm(false)}
          onSaved={() => { setShowProjectForm(false); fetchProject() }}
        />
      )}
    </div>
  )
}
