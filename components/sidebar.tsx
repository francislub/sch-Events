"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  UserCircle,
  FileText,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  role?: string
  userName?: string
}

export default function Sidebar({ role = "admin", userName = "User" }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const normalizedRole = (role || "admin").toLowerCase()

  // Check if the window is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: `/dashboard/${normalizedRole}`,
        icon: LayoutDashboard,
      },
      {
        title: "Messages",
        href: `/dashboard/${normalizedRole}/messages`,
        icon: MessageSquare,
      },
      {
        title: "Profile",
        href: `/dashboard/${normalizedRole}/profile`,
        icon: UserCircle,
      },
    ]

    const adminItems = [
      {
        title: "Students",
        href: "/dashboard/admin/students",
        icon: GraduationCap,
      },
      {
        title: "Teachers",
        href: "/dashboard/admin/teachers",
        icon: Users,
      },
      {
        title: "Classes",
        href: "/dashboard/admin/classes",
        icon: BookOpen,
      },
      {
        title: "Attendance",
        href: "/dashboard/admin/attendance",
        icon: Clock,
      },
      {
        title: "Events",
        href: "/dashboard/admin/events",
        icon: Calendar,
      },
      {
        title: "Settings",
        href: "/dashboard/admin/settings",
        icon: Settings,
      },
    ]

    const teacherItems = [
      {
        title: "Classes",
        href: "/dashboard/teacher/classes",
        icon: BookOpen,
      },
      {
        title: "Students",
        href: "/dashboard/teacher/students",
        icon: GraduationCap,
      },
      {
        title: "Attendance",
        href: "/dashboard/teacher/attendance",
        icon: Clock,
      },
      {
        title: "Grades",
        href: "/dashboard/teacher/grades",
        icon: FileText,
      },
    ]

    const parentItems = [
      {
        title: "Children",
        href: "/dashboard/parent/children",
        icon: Users,
      },
      {
        title: "Attendance",
        href: "/dashboard/parent/attendance",
        icon: Clock,
      },
      {
        title: "Grades",
        href: "/dashboard/parent/grades",
        icon: FileText,
      },
      {
        title: "Events",
        href: "/dashboard/parent/events",
        icon: Calendar,
      },
    ]

    const studentItems = [
      {
        title: "Classes",
        href: "/dashboard/student/classes",
        icon: BookOpen,
      },
      {
        title: "Grades",
        href: "/dashboard/student/grades",
        icon: FileText,
      },
      {
        title: "Attendance",
        href: "/dashboard/student/attendance",
        icon: Clock,
      },
      {
        title: "Schedule",
        href: "/dashboard/student/schedule",
        icon: Calendar,
      },
    ]

    switch (normalizedRole) {
      case "admin":
        return [...baseItems, ...adminItems]
      case "teacher":
        return [...baseItems, ...teacherItems]
      case "parent":
        return [...baseItems, ...parentItems]
      case "student":
        return [...baseItems, ...studentItems]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  return (
    <div
      data-sidebar="true"
      className={cn(
        "fixed top-0 left-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 ease-in-out",
        isMobile ? "-translate-x-full" : "translate-x-0",
        "w-64",
      )}
    >
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">School Management</h2>
          <p className="text-sm text-slate-400 mt-1">Welcome, {userName}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

