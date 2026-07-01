"use client"

import { useState, useTransition } from "react"
import { toggleAdmin } from "@/app/actions/admin"

interface RoleSelectProps {
  playerId: string
  isAdmin: boolean
  isSelf: boolean
}

export function ToggleAdminButton({ playerId, isAdmin, isSelf }: RoleSelectProps) {
  const [value, setValue] = useState<"admin" | "spieler">(isAdmin ? "admin" : "spieler")
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as "admin" | "spieler"
    const makeAdmin = newValue === "admin"

    // Ottimisticamente aggiorna il select
    setValue(newValue)

    startTransition(async () => {
      try {
        await toggleAdmin(playerId, makeAdmin)
      } catch (err) {
        // Ripristina il valore precedente in caso di errore
        setValue(makeAdmin ? "spieler" : "admin")
        alert(err instanceof Error ? err.message : "Fehler")
      }
    })
  }

  if (isSelf) return (
    <span className="text-xs text-muted-foreground">(du)</span>
  )

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm border border-input rounded-md px-2 py-1 bg-white disabled:opacity-50 cursor-pointer"
    >
      <option value="spieler">Spieler</option>
      <option value="admin">Admin</option>
    </select>
  )
}
