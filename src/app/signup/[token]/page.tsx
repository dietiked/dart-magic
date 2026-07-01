import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SignupForm } from "./signup-form"
import { Target } from "lucide-react"

export default async function SignupPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Validiere Token (ohne Login erforderlich)
  const { data: tokenData } = await supabase
    .from("signup_tokens")
    .select("id, is_active")
    .eq("token", token)
    .single()

  if (!tokenData || !tokenData.is_active) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-7 w-7" />
            <span className="text-xl font-semibold">Dart Magic</span>
          </div>
          <h1 className="text-2xl font-bold">Anmeldung</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Füll das Formular aus um dich auf Dart Magic zu registrieren.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <SignupForm token={token} />
        </div>
      </div>
    </div>
  )
}
