"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function invitePlayer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  if (!email) throw new Error("E-Mail ist erforderlich")

  // Prüfen ob E-Mail bereits registriert
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()
  if (existing) throw new Error("Diese E-Mail-Adresse ist bereits registriert.")

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("invitePlayer error:", JSON.stringify(error))
    throw new Error(error.message || error.code || "Unbekannter Fehler beim Senden der E-Mail")
  }

  revalidatePath("/admin")
}

export async function toggleAdmin(playerId: string, makeAdmin: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  // Verhindert, dass man sich selbst den Admin-Status entzieht
  if (playerId === user.id) throw new Error("Du kannst deinen eigenen Admin-Status nicht ändern")

  // Sicherstellen dass mind. 1 Admin übrig bleibt
  if (!makeAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true)
    if ((count ?? 0) <= 1) throw new Error("Es muss mindestens ein Admin verbleiben")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: makeAdmin })
    .eq("id", playerId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function updateActiveUntil(playerId: string, activeUntil: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  if (activeUntil !== null && !/^\d{4}-\d{2}-\d{2}$/.test(activeUntil)) {
    throw new Error("Ungültiges Datumsformat")
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active_until: activeUntil })
    .eq("id", playerId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}
