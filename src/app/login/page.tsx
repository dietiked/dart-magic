"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError("Fehler beim Senden der E-Mail. Bitte versuche es erneut.")
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dart-Turnier</CardTitle>
          <CardDescription>
            Melde dich mit deiner E-Mail-Adresse an
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md p-4">
                ✓ Link gesendet! Überprüfe deine E-Mails und klicke auf den Link, um dich anzumelden.
              </p>
              <button
                className="text-sm text-muted-foreground underline mt-2"
                onClick={() => { setSent(false); setEmail("") }}
              >
                Andere E-Mail-Adresse verwenden
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.ch"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird gesendet…" : "Login-Link senden"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
