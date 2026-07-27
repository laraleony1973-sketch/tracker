"use client"

import { useState, useEffect } from "react"
import { User, Task } from "@/lib/types"

interface TeamMember extends User {
  _count?: {
    assignedTasks: number
  }
  overdueTasks?: number
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setTeam(data.users || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-deep-fjord">Команда</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const active = member._count?.assignedTasks || 0
          const overdue = member.overdueTasks || 0
          const workload = active > 0 ? Math.min(Math.round((active / 10) * 100), 100) : 0

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-snow-dark p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-deep-fjord flex items-center justify-center text-aurora-teal font-semibold">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-deep-fjord">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-xs text-graphite/50">{member.position || member.role}</p>
                </div>
              </div>

              <p className="text-xs text-graphite/50 mb-3">{member.email}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-snow rounded-lg">
                  <p className="text-lg font-bold text-aurora-teal">{active}</p>
                  <p className="text-xs text-graphite/50">Активных</p>
                </div>
                <div className="text-center p-2 bg-snow rounded-lg">
                  <p className="text-lg font-bold text-northern-sun">{overdue}</p>
                  <p className="text-xs text-graphite/50">Просрочено</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-graphite/50">Нагрузка</span>
                  <span className="text-xs font-medium text-graphite/70">{workload}%</span>
                </div>
                <div className="h-2 bg-snow rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      workload > 80 ? "bg-northern-sun" : workload > 50 ? "bg-northern-sun/60" : "bg-aurora-teal"
                    }`}
                    style={{ width: `${workload}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
