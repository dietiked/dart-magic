import { AppShell } from "@/components/layout/app-shell"
import { NewTournamentForm } from "./new-tournament-form"

export default function NewTournamentPage() {
  return (
    <AppShell>
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold mb-6">Neues Turnier erstellen</h1>
        <NewTournamentForm />
      </div>
    </AppShell>
  )
}
