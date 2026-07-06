import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "./navbar"
import { Footer } from "./footer"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
