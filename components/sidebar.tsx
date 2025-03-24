"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  MessageSquare,
  UserCircle,
  LogOut,
  School,
  ClipboardList,
  Award,
} from "lucide-react"

interface SidebarProps {
  role?: string
  userName?: string
}

export default function Sidebar({ role = "admin", userName = "User" }: SidebarProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)
  
  // Close sheet on navigation on mobile
  useEffect(() => {
    setOpen(false)
  }, [pathname])
  
  const normalizedRole = role.toLowerCase()
  
  // Define navigation items based on role
  const navItems = [
    {
      title: "Dashboard",
      href: `/dashboard/${normalizedRole}`,
      icon: LayoutDashboard
    },
  ]
  
  // Admin-specific navigation items
  if (normalizedRole === "admin") {
    navItems.push(
      {
        title: "Students",
        href: "/dashboard/admin/students",
        icon: GraduationCap
      },
      {
        title: "Teachers",
        href: "/dashboard/admin/teachers",
        icon: Users
      },
      {
        title: "Parents",
        href: "/dashboard/admin/parents",
        icon: Users
      },
      {
        title: "Classes",
        href: "/dashboard/admin/classes",
        icon: BookOpen
      },
      {
        title: "Attendance",
        href: "/dashboard/admin/attendance",
        icon: ClipboardList
      },
      {
        title: "Events",
        href: "/dashboard/admin/events",
        icon: Calendar
      }
    )
  }
  
  // Teacher-specific navigation items
  if (normalizedRole === "teacher") {
    navItems.push(
      {
        title: "Students",
        href: "/dashboard/teacher/students",
        icon: GraduationCap
      },
      {
        title: "Classes",
        href: "/dashboard/teacher/classes",
        icon: BookOpen
      },
      {
        title: "Grades",
        href: "/dashboard/teacher/grades",
        icon: Award
      },
      {
        title: "Attendance",
        href: "/dashboard/teacher/attendance",
        icon: ClipboardList
      }
    )
  }
  
  // Parent-specific navigation items
  if (normalizedRole === "parent") {
    navItems.push(
      {
        title: "Children",
        href: "/dashboard/parent/children",
        icon: GraduationCap
      },
      {
        title: "Academics",
        href: "/dashboard/parent/academics",
        icon: Award
      },
      {
        title: "Attendance",
        href: "/dashboard/parent/attendance",
        icon: ClipboardList
      }
    )
  }
  
  // Student-specific navigation items
  if (normalizedRole === "student") {
    navItems.push(
      {
        title: "Academics",
        href: "/dashboard/student/academics",
        icon: Award
      },
      {
        title: "Attendance",
        href: "/dashboard/student/attendance",
        icon: ClipboardList
      },
      {
        title: "Schedule",
        href: "/dashboard/student/schedule",
        icon: Calendar
      }
    )
  }
  
  // Common navigation items for all roles
  navItems.push(
    {
      title: "Messages",
      href: `/dashboard/${normalizedRole}/messages`,
      icon: MessageSquare
    },
    {
      title: "Profile",
      href: `/dashboard/${normalizedRole}/profile`,
      icon: UserCircle
    }
  )
  
  // Admin-specific settings
  if (normalizedRole === "admin") {
    navItems.push({
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings
    })
  }
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }
  
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="py-4 border-b">
        <div className="px-6 flex items-center gap-2">
          <School className="h-6 w-6" />
          <h2 className="text-lg font-semibold">School Management</h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
  
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            {/* Menu Icon */}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }
  
  return (
    <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background md:flex flex-col">
      {sidebarContent}
    </div>
  )
}

