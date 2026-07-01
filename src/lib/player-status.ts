export function isPlayerActive(activeUntil: string | null): boolean {
  if (!activeUntil) return true
  const today = new Date().toISOString().slice(0, 10)
  return activeUntil >= today
}
