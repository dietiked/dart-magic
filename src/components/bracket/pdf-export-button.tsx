"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PdfExportButtonProps {
  tournamentName: string
}

export function PdfExportButton({ tournamentName }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])

      const bracket = document.getElementById("bracket-container")
      if (!bracket) return

      // Tailwind v4 usa oklch()/lab() nella sua palette colori di default, e
      // Chrome non le normalizza più in rgb(): getComputedStyle() le
      // restituisce così come sono. html2canvas legge lo stile con
      // `window.getComputedStyle(element, null)` (vedi
      // node_modules/html2canvas/dist/html2canvas.js, ElementContainer) e il
      // suo parser CSS interno non sa interpretare lab()/oklch() → crash.
      // (Un tentativo di rimuovere a monte, nel foglio di stile clonato, i
      // blocchi @supports che introducono lab()/oklch() non funziona: il
      // <link> del clone carica il CSS in modo asincrono in un iframe
      // separato, e non c'è alcuna attesa esplicita per quel caricamento
      // prima che parta onclone — la rimozione arriva sempre troppo presto.)
      // Fix: durante l'export sostituiamo temporaneamente
      // window.getComputedStyle con una versione che rimpiazza al volo,
      // in ogni valore stringa restituito, le funzioni colore non
      // supportate con l'rgb() equivalente (calcolato disegnando il colore
      // su un canvas 1x1 e rileggendone i pixel) — così qualunque proprietà
      // legga html2canvas (colore, sfondo, bordi, ombre, ecc.) risulta
      // sempre in un formato che sa interpretare, senza perdita visiva.

      const sanitizeCanvas = document.createElement("canvas")
      sanitizeCanvas.width = sanitizeCanvas.height = 1
      const sanitizeCtx = sanitizeCanvas.getContext("2d")!

      const toRgb = (colorFn: string) => {
        sanitizeCtx.clearRect(0, 0, 1, 1)
        sanitizeCtx.fillStyle = "#000"
        sanitizeCtx.fillStyle = colorFn
        sanitizeCtx.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = sanitizeCtx.getImageData(0, 0, 1, 1).data
        return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
      }

      const UNSUPPORTED_COLOR_FN = /\b(?:lab|lch|oklab|oklch|color)\([^)]*\)/gi
      const sanitizeValue = (value: string) =>
        value.includes("(") ? value.replace(UNSUPPORTED_COLOR_FN, match => toRgb(match)) : value

      const originalGetComputedStyle = window.getComputedStyle.bind(window)
      const patchedGetComputedStyle = ((elt: Element, pseudo?: string | null) => {
        const cs = originalGetComputedStyle(elt, pseudo)
        return new Proxy(cs, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return (name: string) => sanitizeValue(target.getPropertyValue(name))
            }
            // Niente `receiver` qui: i getter nativi di CSSStyleDeclaration
            // vanno invocati con `this` = l'oggetto reale, non il Proxy,
            // altrimenti Chrome lancia "Illegal invocation".
            const value = Reflect.get(target, prop, target)
            if (typeof value === "string") return sanitizeValue(value)
            if (typeof value === "function") return value.bind(target)
            return value
          },
        })
      }) as typeof window.getComputedStyle

      let canvas: HTMLCanvasElement
      try {
        window.getComputedStyle = patchedGetComputedStyle
        canvas = await html2canvas(bracket, {
          backgroundColor: "#f9fafb",
          scale: 2,
          useCORS: true,
          logging: false,
        })
      } finally {
        window.getComputedStyle = originalGetComputedStyle
      }

      const imgData = canvas.toDataURL("image/png")
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calcola dimensioni PDF (landscape A4 = 297x210mm)
      const pdfWidth = 297
      const pdfHeight = 210
      const margin = 10

      const availableWidth = pdfWidth - margin * 2
      const availableHeight = pdfHeight - margin * 2 - 12

      const scale = Math.min(
        availableWidth / (imgWidth / 3.7795),
        availableHeight / (imgHeight / 3.7795)
      )

      const finalWidth = (imgWidth / 3.7795) * scale
      const finalHeight = (imgHeight / 3.7795) * scale

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(tournamentName, margin, margin + 6)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(120)
      pdf.text("Turnierbaum", margin, margin + 11)
      pdf.setTextColor(0)

      const x = (pdfWidth - finalWidth) / 2
      const y = margin + 14

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)
      pdf.save(`${tournamentName.replace(/\s+/g, "-")}-Turnierbaum.pdf`)
    } catch (e) {
      console.error("PDF export error:", e)
      alert("Fehler beim Exportieren: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Wird exportiert…" : "PDF exportieren"}
    </Button>
  )
}
