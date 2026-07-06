"use client"

import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

export function WinLossDonut({ wins, losses }: { wins: number; losses: number }) {
  const totalMatches = wins + losses
  const winLossData = [
    { name: "won", value: wins, fill: "var(--color-won)" },
    { name: "lost", value: losses, fill: "var(--color-lost)" },
  ]

  return (
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
  )
}
