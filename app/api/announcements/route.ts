import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : undefined

    // Get announcements
    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    // Format the announcements for the frontend
    const formattedAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      description: announcement.content,
      date: announcement.createdAt.toLocaleDateString(),
    }))

    return NextResponse.json(formattedAnnouncements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

