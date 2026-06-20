import { ArrowRight, Play, Sparkles } from "lucide-react"
import { currentStudent, enrolledCourses, dashboardStats } from "@/lib/mock-data"

export function WelcomeBanner() {
  const resume = enrolledCourses[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
      {/* decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-card to-card"
      />
      <div className="relative flex flex-col items-stretch gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            {dashboardStats.pendingCount} task{dashboardStats.pendingCount === 1 ? "" : "s"} pending
            this week
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-balance md:text-3xl">
            {greeting}, {currentStudent.first_name}
            <span className="relative ml-1 inline-block">
              👋
              <span className="absolute -bottom-1 left-0 hidden h-1 w-full rounded-full bg-warning" />
            </span>
          </h1>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            You&apos;ve completed{" "}
            <span className="font-semibold text-foreground">
              {enrolledCourses.reduce((a, e) => a + e.progress.completed_lessons, 0)} lessons
            </span>{" "}
            across {dashboardStats.coursesCount} active courses. Pick up where you left off.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:translate-y-px">
              <Play className="size-4 fill-current" />
              Resume {resume.course.title.split(" ").slice(0, 2).join(" ")}
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
              Browse courses
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Illustration + floating stat */}
        <div className="relative mx-auto w-full max-w-xs md:mx-0 md:w-72">
          <img
            src="/images/hero-student.png"
            alt="Illustration of a student studying"
            className="w-full select-none"
          />
          <div className="absolute -left-2 bottom-3 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {dashboardStats.avgScore ?? "—"}
                <span className="text-sm font-medium text-muted-foreground">/100</span>
              </p>
              <p className="text-xs text-muted-foreground">Average score</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
