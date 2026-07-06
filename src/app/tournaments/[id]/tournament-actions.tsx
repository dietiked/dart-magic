"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  disabled?: boolean
  /** Nur für type="finish-tournament": ob alle Partien bereits gespielt wurden */
  isComplete?: boolean
}

export function TournamentActions({
  type,
  tournamentId,
  playerId,
  disabled = false,
  isComplete = false,
}: TournamentActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleAction = () => {
    setError(null)
    startTransition(async () => {
      try {
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
            await updateTournamentStatus(tournamentId, "finished")
            break
          case "generate-bracket":
            await generateBracket(tournamentId)
            break
          case "remove-player":
            if (playerId) await removePlayerFromTournament(tournamentId, playerId)
            break
        }
      } catch (e) {
        setError((e as Error).message)
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

  if (type === "finish-tournament") {
    return (
      <div className="space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={variant} className="w-full" disabled={isPending || disabled}>
              {isPending ? pendingLabel : label}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isComplete ? "Turnier beenden?" : "Turnier ist noch nicht abgeschlossen"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isComplete
                  ? "Bist du sicher, dass du dieses Turnier als beendet markieren möchtest?"
                  : "Es wurden noch nicht alle Partien gespielt. Möchtest du das Turnier trotzdem beenden?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleAction}>
                {isComplete ? "Ja, Turnier beenden" : "Trotzdem Turnier beenden"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={type === "remove-player" ? "sm" : "default"}
      className={type !== "remove-player" ? "w-full" : ""}
      onClick={handleAction}
      disabled={isPending || disabled}
    >
      {isPending ? pendingLabel : label}
    </Button>
  )
}
