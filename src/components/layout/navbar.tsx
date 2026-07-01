import Link from "next/link"
import { Target } from "lucide-react"
import { LogoutButton } from "./logout-button"
import { Profile } from "@/types/database"

interface NavbarProps {
  profile: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Target className="h-5 w-5" />
            Dart Magic
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/tournaments"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Turniere
            </Link>
            <Link
              href="/players"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Spieler
            </Link>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {profile?.nickname ?? "Konto"}
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
