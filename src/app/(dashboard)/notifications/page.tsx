"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Notification } from "@/lib/types"

const typeIcons: Record<string, string> = {
  TASK_CREATED: "📝",
  TASK_UPDATED: "🔄",
  TASK_ASSIGNED: "👤",
  NEW_COMMENT: "💬",
  COMMENT_ADDED: "💬",
  PROJECT_UPDATED: "📁",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [notification.id] }),
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
      } catch {}
    }

    if (notification.taskId) {
      router.push(`/projects/${notification.projectId || ""}`)
    } else if (notification.projectId) {
      router.push(`/projects/${notification.projectId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-deep-fjord">Уведомления</h1>
        <button
          onClick={markAllRead}
          className="px-4 py-2 text-sm text-aurora-teal hover:bg-aurora-teal/5 rounded-lg"
        >
          Отметить все как прочитанные
        </button>
      </div>

      <div className="bg-white rounded-xl border border-snow-dark divide-y divide-snow-dark">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite/50">Нет уведомлений</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-snow transition-colors ${
                !notification.read ? "bg-aurora-teal/5" : ""
              }`}
            >
              <span className="text-xl mt-0.5">
                {typeIcons[notification.type] || "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-deep-fjord">{notification.message}</p>
                <p className="text-xs text-graphite/50 mt-1">
                  {new Date(notification.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-aurora-teal mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
