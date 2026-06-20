import { BookOpen, TrendingUp, CheckCircle2, Clock, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { dashboardStats, profileStats } from "@/lib/mock-data"

interface Stat {
  label: string
  value: string
  delta?: string
  trend?: "up" | "down"
  icon: LucideIcon
  tint: string
  iconColor: string
}

const stats: Stat[] = [
  {
    label: "Active Courses",
    value: String(dashboardStats.coursesCount),
    delta: "+1 this month",
    trend: "up",
    icon: BookOpen,
    tint: "bg-primary/12",
    iconColor: "text-primary",
  },
  {
    label: "Average Score",
    value: dashboardStats.avgScore != null ? `${dashboardStats.avgScore}` : "—",
    delta: "+6 vs last",
    trend: "up",
    icon: TrendingUp,
    tint: "bg-[oklch(0.93_0.05_235)] dark:bg-[oklch(0.32_0.05_235)]",
    iconColor: "text-[oklch(0.55_0.13_235)] dark:text-[oklch(0.75_0.11_235)]",
  },
  {
    label: "Lessons Completed",
    value: `${profileStats.completedLessons}/${profileStats.totalLessons}`,
    delta: "On track",
    trend: "up",
    icon: CheckCircle2,
    tint: "bg-success/15",
    iconColor: "text-success",
  },
  {
    label: "Pending Tasks",
    value: String(dashboardStats.pendingCount),
    delta: "Due soon",
    icon: Clock,
    tint: "bg-warning/20",
    iconColor: "text-warning-foreground",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group p-4 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5"
        >
          <div className="flex items-start justify-between">
            <div className={cn("flex size-10 items-center justify-center rounded-xl", stat.tint)}>
              <stat.icon className={cn("size-5", stat.iconColor)} />
            </div>
            {stat.delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  stat.trend === "up"
                    ? "bg-success/12 text-success"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {stat.trend === "up" && <TrendingUp className="size-3" />}
                {stat.delta}
              </span>
            )}
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{stat.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </Card>
      ))}
    </div>
  )
}
