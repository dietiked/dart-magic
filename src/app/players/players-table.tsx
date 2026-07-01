"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface PlayerRow {
  id: string
  nickname: string
  first_name: string | null
  last_name: string | null
  isActive: boolean
  played: number
  wins: number
  losses: number
  winPct: number | null
}

type StatusFilter = "aktiv" | "inaktiv" | "alle"

export function PlayersTable({ players }: { players: PlayerRow[] }) {
  const [filter, setFilter] = useState<StatusFilter>("aktiv")

  const filteredPlayers = players.filter(p => {
    if (filter === "alle") return true
    if (filter === "aktiv") return p.isActive
    return !p.isActive
  })

  return (
    <>
      <div className="flex justify-end mb-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
          className="text-sm border border-input rounded-md px-2 py-1 bg-white"
        >
          <option value="aktiv">Aktiv</option>
          <option value="inaktiv">Inaktiv</option>
          <option value="alle">Alle</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">Spieler</th>
              <th className="text-center px-4 py-3">Partien</th>
              <th className="text-center px-4 py-3">Siege</th>
              <th className="text-center px-4 py-3">Niederlagen</th>
              <th className="text-center px-4 py-3">Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPlayers.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/players/${p.id}`} className="font-medium hover:underline text-blue-600">
                    {p.nickname}
                  </Link>
                  {(p.first_name || p.last_name) && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {[p.first_name, p.last_name].filter(Boolean).join(" ")}
                    </span>
                  )}
                  {!p.isActive && (
                    <Badge variant="destructive" className="ml-2">Inaktiv</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-center tabular-nums">{p.played}</td>
                <td className="px-4 py-3 text-center tabular-nums text-green-700 font-medium">{p.wins}</td>
                <td className="px-4 py-3 text-center tabular-nums text-red-600">{p.losses}</td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {p.winPct !== null ? `${p.winPct}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
