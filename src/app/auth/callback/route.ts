import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Prüfe ob ein pending signup für diesen Benutzer vorliegt
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data: pending } = await supabase
          .from("pending_signups")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (pending) {
          // Profil mit den Anmeldedaten aktualisieren
          await supabase
            .from("profiles")
            .update({
              first_name: pending.first_name,
              last_name: pending.last_name,
              nickname: pending.nickname,
            })
            .eq("id", user.id)

          // Pending signup löschen
          await supabase.from("pending_signups").delete().eq("id", pending.id)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
