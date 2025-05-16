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

    // Check if announcement table exists in the schema
    // If not, return mock data for now
    let announcements = []

    try {
      // Try to fetch from database if the model exists
      announcements = await db.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      })
    } catch (dbError) {
      // If model doesn't exist, use mock data
      console.log("Using mock announcement data due to schema issue:", dbError)

      // Mock data for development
      announcements = [
        {
          id: "1",
          title: "End of Term Exams",
          content: "End of term examinations will begin next week. Please ensure all assignments are submitted.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "2",
          title: "Parent-Teacher Meeting",
          content:
            "The annual parent-teacher meeting is scheduled for next Friday. All parents are encouraged to attend.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "3",
          title: "School Holiday",
          content: "The school will be closed on Monday for the national holiday.",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "4",
          title: "Sports Day",
          content: "Annual sports day will be held on the last Saturday of this month.",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: "5",
          title: "New Library Books",
          content:
            "The school library has received a new collection of books. Students are encouraged to check them out.",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ]
    }

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
