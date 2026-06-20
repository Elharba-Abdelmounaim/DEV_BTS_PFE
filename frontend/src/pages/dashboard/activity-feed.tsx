import { Award, FileUp, BookPlus, GraduationCap, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recentActivity } from "@/lib/mock-data"
import type { RecentActivity } from "@/lib/types"
import { cn } from "@/lib/utils"

const config: Record<
  RecentActivity["type"],
  { icon: LucideIcon; tint: string; color: string }
> = {
  grade: { icon: Award, tint: "bg-success/15", color: "text-success" },
  submission: { icon: FileUp, tint: "bg-primary/12", color: "text-primary" },
  enrollment: {
    icon: BookPlus,
    tint: "bg-[oklch(0.93_0.05_235)] dark:bg-[oklch(0.32_0.05_235)]",
    color: "text-[oklch(0.55_0.13_235)] dark:text-[oklch(0.75_0.11_235)]",
  },
  course: { icon: GraduationCap, tint: "bg-warning/20", color: "text-warning-foreground" },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.round(diff / 3_600_000)
  if (h < 1) return "just now"
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <ol className="relative">
          {recentActivity.map((item, i) => {
            const c = config[item.type]
            const last = i === recentActivity.length - 1
            return (
              <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!last && (
                  <span
                    aria-hidden
                    className="absolute left-[18px] top-10 h-[calc(100%-1.5rem)] w-px bg-border"
                  />
                )}
                <span
                  className={cn(
                    "z-10 flex size-9 shrink-0 items-center justify-center rounded-full",
                    c.tint,
                  )}
                >
                  <c.icon className={cn("size-[18px]", c.color)} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
                <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                  {timeAgo(item.created_at)}
                </span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
