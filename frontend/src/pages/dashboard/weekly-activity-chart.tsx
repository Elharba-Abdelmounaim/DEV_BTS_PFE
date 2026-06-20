"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { weeklyActivity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function WeeklyActivityChart() {
  const max = Math.max(...weeklyActivity.map((d) => d.hours))
  const total = weeklyActivity.reduce((a, d) => a + d.hours, 0)
  const today = new Date().toLocaleString("en-US", { weekday: "short" })

  return (
    <Card>
      <CardHeader className="flex-row items-end justify-between">
        <div>
          <CardTitle>Study activity</CardTitle>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold leading-none">{total.toFixed(1)}h</p>
          <p className="text-[11px] text-muted-foreground">total</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-36 items-end justify-between gap-2">
          {weeklyActivity.map((d) => {
            const isToday = d.day === today
            return (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-lg transition-all duration-500 ease-out",
                      isToday ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/45",
                    )}
                    style={{ height: `${(d.hours / max) * 100}%` }}
                  >
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {d.hours}h
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
