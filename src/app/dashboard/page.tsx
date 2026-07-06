import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { TournamentListItem } from "@/components/tournaments/tournament-list-item"
import { WinLossDonut } from "@/components/players/win-loss-donut"
import { WinRateStat } from "@/components/players/win-rate-stat"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: activeTournaments }, { data: myMatches }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("tournaments")
      .select("*, tournament_players(count), matches(count)")
      .in("status", ["open", "closed"])
      .order("created_at", { ascending: false }),
    supabase
      .from("matches")
      .select("winner_id")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq("is_bye", false)
      .not("winner_id", "is", null),
  ])

  const wins = (myMatches ?? []).filter(m => m.winner_id === user.id).length
  const losses = (myMatches ?? []).length - wins

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-1">
        Willkommen, {profile?.nickname ?? "Spieler*in"}!
      </h1>
      <p className="text-muted-foreground mb-8">Hier sind die aktuellen Turniere.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {!activeTournaments?.length ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Keine aktiven Turniere vorhanden.</p>
              <Link href="/tournaments" className="text-sm underline mt-2 inline-block">
                Alle Turniere ansehen
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTournaments.map((t) => (
                <TournamentListItem
                  key={t.id}
                  tournament={t}
                  href={`/tournaments/${t.id}`}
                  hasBracket={(t.matches?.[0]?.count ?? 0) > 0}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <WinLossDonut wins={wins} losses={losses} />
          <WinRateStat wins={wins} losses={losses} />
        </div>
      </div>
    </AppShell>
  )
}
