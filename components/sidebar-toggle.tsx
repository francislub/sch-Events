"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"

export function SidebarToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    const sidebar = document.querySelector('[data-sidebar="true"]')
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full")
      sidebar.classList.toggle("translate-x-0")
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="true"]')
      const toggle = document.querySelector('[data-sidebar-toggle="true"]')

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggle &&
        !toggle.contains(event.target as Node) &&
        window.innerWidth < 768 &&
        isSidebarOpen
      ) {
        sidebar.classList.remove("translate-x-0")
        sidebar.classList.add("-translate-x-full")
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidebarOpen])

  return (
    <Button
      variant="outline"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-50"
      onClick={toggleSidebar}
      data-sidebar-toggle="true"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

