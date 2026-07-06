import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tournament, TournamentStatus } from "@/types/database"
import { statusLabel, statusVariant } from "@/lib/tournament-status"

export function TournamentListItem({ tournament, href }: { tournament: Tournament; href: string }) {
  return (
    <Link href={href} className="block">
      <div className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between hover:border-gray-400 transition-colors">
        <div className="flex items-center gap-4">
          <span className="font-medium">{tournament.name}</span>
          <Badge variant={statusVariant[tournament.status as TournamentStatus]}>
            {statusLabel[tournament.status as TournamentStatus]}
          </Badge>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
