"use client"

import * as React from "react"
import { Bell, Menu, Search } from "lucide-react"
import { ThemeToggle } from "@/pages/theme-toggle"
import { Avatar } from "@/components/ui/avatar"
import { currentStudent, dashboardStats } from "@/lib/mock-data"

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <Menu className="size-[18px]" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search courses, lessons, assignments..."
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
        >
          <Bell className="size-[18px]" />
          {dashboardStats.unreadNotifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-background">
              {dashboardStats.unreadNotifications}
            </span>
          )}
        </button>

        <div className="ml-1 flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3">
          <Avatar name={currentStudent.full_name ?? "User"} src={currentStudent.avatar_url} size={30} />
          <div className="hidden text-left leading-tight md:block">
            <p className="text-xs font-semibold text-foreground">{currentStudent.first_name}</p>
            <p className="text-[11px] capitalize text-muted-foreground">{currentStudent.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
