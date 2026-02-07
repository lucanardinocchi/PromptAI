"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  LifeBuoy,
  FileText,
  Receipt,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  role: "exec" | "ic"
  userName: string
  companyName: string
}

const execLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/reports", label: "Reports", icon: FileText },
]

const icLinks = [
  { href: "/me", label: "My Page", icon: User },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/reports", label: "Reports", icon: FileText },
]

export function Sidebar({ role, userName, companyName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const links = role === "exec" ? execLinks : icLinks

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-5 py-5">
        <h2 className="text-lg font-semibold tracking-tight">PromptAI</h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {companyName}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === "/dashboard" && pathname.startsWith("/people")) ||
            (link.href === "/me" && pathname.startsWith("/people"))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="mb-1 truncate text-sm font-medium">{userName}</p>
        <p className="mb-3 text-xs capitalize text-muted-foreground">{role}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
