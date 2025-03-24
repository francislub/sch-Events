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

    // If student, get their profile
    if (session.user.role === "STUDENT") {
      const student = await db.student.findFirst({
        where: {
          userId: session.user.id,
        },
        include: {
          class: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          parent: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      return NextResponse.json(student)
    }

    // If not a student, return error
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

