import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { TournamentStatus } from "@/types/database"
import { TournamentActions } from "./tournament-actions"
import { ScrollText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const statusLabel: Record<TournamentStatus, string> = {
  open: "Anmeldung offen",
  closed: "Anmeldung geschlossen",
  finished: "Beendet",
}

const statusVariant: Record<TournamentStatus, "success" | "warning" | "secondary"> = {
  open: "success",
  closed: "warning",
  finished: "secondary",
}

export default async function TournamentPage({
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
      .select(`*, tournament_players(*, player:profiles(*))`)
      .eq("id", id)
      .single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ])

  if (!tournament) notFound()

  const players = tournament.tournament_players ?? []
  const isRegistered = players.some((tp: { player_id: string }) => tp.player_id === user.id)
  const isAdmin = profile?.is_admin ?? false

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{tournament.name}</h1>
            <Badge variant={statusVariant[tournament.status as TournamentStatus]}>
              {statusLabel[tournament.status as TournamentStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {players.length} Spieler{players.length !== 1 ? "" : "in"} angemeldet
            {" · "}Gewinn-Legs: {tournament.sets_to_win}
          </p>
        </div>

        {/* Rules icon */}
        {tournament.rules && (
          <details className="relative">
            <summary className="cursor-pointer list-none">
              <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ScrollText className="h-4 w-4" />
                Reglement
              </span>
            </summary>
            <div className="absolute right-0 top-7 z-10 bg-white border rounded-lg shadow-lg p-4 w-80 text-sm whitespace-pre-wrap">
              {tournament.rules}
            </div>
          </details>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Player list */}
        <div className="md:col-span-2">
          <h2 className="font-medium mb-3">Angemeldete Spieler</h2>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-white border rounded-lg p-4">
              Noch keine Anmeldungen.
            </p>
          ) : (
            <div className="bg-white border rounded-lg divide-y">
              {players.map((tp: { id: string; player_id: string; player: { nickname: string } }) => (
                <div key={tp.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">{tp.player?.nickname}</span>
                  {isAdmin && tournament.status === "open" && (
                    <TournamentActions
                      type="remove-player"
                      tournamentId={id}
                      playerId={tp.player_id}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions panel */}
        <div className="space-y-3">
          {/* Nav: zum Turnierbaum */}
          {tournament.status !== "open" && (
            <>
              <Link href={`/tournaments/${id}/bracket`}>
                <Button variant="outline" className="w-full">Zum Turnierbaum</Button>
              </Link>
              <div className="pt-1" />
            </>
          )}

          {/* Player: register/unregister */}
          {tournament.status === "open" && (
            <TournamentActions
              type={isRegistered ? "unregister" : "register"}
              tournamentId={id}
            />
          )}

          {/* Admin panel */}
          {isAdmin && (
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Admin
              </h3>
              {tournament.status === "open" && (
                <TournamentActions type="close-registrations" tournamentId={id} />
              )}
              {tournament.status === "closed" && (
                <>
                  <TournamentActions type="generate-bracket" tournamentId={id} />
                  <TournamentActions type="reopen-registrations" tournamentId={id} />
                </>
              )}
              {tournament.status !== "finished" && (
                <TournamentActions type="finish-tournament" tournamentId={id} />
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
