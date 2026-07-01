import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { TournamentStatus } from "@/types/database"
import { ChevronRight } from "lucide-react"

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
        Willkommen, {profile?.nickname ?? "Spieler"}!
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
        <div className="space-y-2">
          {activeTournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.id}`}>
              <div className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{t.name}</span>
                  <Badge variant={statusVariant[t.status as TournamentStatus]}>
                    {statusLabel[t.status as TournamentStatus]}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
