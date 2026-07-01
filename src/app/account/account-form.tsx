"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/app/actions/profile"

interface AccountFormProps {
  email: string
  nickname: string
  firstName: string | null
  lastName: string | null
}

export function AccountForm({ email, nickname, firstName, lastName }: AccountFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setSuccess(false)
    setError(null)
    startTransition(async () => {
      try {
        await updateProfile(formData)
        setSuccess(true)
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5 bg-white border rounded-lg p-6">
      <div className="space-y-2">
        <Label>E-Mail</Label>
        <Input value={email} disabled className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Die E-Mail-Adresse kann nicht geändert werden.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname *</Label>
        <Input id="nickname" name="nickname" defaultValue={nickname} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input id="first_name" name="first_name" defaultValue={firstName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input id="last_name" name="last_name" defaultValue={lastName ?? ""} />
        </div>
      </div>

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          Profil gespeichert.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Wird gespeichert…" : "Speichern"}
      </Button>
    </form>
  )
}
