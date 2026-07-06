"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { WinLossDonut } from "@/components/players/win-loss-donut"

type WinRatePoint = { match: number; quote: number }
type LegsPoint = { name: string; legsWon: number; legsLost: number }

const winRateConfig = {
  quote: {
    label: "Siegquote",
    color: "var(--color-blue-600, #2563eb)",
  },
} satisfies ChartConfig

const legsConfig = {
  legsWon: {
    label: "Legs gewonnen",
    color: "var(--color-green-600, #16a34a)",
  },
  legsLost: {
    label: "Legs verloren",
    color: "var(--color-red-600, #dc2626)",
  },
} satisfies ChartConfig

export function PlayerCharts({
  wins,
  losses,
  winRateSeries,
  legsSeries,
}: {
  wins: number
  losses: number
  winRateSeries: WinRatePoint[]
  legsSeries: LegsPoint[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <WinLossDonut wins={wins} losses={losses} />

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Siegquote im Verlauf</h2>
        {winRateSeries.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Noch nicht genug Partien für einen Verlauf.
          </p>
        ) : (
          <ChartContainer config={winRateConfig} className="aspect-auto h-56 w-full">
            <LineChart data={winRateSeries} margin={{ left: -20, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="match"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{ value: "Partie", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Partie ${label}`}
                    formatter={(value) => [`${value}%`, " Siegquote"]}
                  />
                }
              />
              <Line
                dataKey="quote"
                type="monotone"
                stroke="var(--color-quote)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Legs pro Turnier</h2>
        {legsSeries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Turniere mit Legs-Ergebnissen.
          </p>
        ) : (
          <ChartContainer config={legsConfig} className="aspect-auto h-56 w-full">
            <BarChart data={legsSeries} margin={{ left: -20, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="legsWon" fill="var(--color-legsWon)" radius={4} />
              <Bar dataKey="legsLost" fill="var(--color-legsLost)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
