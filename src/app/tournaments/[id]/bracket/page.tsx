import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { BracketView } from "@/components/bracket/bracket-view"
import { PdfExportButton } from "@/components/bracket/pdf-export-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: tournament }, { data: profile }] = await Promise.all([
    supabase
      .from("tournaments")
      .select("id, name, sets_to_win, status")
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
  ])

  if (!tournament) notFound()

  // Carica le partite con i giocatori e i set
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(`
      id, round, position, player1_id, player2_id, winner_id, is_bye,
      player1:profiles!matches_player1_id_fkey(id, nickname),
      player2:profiles!matches_player2_id_fkey(id, nickname),
      sets(set_number, score_p1, score_p2)
    `)
    .eq("tournament_id", id)
    .order("round")
    .order("position")

  if (!matchesRaw || matchesRaw.length === 0) {
    redirect(`/tournaments/${id}`)
  }

  const matches = matchesRaw.map(m => ({
    ...m,
    player1: Array.isArray(m.player1) ? m.player1[0] ?? null : m.player1,
    player2: Array.isArray(m.player2) ? m.player2[0] ?? null : m.player2,
    sets: (m.sets ?? []).sort((a: { set_number: number }, b: { set_number: number }) => a.set_number - b.set_number),
  }))

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold">{tournament.name}</h1>
            <Badge variant="warning">Turnierbaum</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Gewinn-Legs: {tournament.sets_to_win}
            {" · "}
            {tournament.status === "finished"
              ? "Turnier beendet – Ergebnisse können nicht mehr geändert werden."
              : "Klicke auf eine Partie um das Ergebnis einzutragen"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PdfExportButton tournamentName={tournament.name} />
          <Link href={`/tournaments/${id}`}>
            <Button variant="outline">Teilnehmende</Button>
          </Link>
        </div>
      </div>

      <BracketView
        matches={matches as Parameters<typeof BracketView>[0]["matches"]}
        legsToWin={tournament.sets_to_win}
        tournamentId={id}
        currentUserId={user.id}
        isAdmin={profile?.is_admin ?? false}
        isTournamentFinished={tournament.status === "finished"}
      />
    </AppShell>
  )
}
