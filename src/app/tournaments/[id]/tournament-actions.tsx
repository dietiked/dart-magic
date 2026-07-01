"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  registerForTournament,
  unregisterFromTournament,
  updateTournamentStatus,
  removePlayerFromTournament,
} from "@/app/actions/tournaments"
import { generateBracket } from "@/app/actions/bracket"

type ActionType =
  | "register"
  | "unregister"
  | "close-registrations"
  | "reopen-registrations"
  | "generate-bracket"
  | "finish-tournament"
  | "remove-player"

interface TournamentActionsProps {
  type: ActionType
  tournamentId: string
  playerId?: string
}

export function TournamentActions({ type, tournamentId, playerId }: TournamentActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = () => {
    startTransition(async () => {
      switch (type) {
        case "register":
          await registerForTournament(tournamentId)
          break
        case "unregister":
          await unregisterFromTournament(tournamentId)
          break
        case "close-registrations":
          await updateTournamentStatus(tournamentId, "closed")
          break
        case "reopen-registrations":
          await updateTournamentStatus(tournamentId, "open")
          break
        case "finish-tournament":
          if (confirm("Turnier wirklich als beendet markieren?")) {
            await updateTournamentStatus(tournamentId, "finished")
          }
          break
        case "generate-bracket":
          await generateBracket(tournamentId)
          break
        case "remove-player":
          if (playerId) await removePlayerFromTournament(tournamentId, playerId)
          break
      }
    })
  }

  const config: Record<ActionType, { label: string; variant: "default" | "outline" | "destructive"; pendingLabel: string }> = {
    "register": { label: "Anmelden", variant: "default", pendingLabel: "Wird angemeldet…" },
    "unregister": { label: "Abmelden", variant: "outline", pendingLabel: "Wird abgemeldet…" },
    "close-registrations": { label: "Anmeldung schließen", variant: "outline", pendingLabel: "Wird geschlossen…" },
    "reopen-registrations": { label: "Anmeldung wieder öffnen", variant: "outline", pendingLabel: "Wird geöffnet…" },
    "generate-bracket": { label: "Turnierbaum erstellen", variant: "default", pendingLabel: "Wird erstellt…" },
    "finish-tournament": { label: "Turnier beenden", variant: "destructive", pendingLabel: "Wird beendet…" },
    "remove-player": { label: "Entfernen", variant: "outline", pendingLabel: "…" },
  }

  const { label, variant, pendingLabel } = config[type]

  return (
    <Button
      variant={variant}
      size={type === "remove-player" ? "sm" : "default"}
      className={type !== "remove-player" ? "w-full" : ""}
      onClick={handleAction}
      disabled={isPending}
    >
      {isPending ? pendingLabel : label}
    </Button>
  )
}
