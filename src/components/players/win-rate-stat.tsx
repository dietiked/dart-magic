export function WinRateStat({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses
  const winPct = total > 0 ? Math.round((wins / total) * 100) : null

  return (
    <div className="bg-white border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold tabular-nums">{winPct !== null ? `${winPct}%` : "—"}</div>
      <div className="text-xs text-muted-foreground mt-1">Siegquote</div>
    </div>
  )
}
