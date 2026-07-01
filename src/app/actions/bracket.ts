"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function generateBracket(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Solo admin
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  // Carica i giocatori iscritti
  const { data: players } = await supabase
    .from("tournament_players")
    .select("player_id")
    .eq("tournament_id", tournamentId)

  if (!players || players.length < 2) throw new Error("Mindestens 2 Spieler erforderlich")

  const playerIds = players.map(p => p.player_id)
  const N = playerIds.length

  // Prossima potenza di 2
  let bracketSize = 1
  while (bracketSize < N) bracketSize *= 2

  // Sorteggio casuale
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5)
  while (shuffled.length < bracketSize) shuffled.push(null as unknown as string)

  const totalRounds = Math.log2(bracketSize)

  // Cancella eventuali partite esistenti
  await supabase.from("matches").delete().eq("tournament_id", tournamentId)

  // Crea le partite del primo turno
  const round1Matches = []
  for (let i = 0; i < bracketSize; i += 2) {
    const p1 = shuffled[i] ?? null
    const p2 = shuffled[i + 1] ?? null
    const isBye = !p1 || !p2
    round1Matches.push({
      tournament_id: tournamentId,
      round: 1,
      position: i / 2,
      player1_id: p1,
      player2_id: p2,
      is_bye: isBye,
      winner_id: isBye ? (p1 ?? p2) : null,
    })
  }

  // Crea i placeholder per i turni successivi
  const laterMatches = []
  for (let round = 2; round <= totalRounds; round++) {
    const count = bracketSize / Math.pow(2, round)
    for (let pos = 0; pos < count; pos++) {
      laterMatches.push({
        tournament_id: tournamentId,
        round,
        position: pos,
        player1_id: null,
        player2_id: null,
        is_bye: false,
        winner_id: null,
      })
    }
  }

  const { error } = await supabase
    .from("matches")
    .insert([...round1Matches, ...laterMatches])
  if (error) throw new Error(error.message)

  // Avanza automaticamente i giocatori con bye
  for (const match of round1Matches) {
    if (match.is_bye && match.winner_id && totalRounds > 1) {
      const nextPos = Math.floor(match.position / 2)
      const slot = match.position % 2 === 0 ? "player1_id" : "player2_id"
      await supabase
        .from("matches")
        .update({ [slot]: match.winner_id })
        .eq("tournament_id", tournamentId)
        .eq("round", 2)
        .eq("position", nextPos)
    }
  }

  // Salva le posizioni nel sorteggio
  for (let i = 0; i < shuffled.length; i++) {
    if (shuffled[i]) {
      await supabase
        .from("tournament_players")
        .update({ draw_position: i })
        .eq("tournament_id", tournamentId)
        .eq("player_id", shuffled[i])
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`)
  redirect(`/tournaments/${tournamentId}/bracket`)
}

export async function submitMatchResult(
  matchId: string,
  sets: { score_p1: number; score_p2: number }[],
  tournamentId: string
) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("submit_match_result", {
    p_match_id: matchId,
    p_sets: sets,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/tournaments/${tournamentId}/bracket`)
}
