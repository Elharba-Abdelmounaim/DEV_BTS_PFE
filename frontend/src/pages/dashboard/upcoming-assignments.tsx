import { CalendarClock, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { assignments, submissions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function dueLabel(due: string) {
  const diff = new Date(due).getTime() - Date.now()
  const dayMs = 86_400_000
  if (diff < 0) {
    const d = Math.ceil(-diff / dayMs)
    return { text: d <= 1 ? "Overdue" : `${d}d overdue`, tone: "danger" as const }
  }
  const d = Math.ceil(diff / dayMs)
  if (d <= 2) return { text: `Due in ${d}d`, tone: "warning" as const }
  return { text: `Due in ${d}d`, tone: "muted" as const }
}

function statusFor(assignmentId: string) {
  const sub = submissions.find((s) => s.assignment_id === assignmentId)
  if (!sub) return { label: "Not started", variant: "muted" as const }
  switch (sub.submission_status) {
    case "graded":
      return { label: `Scored ${sub.final_score}`, variant: "success" as const }
    case "grading":
    case "queued":
      return { label: "Grading", variant: "default" as const }
    case "failed":
      return { label: "Failed", variant: "danger" as const }
    default:
      return { label: "Pending", variant: "warning" as const }
  }
}

export function UpcomingAssignments() {
  const sorted = [...assignments].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  )

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-[18px] text-primary" />
          Deadlines
        </CardTitle>
        <button className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
          All
          <ArrowUpRight className="size-3.5" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-1">
        {sorted.map((a) => {
          const due = dueLabel(a.due_date)
          const status = statusFor(a.id)
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:border-border hover:bg-secondary/50"
            >
              <div
                className={cn(
                  "flex size-11 flex-col items-center justify-center rounded-xl text-center",
                  due.tone === "danger"
                    ? "bg-destructive/12 text-destructive"
                    : due.tone === "warning"
                      ? "bg-warning/20 text-warning-foreground"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                <span className="text-sm font-bold leading-none">
                  {new Date(a.due_date).getDate()}
                </span>
                <span className="text-[10px] uppercase">
                  {new Date(a.due_date).toLocaleString("en-US", { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">{a.course?.code}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    due.tone === "danger"
                      ? "text-destructive"
                      : due.tone === "warning"
                        ? "text-warning-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {due.text}
                </span>
                <Badge variant={status.variant} className="px-2 py-0 text-[10px]">
                  {status.label}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
