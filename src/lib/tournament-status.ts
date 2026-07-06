import { TournamentStatus } from "@/types/database"

export type DisplayStatus = "open" | "closed" | "running" | "finished"

/** Turnierbaum existiert (Status "closed" + Partien vorhanden) → "running" statt "closed" */
export function getDisplayStatus(status: TournamentStatus, hasBracket: boolean): DisplayStatus {
  if (status === "finished") return "finished"
  if (status === "closed") return hasBracket ? "running" : "closed"
  return "open"
}

export const displayStatusLabel: Record<DisplayStatus, string> = {
  open: "Anmeldung offen",
  closed: "Anmeldung geschlossen",
  running: "Turnier läuft",
  finished: "Beendet",
}

export const displayStatusVariant: Record<DisplayStatus, "success" | "warning" | "info" | "secondary"> = {
  open: "success",
  closed: "warning",
  running: "info",
  finished: "secondary",
}
