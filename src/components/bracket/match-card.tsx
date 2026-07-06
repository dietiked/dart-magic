"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { submitMatchResult } from "@/app/actions/bracket"

interface MatchCardProps {
  match: {
    id: string
    round: number
    position: number
    player1: { id: string; nickname: string } | null
    player2: { id: string; nickname: string } | null
    winner_id: string | null
    is_bye: boolean
    sets: { set_number: number; score_p1: number; score_p2: number }[]
  }
  legsToWin: number
  tournamentId: string
  currentUserId: string
  isAdmin: boolean
  isFinal?: boolean
}

export function MatchCard({
  match,
  legsToWin,
  tournamentId,
  currentUserId,
  isAdmin,
  isFinal = false,
}: MatchCardProps) {
  const legResult = match.sets[0] ?? null
  const [showForm, setShowForm] = useState(false)
  const [legsP1, setLegsP1] = useState(legResult?.score_p1 ?? 0)
  const [legsP2, setLegsP2] = useState(legResult?.score_p2 ?? 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canEnterResult =
    match.player1 &&
    match.player2 &&
    !match.is_bye &&
    (isAdmin || match.player1.id === currentUserId || match.player2.id === currentUserId)

  const p1Won = match.winner_id === match.player1?.id
  const p2Won = match.winner_id === match.player2?.id

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      try {
        await submitMatchResult(
          match.id,
          [{ score_p1: legsP1, score_p2: legsP2 }],
          tournamentId
        )
        setShowForm(false)
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  return (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm ${isFinal ? "border-yellow-400 shadow-yellow-100" : ""}`}>
      {isFinal && (
        <div className="bg-yellow-50 text-yellow-800 text-xs font-semibold px-3 py-1 text-center">
          FINALE
        </div>
      )}

      {/* Player 1 */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${p1Won ? "bg-green-50" : ""}`}>
        <span className={`text-sm font-medium ${p1Won ? "text-green-800" : !match.player1 ? "text-gray-300" : ""}`}>
          {match.player1?.nickname ?? "TBD"}
        </span>
        {legResult && (
          <span className={`text-sm font-bold tabular-nums ${p1Won ? "text-green-800" : "text-gray-500"}`}>
            {legResult.score_p1}
          </span>
        )}
      </div>

      {/* Player 2 */}
      <div className={`flex items-center justify-between px-3 py-2 ${p2Won ? "bg-green-50" : ""}`}>
        <span className={`text-sm font-medium ${p2Won ? "text-green-800" : !match.player2 ? "text-gray-300" : ""}`}>
          {match.is_bye ? "Freilos" : (match.player2?.nickname ?? "TBD")}
        </span>
        {legResult && (
          <span className={`text-sm font-bold tabular-nums ${p2Won ? "text-green-800" : "text-gray-500"}`}>
            {legResult.score_p2}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {canEnterResult && !showForm && (
        <div className="px-3 py-2 border-t bg-gray-50">
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-accent hover:text-accent/70"
          >
            {match.winner_id ? "Ergebnis korrigieren" : "Ergebnis eingeben"}
          </button>
        </div>
      )}

      {/* Leg entry form */}
      {showForm && (
        <div className="border-t p-3 bg-gray-50 space-y-3">
          <p className="text-xs font-medium text-gray-600">
            Legs (Gewinner: {legsToWin} Legs)
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-14 truncate">{match.player1?.nickname}</span>
            <input
              type="number" min={0} max={99}
              value={legsP1}
              onChange={e => setLegsP1(parseInt(e.target.value) || 0)}
              className="w-14 text-center text-sm border rounded px-1 py-1 font-bold"
            />
            <span className="text-gray-400">:</span>
            <input
              type="number" min={0} max={99}
              value={legsP2}
              onChange={e => setLegsP2(parseInt(e.target.value) || 0)}
              className="w-14 text-center text-sm border rounded px-1 py-1 font-bold"
            />
            <span className="text-xs text-gray-500 w-14 truncate text-right">{match.player2?.nickname}</span>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isPending} className="text-xs h-7">
              {isPending ? "Speichert…" : "Speichern"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-7">
              Abbrechen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
