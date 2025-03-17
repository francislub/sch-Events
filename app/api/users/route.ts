import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET users
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const exclude = searchParams.get("exclude")
    const role = searchParams.get("role")

    // Build filter
    const filter: any = {}

    if (exclude) {
      filter.id = {
        not: exclude,
      }
    }

    if (role) {
      filter.role = role
    }

    // Get users
    const users = await db.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

