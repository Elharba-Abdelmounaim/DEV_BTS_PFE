"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  MessageSquare,
  Settings,
  LifeBuoy,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { currentStudent, overallProgressPercent } from "@/lib/mock-data"

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Courses", icon: BookOpen, badge: "4" },
  { label: "Assignments", icon: ClipboardList, badge: "2" },
  { label: "Grades", icon: GraduationCap },
  { label: "Schedule", icon: CalendarDays },
  { label: "Messages", icon: MessageSquare },
]

const secondary = [
  { label: "Settings", icon: Settings },
  { label: "Help Center", icon: LifeBuoy },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">UpStudy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <ul className="flex flex-col gap-1">
          {nav.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      item.active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/12 text-primary",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          General
        </p>
        <ul className="flex flex-col gap-1">
          {secondary.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Progress card */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.1_198)] p-4 text-primary-foreground">
          <p className="text-sm font-semibold">Overall progress</p>
          <p className="mt-0.5 text-xs text-primary-foreground/80">
            Keep going, you&apos;re doing great!
          </p>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-bold">{overallProgressPercent}%</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-primary-foreground/25">
              <div
                className="h-full rounded-full bg-primary-foreground"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3">
        <Avatar name={currentStudent.full_name ?? "User"} src={currentStudent.avatar_url} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{currentStudent.full_name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <GitBranch className="size-3" />@{currentStudent.github_username}
          </p>
        </div>
      </div>
    </div>
  )
}
