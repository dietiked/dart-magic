"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function submitSignup(tokenValue: string, formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const first_name = (formData.get("first_name") as string)?.trim() || null
  const last_name = (formData.get("last_name") as string)?.trim() || null
  const nickname = (formData.get("nickname") as string)?.trim()

  if (!email || !nickname) throw new Error("E-Mail und Nickname sind erforderlich")

  // Validiere das Token
  const { data: token } = await supabase
    .from("signup_tokens")
    .select("id, is_active")
    .eq("token", tokenValue)
    .single()

  if (!token || !token.is_active) throw new Error("Dieser Anmeldelink ist nicht mehr gültig.")

  // Prüfe ob E-Mail bereits registriert
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existing) throw new Error("Diese E-Mail-Adresse ist bereits registriert.")

  // Speichere die Anmeldedaten für nach dem E-Mail-Klick
  const { error: insertError } = await supabase
    .from("pending_signups")
    .insert({ email, first_name, last_name, nickname, token_id: token.id })

  if (insertError) throw new Error(insertError.message)

  // Sende den Magic Link
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (otpError) {
    // Cleanup pending signup bei Fehler
    await supabase.from("pending_signups").delete().eq("email", email)
    throw new Error(otpError.message || "Fehler beim Senden der E-Mail")
  }
}

export async function generateSignupToken() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  // Deaktiviere alle bestehenden Token
  await supabase.from("signup_tokens").update({ is_active: false }).eq("is_active", true)

  // Erstelle neuen Token
  const { data, error } = await supabase
    .from("signup_tokens")
    .insert({ created_by: user.id })
    .select("token")
    .single()

  if (error) throw new Error(error.message)
  return data.token as string
}

export async function deactivateSignupToken() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) throw new Error("Nicht berechtigt")

  await supabase.from("signup_tokens").update({ is_active: false }).eq("is_active", true)
}
