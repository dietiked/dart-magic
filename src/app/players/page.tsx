import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { PlayersTable } from "./players-table"
import { isPlayerActive } from "@/lib/player-status"

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Tutti i profili
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, first_name, last_name, active_until")
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
    return { ...p, ...stats, losses, winPct, isActive: isPlayerActive(p.active_until) }
  })

  // Ordina: prima chi ha giocato di più, poi alfabetico
  players.sort((a, b) => b.played - a.played || a.nickname.localeCompare(b.nickname))

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-6">Spieler</h1>

      <PlayersTable players={players} />
    </AppShell>
  )
}
