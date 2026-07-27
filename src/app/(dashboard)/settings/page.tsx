"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [position, setPosition] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setPosition(user.position || "")
      setAvatarUrl(user.avatar || "")
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    if (newPassword && !currentPassword) {
      setMessage("Введите текущий пароль")
      setSaving(false)
      return
    }

    if (currentPassword && !newPassword) {
      setMessage("Введите новый пароль")
      setSaving(false)
      return
    }

    try {
      const body: any = { firstName, lastName, position, avatar: avatarUrl }
      if (newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser(updated.user || updated)
        setMessage("Профиль сохранён")
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setMessage("Ошибка сохранения")
      }
    } catch {
      setMessage("Ошибка подключения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold text-deep-fjord">Настройки профиля</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-snow-dark p-6 space-y-4">
          <h2 className="text-sm font-heading font-semibold text-deep-fjord">Основная информация</h2>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes("сохранён") ? "bg-aurora-teal/10 text-aurora-teal" : "bg-northern-sun/10 text-northern-sun"
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Имя</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
              />
            </div>
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
            <label className="block text-sm font-medium text-graphite mb-1">URL аватара</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-snow-dark p-6 space-y-4">
          <h2 className="text-sm font-heading font-semibold text-deep-fjord">Изменение пароля</h2>

          <div>
            <label className="block text-sm font-medium text-graphite mb-1">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-1">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-aurora-teal text-white text-sm font-medium rounded-lg hover:bg-aurora-teal/80 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  )
}
