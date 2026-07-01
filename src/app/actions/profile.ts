"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const nickname = (formData.get("nickname") as string)?.trim()
  const first_name = (formData.get("first_name") as string)?.trim() || null
  const last_name = (formData.get("last_name") as string)?.trim() || null

  if (!nickname) throw new Error("Nickname ist erforderlich")

  const { error } = await supabase
    .from("profiles")
    .update({ nickname, first_name, last_name })
    .eq("id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/account")
  revalidatePath("/players")
}
