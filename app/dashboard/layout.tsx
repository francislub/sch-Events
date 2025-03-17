import type { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Extract role from the session, defaulting to "admin" if not available
  const userRole = session?.user?.role?.toString().toLowerCase() || "admin"
  const userName = session?.user?.name || "User"

  return (
    <>
      <Sidebar role={userRole} userName={userName} />
      <SidebarToggle />
      <div className="ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        <main className="p-6">
          {children}
          <Toaster />
        </main>
      </div>
    </>
  )
}

