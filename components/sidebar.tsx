"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Upload, Share2, Globe, Settings, Users, Activity } from "lucide-react"
import { useSession } from "next-auth/react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
    adminOnly?: boolean
  }[]
}

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const items = [
    {
      href: "/dashboard",
      title: "My Files",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/upload",
      title: "Upload",
      icon: <Upload className="mr-2 h-4 w-4" />,
    },
    {
      href: "/shared",
      title: "Shared with me",
      icon: <Share2 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/public",
      title: "Public Files",
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      href: "/admin/users",
      title: "Manage Users",
      icon: <Users className="mr-2 h-4 w-4" />,
      adminOnly: true,
    },
    {
      href: "/admin/logs",
      title: "Activity Logs",
      icon: <Activity className="mr-2 h-4 w-4" />,
      adminOnly: true,
    },
    {
      href: "/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className="hidden border-r bg-background md:block">
      <ScrollArea className="h-full w-56 py-4">
        <SidebarNav items={items.filter((item) => !item.adminOnly || isAdmin)} />
      </ScrollArea>
    </div>
  )
}

function SidebarNav({ items, className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-2 px-2", className)}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn("justify-start", pathname === item.href && "bg-muted")}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
