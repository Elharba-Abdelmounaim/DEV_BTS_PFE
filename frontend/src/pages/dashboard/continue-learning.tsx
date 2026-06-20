import { ArrowUpRight, PlayCircle, FileText, HelpCircle, ClipboardList } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { enrolledCourses } from "@/lib/mock-data"
import type { LessonType } from "@/lib/types"

const lessonIcon: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  reading: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
}

export function ContinueLearning() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Continue learning</h2>
          <p className="text-sm text-muted-foreground">Your enrolled courses in progress</p>
        </div>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:opacity-80">
          View all
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {enrolledCourses.map(({ course, progress, next_lesson }) => {
          const NextIcon = next_lesson ? lessonIcon[next_lesson.type] : PlayCircle
          return (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={course.cover_url || "/placeholder.svg"}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <Badge variant="default" className="bg-card/90 backdrop-blur">
                    {course.category}
                  </Badge>
                  <span className="rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
                    {course.code}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-1 font-semibold leading-tight">{course.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Avatar name={course.instructor?.full_name ?? "Instructor"} size={22} />
                  <span className="text-xs text-muted-foreground">
                    {course.instructor?.full_name}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {progress.completed_lessons}/{progress.total_lessons} lessons
                    </span>
                    <span className="font-semibold text-primary">{progress.percent}%</span>
                  </div>
                  <Progress value={progress.percent} />
                </div>

                {next_lesson && (
                  <button className="mt-4 flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <NextIcon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                        Up next
                      </span>
                      <span className="block truncate font-medium">{next_lesson.title}</span>
                    </span>
                    <PlayCircle className="size-5 shrink-0 text-primary" />
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
