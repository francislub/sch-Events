import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: [
        { status: "asc" }, // UNREAD first
        { createdAt: "desc" }, // Then by date (newest first)
      ],
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 })
  }
}

