import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import Link from "next/link"

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Tutti i profili
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, first_name, last_name")
    .order("nickname")

  // Tutte le partite completate (non bye)
  const { data: matches } = await supabase
    .from("matches")
    .select("player1_id, player2_id, winner_id, is_bye")
    .eq("is_bye", false)
    .not("winner_id", "is", null)

  // Calcola statistiche per ogni giocatore
  const statsMap: Record<string, { played: number; wins: number }> = {}
  for (const m of matches ?? []) {
    for (const pid of [m.player1_id, m.player2_id]) {
      if (!pid) continue
      if (!statsMap[pid]) statsMap[pid] = { played: 0, wins: 0 }
      statsMap[pid].played++
      if (m.winner_id === pid) statsMap[pid].wins++
    }
  }

  const players = (profiles ?? []).map(p => {
    const stats = statsMap[p.id] ?? { played: 0, wins: 0 }
    const losses = stats.played - stats.wins
    const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : null
    return { ...p, ...stats, losses, winPct }
  })

  // Ordina: prima chi ha giocato di più, poi alfabetico
  players.sort((a, b) => b.played - a.played || a.nickname.localeCompare(b.nickname))

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-6">Spieler</h1>

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
            {players.map(p => (
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
    </AppShell>
  )
}
