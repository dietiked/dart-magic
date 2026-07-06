"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isPlayerActive } from "@/lib/player-status"
import { tournamentHasBracket } from "@/lib/bracket"

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  const name = formData.get("name") as string
  const rules = formData.get("rules") as string
  const sets_to_win = parseInt(formData.get("sets_to_win") as string)

  const { data, error } = await supabase
    .from("tournaments")
    .insert({ name, rules, sets_to_win })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/tournaments")
  redirect(`/tournaments/${data.id}`)
}

export async function updateTournamentStatus(
  id: string,
  status: "open" | "closed" | "finished"
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  if (status === "open" && await tournamentHasBracket(supabase, id)) {
    throw new Error("Anmeldung kann nicht wieder geöffnet werden, da der Turnierbaum bereits erstellt wurde.")
  }

  await supabase.from("tournaments").update({ status }).eq("id", id)

  revalidatePath(`/tournaments/${id}`)
  revalidatePath("/tournaments")
}

export async function registerForTournament(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("active_until").eq("id", user.id).single()
  if (!isPlayerActive(profile?.active_until ?? null)) {
    throw new Error("Inaktive Spieler*innen können sich nicht für Turniere anmelden.")
  }

  await supabase.from("tournament_players").insert({
    tournament_id: tournamentId,
    player_id: user.id,
  })

  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function unregisterFromTournament(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  if (await tournamentHasBracket(supabase, tournamentId)) {
    throw new Error("Abmelden ist nicht mehr möglich, da der Turnierbaum bereits erstellt wurde.")
  }

  await supabase
    .from("tournament_players")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", user.id)

  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function removePlayerFromTournament(tournamentId: string, playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  if (await tournamentHasBracket(supabase, tournamentId)) {
    throw new Error("Spieler*in kann nicht mehr entfernt werden, da der Turnierbaum bereits erstellt wurde.")
  }

  await supabase
    .from("tournament_players")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)

  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function updateTournamentDetails(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  const name = formData.get("name") as string
  const rules = formData.get("rules") as string
  const sets_to_win = parseInt(formData.get("sets_to_win") as string)

  await supabase.from("tournaments").update({ name, rules, sets_to_win }).eq("id", id)

  revalidatePath(`/tournaments/${id}`)
}
