"use client"

import { useState, useEffect } from "react"
import { User, UserRole } from "@/lib/types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState<UserRole>("EMPLOYEE")
  const [position, setPosition] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    setLoading(true)
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }

  const openCreate = () => {
    setEditingUser(null)
    setEmail("")
    setFirstName("")
    setLastName("")
    setRole("EMPLOYEE")
    setPosition("")
    setPassword("")
    setError("")
    setShowModal(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setEmail(user.email)
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setRole(user.role)
    setPosition(user.position || "")
    setPassword("")
    setError("")
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const body: any = { email, firstName, lastName, role, position }
      if (editingUser) {
        body.id = editingUser.id
        if (password) body.password = password
      } else {
        body.password = password
      }

      const res = await fetch("/api/users", {
        method: editingUser ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Ошибка сохранения")
        return
      }

      setShowModal(false)
      fetchUsers()
    } catch {
      setError("Ошибка подключения")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Удалить пользователя?")) return
    try {
      await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })
      fetchUsers()
    } catch {}
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Администратор",
    PROJECT_LEAD: "Руководитель проекта",
    EMPLOYEE: "Сотрудник",
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
        <h1 className="text-2xl font-heading font-bold text-deep-fjord">Управление пользователями</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-aurora-teal text-white text-sm font-medium rounded-lg hover:bg-aurora-teal/80"
        >
          Добавить пользователя
        </button>
      </div>

      <div className="bg-white rounded-xl border border-snow-dark overflow-hidden">
        <table className="w-full">
          <thead className="bg-snow border-b border-snow-dark">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Имя</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Роль</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Должность</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase">Создан</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-graphite/50 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-snow-dark">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-snow">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal text-xs font-medium">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-deep-fjord">
                      {u.firstName} {u.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-graphite/70">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-snow text-graphite/70">
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-graphite/70">{u.position || "—"}</td>
                <td className="px-4 py-3 text-sm text-graphite/50">
                  {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(u)}
                    className="text-sm text-aurora-teal hover:text-aurora-teal/80 mr-3"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-sm text-northern-sun hover:text-northern-sun/80"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-8 text-sm text-graphite/50">Нет пользователей</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-snow-dark">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-deep-fjord">
                  {editingUser ? "Редактировать пользователя" : "Добавить пользователя"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-graphite/40 hover:text-graphite">
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-northern-sun/10 text-northern-sun text-sm rounded-lg">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Имя</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Фамилия</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Роль</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                >
                  <option value="EMPLOYEE">Сотрудник</option>
                  <option value="PROJECT_LEAD">Руководитель проекта</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Должность</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  {editingUser ? "Новый пароль (оставьте пустым)" : "Пароль"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
                  required={!editingUser}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-graphite bg-snow hover:bg-snow-dark/30 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm text-white bg-aurora-teal hover:bg-aurora-teal/80 rounded-lg disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : editingUser ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
