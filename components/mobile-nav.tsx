"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, FileText, Upload, Share2, Globe, Settings, Users, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isAdmin = session?.user?.role === "ADMIN"

  const items = [
    {
      href: "/dashboard",
      title: "My Files",
      icon: <FileText className="mr-2 h-5 w-5" />,
    },
    {
      href: "/upload",
      title: "Upload",
      icon: <Upload className="mr-2 h-5 w-5" />,
    },
    {
      href: "/shared",
      title: "Shared with me",
      icon: <Share2 className="mr-2 h-5 w-5" />,
    },
    {
      href: "/public",
      title: "Public Files",
      icon: <Globe className="mr-2 h-5 w-5" />,
    },
    {
      href: "/admin/users",
      title: "Manage Users",
      icon: <Users className="mr-2 h-5 w-5" />,
      adminOnly: true,
    },
    {
      href: "/admin/logs",
      title: "Activity Logs",
      icon: <Activity className="mr-2 h-5 w-5" />,
      adminOnly: true,
    },
    {
      href: "/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-5 w-5" />,
    },
    {
      href: "/profile",
      title: "Profile",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
  ]

  const filteredItems = items.filter((item) => !item.adminOnly || isAdmin)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">File Sharing Platform</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-2">
          {filteredItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("justify-start", pathname === item.href && "bg-muted")}
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={item.href}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
