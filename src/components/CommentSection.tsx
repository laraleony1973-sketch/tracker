"use client"

import { useState, useEffect } from "react"
import { Comment, User } from "@/lib/types"
import { useAuth } from "./AuthProvider"

interface CommentSectionProps {
  taskId: string
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tasks/comments?taskId=${taskId}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/tasks/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, text: text.trim() }),
      })
      if (res.ok) {
        setText("")
        fetchComments()
      } else {
        setError("Ошибка отправки комментария")
      }
    } catch {
      setError("Ошибка отправки комментария")
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Удалить комментарий?")) return
    try {
      const res = await fetch(`/api/tasks/comments?id=${commentId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch {}
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-heading font-semibold text-deep-fjord">
        Комментарии ({comments.length})
      </h3>

      {error && (
        <div className="p-3 bg-northern-sun/10 text-northern-sun text-sm rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4 text-sm text-graphite/50">Загрузка...</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-snow rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal text-xs font-medium">
                  {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                </div>
                <span className="text-sm font-medium text-deep-fjord">
                  {comment.author?.firstName} {comment.author?.lastName}
                </span>
                <span className="text-xs text-graphite/50">
                  {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {(comment.authorId === user?.id || user?.role === "ADMIN") && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-auto text-xs text-northern-sun/60 hover:text-northern-sun"
                  >
                    Удалить
                  </button>
                )}
              </div>
              <p className="text-sm text-graphite/70 whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий..."
          rows={2}
          className="flex-1 px-3 py-2 border border-snow-dark rounded-lg text-sm resize-none focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2 bg-aurora-teal text-white text-sm rounded-lg hover:bg-aurora-teal/80 disabled:opacity-50 self-end"
        >
          Отправить
        </button>
      </form>
    </div>
  )
}
