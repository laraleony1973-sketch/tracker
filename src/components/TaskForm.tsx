"use client"

import { useState, useEffect } from "react"
import { Task, Project, User, TaskPriority, TaskStatus } from "@/lib/types"

interface TaskFormProps {
  task?: Task | null
  projectId?: string
  onClose: () => void
  onSaved: () => void
}

export default function TaskForm({ task, projectId, onClose, onSaved }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [selectedProjectId, setSelectedProjectId] = useState(task?.projectId || projectId || "")
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || "")
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "MEDIUM")
  const [status, setStatus] = useState<TaskStatus>(task?.status || "BACKLOG")
  const [deadline, setDeadline] = useState(task?.deadline?.split("T")[0] || "")
  const [tags, setTags] = useState(task?.tags || "")
  const [projects, setProjects] = useState<Project[]>([])
  const [team, setTeam] = useState<User[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
    ]).then(([p, t]) => {
      setProjects(p.projects || [])
      setTeam(t.users || [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedProjectId || !assigneeId || !priority) {
      setError("Заполните все обязательные поля")
      return
    }

    setSaving(true)
    setError("")

    try {
      const body: any = {
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProjectId,
        assigneeId,
        priority,
        deadline: deadline || undefined,
        tags: tags || undefined,
      }

      if (task) body.status = status

      const res = await fetch("/api/tasks", {
        method: task ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task ? { id: task.id, ...body } : body),
      })

      if (!res.ok) throw new Error("Ошибка сохранения")
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-snow-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-deep-fjord">
              {task ? "Редактировать задачу" : "Создать задачу"}
            </h2>
            <button onClick={onClose} className="text-graphite/40 hover:text-graphite">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-northern-sun/10 text-northern-sun text-sm rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-graphite mb-1">
              Название *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-1">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Проект *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                required
              >
                <option value="">Выберите проект</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Исполнитель *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                required
              >
                <option value="">Выберите исполнителя</option>
                {team.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Приоритет *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                required
              >
                <option value="LOW">Низкий</option>
                <option value="MEDIUM">Средний</option>
                <option value="HIGH">Высокий</option>
                <option value="CRITICAL">Критический</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Срок
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              />
            </div>
          </div>

          {task && (
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              >
                <option value="BACKLOG">Бэклог</option>
                <option value="PLANNING">Запланировано</option>
                <option value="IN_PROGRESS">В работе</option>
                <option value="REVIEW">На проверке</option>
                <option value="DONE">Выполнено</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-graphite mb-1">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="фронтенд, баг, срочно"
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-graphite bg-snow hover:bg-snow-dark/30 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm text-white bg-aurora-teal hover:bg-aurora-teal/80 rounded-lg disabled:opacity-50"
            >
              {saving ? "Сохранение..." : task ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
