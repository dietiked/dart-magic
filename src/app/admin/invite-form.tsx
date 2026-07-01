"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { invitePlayer } from "@/app/actions/admin"

export function InviteForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setSuccess(null)
    setError(null)
    const email = formData.get("email") as string
    startTransition(async () => {
      try {
        await invitePlayer(formData)
        setSuccess(`Magic Link wurde an ${email} gesendet.`)
        ;(document.getElementById("invite-email") as HTMLInputElement).value = ""
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg || "Unbekannter Fehler")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email">E-Mail-Adresse</Label>
        <div className="flex gap-2">
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="name@beispiel.ch"
            required
            className="max-w-sm"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Wird gesendet…" : "Einladen"}
          </Button>
        </div>
      </div>

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          {success}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}
    </form>
  )
}
