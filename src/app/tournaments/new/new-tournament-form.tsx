"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTournament } from "@/app/actions/tournaments"

export function NewTournamentForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await createTournament(formData)
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5 bg-white border rounded-lg p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Turniername</Label>
        <Input id="name" name="name" placeholder="z.B. Dart-WM 2026" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sets_to_win">Gewinn-Legs</Label>
        <Input
          id="sets_to_win"
          name="sets_to_win"
          type="number"
          min={1}
          max={99}
          defaultValue={3}
          required
        />
        <p className="text-xs text-muted-foreground">
          Anzahl Legs, die eine Partie gewinnen muss (z.B. 3 = First to 3 Legs)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Reglement</Label>
        <textarea
          id="rules"
          name="rules"
          rows={6}
          placeholder="Beschreibe die Turnierregeln…"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Wird erstellt…" : "Turnier erstellen"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
