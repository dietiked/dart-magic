"use client"

import { MatchCard } from "./match-card"

interface Player {
  id: string
  nickname: string
}

interface MatchData {
  id: string
  round: number
  position: number
  player1_id: string | null
  player2_id: string | null
  winner_id: string | null
  is_bye: boolean
  player1: Player | null
  player2: Player | null
  sets: { set_number: number; score_p1: number; score_p2: number }[]
}

interface BracketViewProps {
  matches: MatchData[]
  legsToWin: number
  tournamentId: string
  currentUserId: string
  isAdmin: boolean
}

const ROUND_LABELS: Record<number, string> = {
  1: "Runde 1",
  2: "Viertelfinale",
  3: "Halbfinale",
  4: "Finale",
}

function getRoundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return "Finale"
  if (fromEnd === 1) return "Halbfinale"
  if (fromEnd === 2) return "Viertelfinale"
  return `Runde ${round}`
}

export function BracketView({
  matches,
  legsToWin,
  tournamentId,
  currentUserId,
  isAdmin,
}: BracketViewProps) {
  const totalRounds = Math.max(...matches.map(m => m.round))

  // Raggruppa per turno
  const byRound: Record<number, MatchData[]> = {}
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = []
    byRound[m.round].push(m)
    byRound[m.round].sort((a, b) => a.position - b.position)
  }

  return (
    <div id="bracket-container" className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
          const roundMatches = byRound[round] ?? []
          const isFinalRound = round === totalRounds
          // Calcola il gap verticale tra le card in base al turno
          // Round 1: nessun gap extra, round 2: gap = 1 card, round 3: gap = 3 card, ecc.
          // BASE_SLOT_H = altezza card + gap base round 1
          // Garantisce che le card dei turni successivi siano centrate tra le coppie
          const BASE_SLOT_H = 130 // card (~100px) + gap base (30px)
          const gapMultiplier = Math.pow(2, round - 1)
          const gap = round === 1
            ? 30
            : (gapMultiplier - 1) * BASE_SLOT_H + 30
          const marginTop = round === 1 ? 0 : (gapMultiplier / 2 - 0.5) * BASE_SLOT_H

          return (
            <div key={round} className="flex flex-col" style={{ width: 210 }}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                {getRoundLabel(round, totalRounds)}
              </div>
              <div
                className="flex flex-col"
                style={{ gap: `${gap}px` }}
              >
                {roundMatches.map(match => (
                  <div
                    key={match.id}
                    style={{ marginTop: round === 1 ? 0 : marginTop }}
                  >
                    <MatchCard
                      match={match}
                      legsToWin={legsToWin}
                      tournamentId={tournamentId}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      isFinal={isFinalRound}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
