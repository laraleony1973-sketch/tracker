"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setError("Неверный email или пароль")
        return
      }

      const data = await res.json()
      setUser(data.user || data)
      router.push("/")
    } catch {
      setError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-deep-fjord relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 300 Q200 250 400 300 Q600 350 800 300" stroke="#00A9A5" strokeWidth="2" fill="none" opacity="0.3"/>
            <path d="M0 320 Q200 270 400 320 Q600 370 800 320" stroke="#00A9A5" strokeWidth="1.5" fill="none" opacity="0.2"/>
            <path d="M0 340 Q200 290 400 340 Q600 390 800 340" stroke="#4CC9F0" strokeWidth="1" fill="none" opacity="0.15"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <img src="/logo-icon.svg" alt="NordFlow" className="w-16 h-16 mb-8" />
          <h1 className="text-4xl font-heading font-bold text-white mb-4 leading-tight">
            Nord<span className="text-aurora-teal">Flow</span> Tasks
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-md">
            Система управления задачами для команды. Организуйте проекты, контролируйте сроки, работайте в одном потоке.
          </p>
          <div className="mt-12 flex items-center gap-6 text-sm text-white/40">
            <span>nordflow.io</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>hello@nordflow.io</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-snow px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo-icon.svg" alt="NordFlow" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-heading font-bold text-deep-fjord">
              Nord<span className="text-aurora-teal">Flow</span> Tasks
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-snow-dark p-8">
            <h2 className="text-xl font-heading font-bold text-deep-fjord mb-1">Вход в аккаунт</h2>
            <p className="text-sm text-graphite/50 mb-6">Введите email и пароль для входа</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-northern-sun/10 text-northern-sun text-sm rounded-lg border border-northern-sun/20">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-graphite mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal transition-all outline-none"
                  placeholder="you@nordflow.io"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1.5">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-snow-dark rounded-lg text-sm focus:ring-2 focus:ring-aurora-teal/30 focus:border-aurora-teal transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/40 hover:text-graphite/70 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-aurora-teal text-white text-sm font-semibold rounded-lg hover:bg-aurora-teal-light disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Вход...
                  </span>
                ) : "Войти"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-graphite/40 mt-6">
            NordFlow &copy; 2026. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  )
}
