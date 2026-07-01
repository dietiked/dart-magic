"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { generateSignupToken, deactivateSignupToken } from "@/app/actions/signup"
import { Copy, Check } from "lucide-react"

interface SignupLinkProps {
  activeToken: string | null
}

export function SignupLink({ activeToken }: SignupLinkProps) {
  const [token, setToken] = useState<string | null>(activeToken)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const link = token ? `${origin}/signup/${token}` : null

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const newToken = await generateSignupToken()
        setToken(newToken)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Fehler")
      }
    })
  }

  const handleDeactivate = () => {
    if (!confirm("Anmeldelink wirklich deaktivieren?")) return
    startTransition(async () => {
      try {
        await deactivateSignupToken()
        setToken(null)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Fehler")
      }
    })
  }

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {link ? (
        <>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-100 border rounded-md px-3 py-2 truncate">
              {link}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isPending}>
              Neuen Link generieren
            </Button>
            <Button size="sm" variant="outline" onClick={handleDeactivate} disabled={isPending}
              className="text-red-600 hover:text-red-700">
              Link deaktivieren
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Kein aktiver Anmeldelink.</p>
          <Button size="sm" onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Wird erstellt…" : "Link generieren"}
          </Button>
        </div>
      )}
    </div>
  )
}
