import { TournamentStatus } from "@/types/database"

export const statusLabel: Record<TournamentStatus, string> = {
  open: "Anmeldung offen",
  closed: "Anmeldung geschlossen",
  finished: "Beendet",
}

export const statusVariant: Record<TournamentStatus, "success" | "warning" | "secondary"> = {
  open: "success",
  closed: "warning",
  finished: "secondary",
}
