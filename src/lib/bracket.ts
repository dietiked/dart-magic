import { createClient } from "@/lib/supabase/server"

export async function tournamentHasBracket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string
) {
  const { count } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
  return (count ?? 0) > 0
}

/** True, wenn der Turnierbaum existiert und die Finalrunde einen Sieger hat. */
export async function isTournamentComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string
) {
  const { data: matches } = await supabase
    .from("matches")
    .select("round, winner_id")
    .eq("tournament_id", tournamentId)
  if (!matches || matches.length === 0) return false
  const maxRound = Math.max(...matches.map(m => m.round))
  return matches.filter(m => m.round === maxRound).every(m => m.winner_id !== null)
}
