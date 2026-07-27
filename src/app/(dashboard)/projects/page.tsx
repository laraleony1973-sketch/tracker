"use client"

import { useState, useEffect } from "react"
import { Project, ProjectStatus } from "@/lib/types"
import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"
import ProjectForm from "@/components/ProjectForm"

const statusTabs: { value: ProjectStatus | ""; label: string }[] = [
  { value: "", label: "Все" },
  { value: "PLANNING", label: "Планирование" },
  { value: "ACTIVE", label: "Активные" },
  { value: "PAUSED", label: "Приостановлены" },
  { value: "COMPLETED", label: "Завершены" },
  { value: "ARCHIVED", label: "Архив" },
]

const statusColors: Record<string, string> = {
  PLANNING: "bg-glacier/10 text-glacier",
  ACTIVE: "bg-aurora-teal/10 text-aurora-teal",
  PAUSED: "bg-northern-sun/10 text-northern-sun/70",
  COMPLETED: "bg-snow text-graphite/70",
  ARCHIVED: "bg-snow text-graphite/50",
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = () => {
    setLoading(true)
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false))
  }

  const filtered = projects.filter((p) => !statusFilter || p.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-deep-fjord">Проекты</h1>
        {(user?.role === "ADMIN" || user?.role === "PROJECT_LEAD") && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-aurora-teal text-white text-sm font-medium rounded-lg hover:bg-aurora-teal/80"
          >
            Создать проект
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-snow p-1 rounded-lg w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-deep-fjord shadow-sm"
                : "text-graphite/50 hover:text-graphite"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-deep-fjord">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-snow text-graphite/70"}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-graphite/50 line-clamp-2 mb-4">
                {project.description || "Описание отсутствует"}
              </p>
              <div className="flex items-center justify-between text-xs text-graphite/50">
                <span>{project._count?.tasks || 0} задач</span>
                <span>{project.members?.length || 0} участников</span>
                {project.endDate && (
                  <span>до {new Date(project.endDate).toLocaleDateString("ru-RU")}</span>
                )}
              </div>
              {project.lead && (
                <div className="mt-3 pt-3 border-t border-snow flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal text-xs font-medium">
                    {project.lead.firstName?.[0]}{project.lead.lastName?.[0]}
                  </div>
                  <span className="text-xs text-graphite/70">
                    {project.lead.firstName} {project.lead.lastName}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center py-8 text-sm text-graphite/50">Проекты не найдены</p>
      )}

      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProjects() }}
        />
      )}
    </div>
  )
}
