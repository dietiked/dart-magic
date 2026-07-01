"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
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
type SortColumn = "nickname" | "played" | "wins" | "losses" | "winPct"
type SortDirection = "asc" | "desc"

function SortableHeader({
  label,
  align,
  column,
  activeColumn,
  direction,
  onSort,
}: {
  label: string
  align: "left" | "center"
  column: SortColumn
  activeColumn: SortColumn
  direction: SortDirection
  onSort: (column: SortColumn) => void
}) {
  const isActive = column === activeColumn

  return (
    <th className={`px-4 py-3 ${align === "center" ? "text-center" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${isActive ? "text-blue-600" : ""}`}
      >
        {label}
        {isActive ? (
          direction === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </button>
    </th>
  )
}

export function PlayersTable({ players }: { players: PlayerRow[] }) {
  const [filter, setFilter] = useState<StatusFilter>("aktiv")
  const [sortColumn, setSortColumn] = useState<SortColumn>("played")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(column)
      setSortDirection(column === "nickname" ? "asc" : "desc")
    }
  }

  const filteredPlayers = players.filter(p => {
    if (filter === "alle") return true
    if (filter === "aktiv") return p.isActive
    return !p.isActive
  })

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const cmp =
      sortColumn === "nickname"
        ? a.nickname.localeCompare(b.nickname)
        : sortColumn === "winPct"
          ? (a.winPct ?? -1) - (b.winPct ?? -1)
          : a[sortColumn] - b[sortColumn]
    return sortDirection === "asc" ? cmp : -cmp
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
              <SortableHeader label="Spieler*in" align="left" column="nickname" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="Partien" align="center" column="played" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="Siege" align="center" column="wins" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="Niederlagen" align="center" column="losses" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="Quote" align="center" column="winPct" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedPlayers.map(p => (
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
