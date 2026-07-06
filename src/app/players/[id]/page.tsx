import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { PlayerCharts } from "./player-charts"

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, first_name, last_name")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  // Partite completate (non bye) dove ha giocato
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, round, winner_id, is_bye, created_at,
      player1:profiles!matches_player1_id_fkey(id, nickname),
      player2:profiles!matches_player2_id_fkey(id, nickname),
      sets(set_number, score_p1, score_p2),
      tournament:tournaments(id, name)
    `)
    .or(`player1_id.eq.${id},player2_id.eq.${id}`)
    .eq("is_bye", false)
    .not("winner_id", "is", null)
    .order("created_at", { ascending: true })

  const myMatchesChrono = (matches ?? []).map(m => {
    const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1
    const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2
    const tournament = Array.isArray(m.tournament) ? m.tournament[0] : m.tournament
    const iAmP1 = p1?.id === id
    const opponent = iAmP1 ? p2 : p1
    const won = m.winner_id === id
    const legResult = (m.sets ?? [])[0]
    const myLegs = legResult ? (iAmP1 ? legResult.score_p1 : legResult.score_p2) : null
    const oppLegs = legResult ? (iAmP1 ? legResult.score_p2 : legResult.score_p1) : null
    return { id: m.id, tournament, opponent, won, myLegs, oppLegs }
  })

  const myMatches = [...myMatchesChrono].reverse()

  const wins = myMatches.filter(m => m.won).length
  const losses = myMatches.filter(m => !m.won).length
  const winPct = myMatches.length > 0 ? Math.round((wins / myMatches.length) * 100) : null

  // Dati per il grafico "Siegquote nel Verlauf": quota cumulativa dopo ogni partita
  let cumWins = 0
  const winRateSeries = myMatchesChrono.map((m, i) => {
    if (m.won) cumWins++
    return { match: i + 1, quote: Math.round((cumWins / (i + 1)) * 100) }
  })

  // Dati per il grafico "Legs pro Turnier": somma legs vinti/persi raggruppati per torneo
  const legsByTournament = new Map<string, { name: string; legsWon: number; legsLost: number }>()
  for (const m of myMatchesChrono) {
    if (!m.tournament || m.myLegs === null || m.oppLegs === null) continue
    const key = m.tournament.id
    const entry = legsByTournament.get(key) ?? { name: m.tournament.name, legsWon: 0, legsLost: 0 }
    entry.legsWon += m.myLegs
    entry.legsLost += m.oppLegs
    legsByTournament.set(key, entry)
  }
  const legsSeries = Array.from(legsByTournament.values())

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ")

  return (
    <AppShell>
      <Link href="/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4" />
        Alle Spieler*innen
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{profile.nickname}</h1>
        {fullName && <p className="text-muted-foreground">{fullName}</p>}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Partien", value: myMatches.length },
          { label: "Siege", value: wins, color: "text-green-700" },
          { label: "Niederlagen", value: losses, color: "text-red-600" },
          { label: "Quote", value: winPct !== null ? `${winPct}%` : "—" },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold tabular-nums ${s.color ?? ""}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Statistik-Charts */}
      {myMatches.length > 0 && (
        <PlayerCharts
          wins={wins}
          losses={losses}
          winRateSeries={winRateSeries}
          legsSeries={legsSeries}
        />
      )}

      {/* Match history */}
      <h2 className="text-base font-semibold mb-3">Partien</h2>
      {myMatches.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Partien gespielt.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">Turnier</th>
                <th className="text-left px-4 py-2">Gegner*in</th>
                <th className="text-center px-4 py-2">Ergebnis</th>
                <th className="text-center px-4 py-2">Legs</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myMatches.map(m => (
                <tr key={m.id} className={m.won ? "bg-green-50" : ""}>
                  <td className="px-4 py-2">
                    <Link href={`/tournaments/${m.tournament?.id}/bracket`} className="hover:underline text-blue-600">
                      {m.tournament?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {m.opponent ? (
                      <Link href={`/players/${m.opponent.id}`} className="hover:underline">
                        {m.opponent.nickname}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className={`px-4 py-2 text-center font-semibold ${m.won ? "text-green-700" : "text-red-600"}`}>
                    {m.won ? "Sieg" : "Niederlage"}
                  </td>
                  <td className="px-4 py-2 text-center tabular-nums text-gray-600">
                    {m.myLegs !== null ? `${m.myLegs}:${m.oppLegs}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
