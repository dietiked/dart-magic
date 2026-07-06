import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tournament } from "@/types/database"
import { getDisplayStatus, displayStatusLabel, displayStatusVariant } from "@/lib/tournament-status"

export function TournamentListItem({
  tournament,
  href,
  hasBracket,
}: {
  tournament: Tournament
  href: string
  hasBracket: boolean
}) {
  const displayStatus = getDisplayStatus(tournament.status, hasBracket)

  return (
    <Link href={href} className="block">
      <div className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between hover:border-gray-400 transition-colors">
        <div className="flex items-center gap-4">
          <span className="font-medium">{tournament.name}</span>
          <Badge variant={displayStatusVariant[displayStatus]}>
            {displayStatusLabel[displayStatus]}
          </Badge>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
