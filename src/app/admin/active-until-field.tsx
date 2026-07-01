"use client"

import { useState, useTransition } from "react"
import { updateActiveUntil } from "@/app/actions/admin"
import { Badge } from "@/components/ui/badge"
import { isPlayerActive } from "@/lib/player-status"

interface ActiveUntilFieldProps {
  playerId: string
  activeUntil: string | null
}

export function ActiveUntilField({ playerId, activeUntil }: ActiveUntilFieldProps) {
  const [value, setValue] = useState(activeUntil ?? "")
  const [isPending, startTransition] = useTransition()

  const save = (newValue: string) => {
    const previous = value
    setValue(newValue)

    startTransition(async () => {
      try {
        await updateActiveUntil(playerId, newValue || null)
      } catch (err) {
        setValue(previous)
        alert(err instanceof Error ? err.message : "Fehler")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value}
        onChange={(e) => save(e.target.value)}
        disabled={isPending}
        className="text-sm border border-input rounded-md px-2 py-1 bg-white disabled:opacity-50"
      />
      {value && (
        <button
          type="button"
          onClick={() => save("")}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Datum löschen"
        >
          ✕
        </button>
      )}
      <Badge variant={isPlayerActive(value) ? "success" : "destructive"}>
        {isPlayerActive(value) ? "Aktiv" : "Inaktiv"}
      </Badge>
    </div>
  )
}
