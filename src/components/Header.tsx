"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "./AuthProvider"
import { Task, Project, User } from "@/lib/types"
import Link from "next/link"

interface HeaderProps {
  onMenuClick: () => void
}

interface SearchResult {
  projects: Project[]
  tasks: Task[]
  users: User[]
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        const unread = (data.notifications || []).filter((n: any) => !n.read).length
        setUnreadCount(unread)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch(() => setResults(null))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <header className="h-16 bg-white border-b border-snow-dark flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-graphite/60 hover:bg-snow rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Поиск задач, проектов, людей..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          className="w-full pl-10 pr-4 py-2.5 bg-snow border border-transparent rounded-lg text-sm focus:outline-none focus:border-aurora-teal focus:bg-white transition-all placeholder:text-graphite/40"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {showResults && results && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-snow-dark rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {results.projects.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[11px] font-heading font-semibold text-aurora-teal uppercase tracking-wider">Проекты</p>
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    onClick={() => { setShowResults(false); setQuery("") }}
                    className="block px-3 py-2 text-sm text-graphite hover:bg-snow rounded-lg transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
            {results.tasks.length > 0 && (
              <div className="p-2 border-t border-snow-dark">
                <p className="px-3 py-1.5 text-[11px] font-heading font-semibold text-aurora-teal uppercase tracking-wider">Задачи</p>
                {results.tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/projects/${t.projectId}`}
                    onClick={() => { setShowResults(false); setQuery("") }}
                    className="block px-3 py-2 text-sm text-graphite hover:bg-snow rounded-lg transition-colors"
                  >
                    <span className="font-medium text-deep-fjord">{t.identifier}</span> {t.title}
                  </Link>
                ))}
              </div>
            )}
            {results.users.length > 0 && (
              <div className="p-2 border-t border-snow-dark">
                <p className="px-3 py-1.5 text-[11px] font-heading font-semibold text-aurora-teal uppercase tracking-wider">Люди</p>
                {results.users.map((u) => (
                  <div
                    key={u.id}
                    className="px-3 py-2 text-sm text-graphite"
                  >
                    {u.firstName} {u.lastName}
                  </div>
                ))}
              </div>
            )}
            {results.projects.length === 0 && results.tasks.length === 0 && results.users.length === 0 && (
              <p className="p-4 text-sm text-graphite/50 text-center">Ничего не найдено</p>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative p-2.5 text-graphite/60 hover:bg-snow rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-northern-sun text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal font-heading font-semibold text-xs">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <span className="text-sm font-medium text-graphite hidden sm:block">
          {user?.firstName} {user?.lastName}
        </span>
      </div>
    </header>
  )
}
