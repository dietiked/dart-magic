"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitSignup } from "@/app/actions/signup"

export function SignupForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await submitSignup(token, formData)
        setEmail(formData.get("email") as string)
        setDone(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unbekannter Fehler")
      }
    })
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-2">
        <p className="font-semibold text-green-800">Fast geschafft!</p>
        <p className="text-sm text-green-700">
          Wir haben einen Bestätigungslink an <strong>{email}</strong> gesendet.
          Klicke auf den Link um deine Registrierung abzuschliessen.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input id="first_name" name="first_name" autoComplete="given-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input id="last_name" name="last_name" autoComplete="family-name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Dart-Name *</Label>
        <Input id="nickname" name="nickname" placeholder="Wie du im Turnier heisst" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail *</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Wird gesendet…" : "Anmelden"}
      </Button>
    </form>
  )
}
