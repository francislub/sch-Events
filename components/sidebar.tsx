"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)
  const [userRole, setUserRole] = useState<string>("parent")

  useEffect(() => {
    // Extract role from URL path
    const path = pathname.split("/")
    if (path.length > 2 && path[1] === "dashboard") {
      setUserRole(path[2])
    }
  }, [pathname])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {isMobile && (
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50" onClick={toggleSidebar}>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      )}

      <div
        className={cn(
          "bg-white border-r shadow-sm transition-all duration-300 z-40",
          isOpen ? "w-64" : isMobile ? "w-0" : "w-16",
          isMobile && !isOpen && "hidden",
        )}
      >
        <div className="p-4 border-b">
          <h2
            className={cn(
              "font-bold text-blue-800 transition-all overflow-hidden whitespace-nowrap",
              isOpen ? "text-xl" : "text-xs text-center",
            )}
          >
            {isOpen ? "Wobulenzi High" : "WHS"}
          </h2>
        </div>

        <div className="py-4">
          <nav className="space-y-1 px-2">
            {getNavItems(userRole).map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100",
                  !isOpen && "justify-center",
                )}
              >
                <item.icon className={cn("h-5 w-5", !isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <Link
            href="/"
            className={cn(
              "flex items-center px-2 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
              !isOpen && "justify-center",
            )}
          >
            <LogOut className={cn("h-5 w-5", !isOpen && "mx-auto")} />
            {isOpen && <span className="ml-3">Logout</span>}
          </Link>
        </div>
      </div>
    </>
  )
}

function getNavItems(role: string) {
  const commonItems = [
    { name: "Dashboard", href: `/dashboard/${role}`, icon: Home },
    { name: "Profile", href: `/dashboard/${role}/profile`, icon: User },
    { name: "Messages", href: `/dashboard/${role}/messages`, icon: MessageSquare },
    { name: "Settings", href: `/dashboard/${role}/settings`, icon: Settings },
  ]

  const roleSpecificItems = {
    parent: [
      { name: "My Children", href: `/dashboard/parent/children`, icon: Users },
      { name: "Attendance", href: `/dashboard/parent/attendance`, icon: ClipboardList },
      { name: "Academic Records", href: `/dashboard/parent/academics`, icon: BookOpen },
      { name: "Events", href: `/dashboard/parent/events`, icon: Calendar },
    ],
    teacher: [
      { name: "My Classes", href: `/dashboard/teacher/classes`, icon: Users },
      { name: "Attendance", href: `/dashboard/teacher/attendance`, icon: ClipboardList },
      { name: "Grades", href: `/dashboard/teacher/grades`, icon: BookOpen },
      { name: "Schedule", href: `/dashboard/teacher/schedule`, icon: Calendar },
    ],
    admin: [
      { name: "Students", href: `/dashboard/admin/students`, icon: Users },
      { name: "Teachers", href: `/dashboard/admin/teachers`, icon: Users },
      { name: "Classes", href: `/dashboard/admin/classes`, icon: BookOpen },
      { name: "Attendance", href: `/dashboard/admin/attendance`, icon: ClipboardList },
      { name: "Events", href: `/dashboard/admin/events`, icon: Calendar },
    ],
  }

  return [...commonItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])]
}

