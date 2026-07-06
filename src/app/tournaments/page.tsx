import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { TournamentListItem } from "@/components/tournaments/tournament-list-item"
import { Plus } from "lucide-react"

export default async function TournamentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: tournaments }, { data: profile }] = await Promise.all([
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
  ])

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Turniere</h1>
        {profile?.is_admin && (
          <Link href="/tournaments/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Neues Turnier
            </Button>
          </Link>
        )}
      </div>

      {!tournaments?.length ? (
        <p className="text-muted-foreground">Noch keine Turniere vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => {
            const href = t.status === "open"
              ? `/tournaments/${t.id}`
              : `/tournaments/${t.id}/bracket`
            return <TournamentListItem key={t.id} tournament={t} href={href} />
          })}
        </div>
      )}
    </AppShell>
  )
}
