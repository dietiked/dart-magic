import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { InviteForm } from "./invite-form"
import { ToggleAdminButton } from "./toggle-admin-button"
import { SignupLink } from "./signup-link"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) redirect("/dashboard")

  const [{ data: players }, { data: activeToken }] = await Promise.all([
    supabase.from("profiles").select("id, nickname, first_name, last_name, is_admin").order("nickname"),
    supabase.from("signup_tokens").select("token").eq("is_active", true).limit(1).maybeSingle(),
  ])

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-8">Admin</h1>

      {/* Signup link section */}
      <section className="mb-10">
        <h2 className="text-base font-semibold mb-1">Anmeldelink</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Teile diesen Link mit den Spielern. Nur wer den Link hat, kann sich anmelden.
        </p>
        <SignupLink activeToken={activeToken?.token ?? null} />
      </section>

      {/* Invite section */}
      <section className="mb-10">
        <h2 className="text-base font-semibold mb-1">Spieler einladen</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Der eingeladene Spieler erhält einen Magic Link per E-Mail und kann sich damit einloggen.
        </p>
        <InviteForm />
      </section>

      {/* Player list */}
      <section>
        <h2 className="text-base font-semibold mb-3">Alle Spieler</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nickname</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Rolle</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(players ?? []).map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.nickname}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleAdminButton
                      playerId={p.id}
                      isAdmin={p.is_admin ?? false}
                      isSelf={p.id === user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
