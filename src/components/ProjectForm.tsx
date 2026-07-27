"use client"

import { useState, useEffect } from "react"
import { Project, User, ProjectStatus } from "@/lib/types"

interface ProjectFormProps {
  project?: Project | null
  onClose: () => void
  onSaved: () => void
}

export default function ProjectForm({ project, onClose, onSaved }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [status, setStatus] = useState<ProjectStatus>(project?.status || "PLANNING")
  const [leadId, setLeadId] = useState(project?.leadId || "")
  const [startDate, setStartDate] = useState(project?.startDate?.split("T")[0] || "")
  const [endDate, setEndDate] = useState(project?.endDate?.split("T")[0] || "")
  const [team, setTeam] = useState<User[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setTeam(data.users || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !leadId) {
      setError("Заполните все обязательные поля")
      return
    }

    setSaving(true)
    setError("")

    try {
      const body: any = {
        name: name.trim(),
        description: description.trim(),
        status,
        leadId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      const res = await fetch(project ? `/api/projects/${project.id}` : "/api/projects", {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Ошибка сохранения")
        return
      }

      onSaved()
    } catch {
      setError("Ошибка подключения")
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
              {project ? "Редактировать проект" : "Создать проект"}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                Руководитель *
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                required
              >
                <option value="">Выберите руководителя</option>
                {team.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              >
                <option value="PLANNING">Планирование</option>
                <option value="ACTIVE">Активный</option>
                <option value="PAUSED">Приостановлен</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Дата окончания
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              />
            </div>
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
              {saving ? "Сохранение..." : project ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
