import type { ReactNode } from "react"
import { NextAuthProvider } from "@/components/providers/session-provider"
import "./globals.css"

export const metadata = {
  title: "School Management System",
  description: "A comprehensive school management system",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}

