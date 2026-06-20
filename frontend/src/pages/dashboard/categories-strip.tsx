import {
  Code2,
  Cpu,
  Brain,
  Cloud,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { categories } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const icons: LucideIcon[] = [Code2, Cpu, Brain, Cloud, BarChart3, ShieldCheck]

const tones: Record<string, string> = {
  primary: "bg-primary/12 text-primary",
  blue: "bg-[oklch(0.93_0.05_235)] text-[oklch(0.55_0.13_235)] dark:bg-[oklch(0.32_0.05_235)] dark:text-[oklch(0.75_0.11_235)]",
  amber: "bg-warning/20 text-warning-foreground",
  rose: "bg-destructive/12 text-destructive",
}

export function CategoriesStrip() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Explore categories</h2>
        <button className="text-sm font-medium text-primary hover:opacity-80">See all</button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat, i) => {
          const Icon = icons[i % icons.length]
          return (
            <button
              key={cat.label}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                  tones[cat.tone] ?? tones.primary,
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-semibold leading-tight">{cat.label}</span>
              <span className="text-xs text-muted-foreground">{cat.count} courses</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
