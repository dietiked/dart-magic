import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { TournamentListItem } from "@/components/tournaments/tournament-list-item"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: activeTournaments }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("tournaments")
      .select("*, tournament_players(count)")
      .in("status", ["open", "closed"])
      .order("created_at", { ascending: false }),
  ])

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-1">
        Willkommen, {profile?.nickname ?? "Spieler*in"}!
      </h1>
      <p className="text-muted-foreground mb-8">Hier sind die aktuellen Turniere.</p>

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
            <TournamentListItem key={t.id} tournament={t} href={`/tournaments/${t.id}`} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
