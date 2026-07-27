"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus } from "@/lib/types"
import TaskCard from "./TaskCard"

const columns: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Бэклог" },
  { status: "PLANNING", label: "Запланировано" },
  { status: "IN_PROGRESS", label: "В работе" },
  { status: "REVIEW", label: "На проверке" },
  { status: "DONE", label: "Выполнено" },
]

interface KanbanBoardProps {
  projectId?: string
  filterByUserId?: string
  statusFilter?: TaskStatus
  priorityFilter?: string
  searchFilter?: string
  overdueOnly?: boolean
}

export default function KanbanBoard({
  projectId,
  filterByUserId,
  statusFilter,
  priorityFilter,
  searchFilter,
  overdueOnly,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [projectId, filterByUserId])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (projectId) params.set("projectId", projectId)
      if (filterByUserId) params.set("assigneeId", filterByUserId)

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = tasks.filter((t) => {
    if (searchFilter && !t.title.toLowerCase().includes(searchFilter.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    if (overdueOnly && (!t.deadline || new Date(t.deadline) >= new Date() || t.status === "DONE")) return false
    return true
  })

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
    )

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggedTask.id, status: newStatus }),
      })
    } catch {
      fetchTasks()
    }

    setDraggedTask(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTasks = filtered.filter((t) => t.status === col.status)
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-72 bg-snow rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="p-3 border-b border-snow-dark">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-semibold text-deep-fjord">{col.label}</h3>
                <span className="text-xs text-aurora-teal bg-aurora-teal/10 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
