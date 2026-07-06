"use client"

import { Label, Pie, PieChart } from "recharts"
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

type WinRatePoint = { match: number; quote: number }
type LegsPoint = { name: string; legsWon: number; legsLost: number }

const winLossConfig = {
  won: {
    label: "Siege",
    color: "var(--color-green-600, #16a34a)",
  },
  lost: {
    label: "Niederlagen",
    color: "var(--color-red-600, #dc2626)",
  },
} satisfies ChartConfig

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
  const totalMatches = wins + losses
  const winLossData = [
    { name: "won", value: wins, fill: "var(--color-won)" },
    { name: "lost", value: losses, fill: "var(--color-lost)" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Siege / Niederlagen</h2>
        {totalMatches === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Partien gespielt.</p>
        ) : (
          <ChartContainer config={winLossConfig} className="mx-auto aspect-square h-56">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                      const key = name as keyof typeof winLossConfig
                      const label = winLossConfig[key]?.label ?? name
                      const pct = totalMatches > 0 ? Math.round((Number(value) / totalMatches) * 100) : 0
                      return [`${value} (${pct}%)`, ` ${label}`]
                    }}
                  />
                }
              />
              <Pie data={winLossData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} strokeWidth={5}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalMatches}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-sm">
                            Partien
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </div>

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
