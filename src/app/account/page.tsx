import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { AccountForm } from "./account-form"
import Link from "next/link"

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, first_name, last_name")
    .eq("id", user.id)
    .single()

  // Storico partite personali
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id, round, winner_id, is_bye,
      player1:profiles!matches_player1_id_fkey(id, nickname),
      player2:profiles!matches_player2_id_fkey(id, nickname),
      sets(set_number, score_p1, score_p2),
      tournament:tournaments(id, name)
    `)
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .eq("is_bye", false)
    .not("winner_id", "is", null)
    .order("id", { ascending: false })

  const myMatches = (matches ?? []).map(m => {
    const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1
    const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2
    const tournament = Array.isArray(m.tournament) ? m.tournament[0] : m.tournament
    const iAmP1 = p1?.id === user.id
    const opponent = iAmP1 ? p2 : p1
    const won = m.winner_id === user.id
    const legResult = (m.sets ?? [])[0]
    const myLegs = legResult ? (iAmP1 ? legResult.score_p1 : legResult.score_p2) : null
    const oppLegs = legResult ? (iAmP1 ? legResult.score_p2 : legResult.score_p1) : null
    return { id: m.id, tournament, opponent, won, myLegs, oppLegs, round: m.round }
  })

  const wins = myMatches.filter(m => m.won).length
  const losses = myMatches.filter(m => !m.won).length

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-6">Mein Konto</h1>

      <div className="grid gap-8 max-w-2xl">
        {/* Profile form */}
        <section>
          <h2 className="text-base font-semibold mb-3">Profil bearbeiten</h2>
          <AccountForm
            email={user.email ?? ""}
            nickname={profile?.nickname ?? ""}
            firstName={profile?.first_name ?? null}
            lastName={profile?.last_name ?? null}
          />
        </section>

        {/* Match history */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Meine Partien</h2>
            {myMatches.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {wins}S / {losses}N
              </span>
            )}
          </div>

          {myMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Partien gespielt.</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Turnier</th>
                    <th className="text-left px-4 py-2">Gegner</th>
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
                      <td className="px-4 py-2">{m.opponent?.nickname ?? "—"}</td>
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
        </section>
      </div>
    </AppShell>
  )
}
