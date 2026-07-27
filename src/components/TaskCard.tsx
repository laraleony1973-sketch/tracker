"use client"

import { Task } from "@/lib/types"
import Link from "next/link"

const priorityColors: Record<string, string> = {
  LOW: "bg-snow text-graphite/70",
  MEDIUM: "bg-glacier/10 text-glacier",
  HIGH: "bg-northern-sun/10 text-northern-sun",
  CRITICAL: "bg-northern-sun/20 text-northern-sun",
}

const priorityLabels: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
}

interface TaskCardProps {
  task: Task
  onDragStart?: (task: Task) => void
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
  const isOverdue =
    task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task)}
      className="bg-white border border-snow-dark rounded-lg p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-graphite/50">{task.identifier}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      <Link href={`/projects/${task.projectId}`} className="block">
        <h3 className="text-sm font-medium text-deep-fjord mb-2 hover:text-aurora-teal line-clamp-2">
          {task.title}
        </h3>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="w-6 h-6 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal text-xs font-medium">
              {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
            </div>
          )}
          {task.deadline && (
            <span className={`text-xs ${isOverdue ? "text-northern-sun font-medium" : "text-graphite/50"}`}>
              {new Date(task.deadline).toLocaleDateString("ru-RU")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-graphite/40">
          {task._count && task._count.comments > 0 && (
            <span className="text-xs flex items-center gap-1">
              💬 {task._count.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
