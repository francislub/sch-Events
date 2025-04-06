import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    // Get unique subjects from the database
    const gradesWithSubjects = await db.grade.findMany({
      select: {
        subject: true,
      },
      distinct: ["subject"],
    })

    const subjects = gradesWithSubjects.map((grade) => grade.subject)

    // Get unique terms from the database
    const gradesWithTerms = await db.grade.findMany({
      select: {
        term: true,
      },
      distinct: ["term"],
    })

    const terms = gradesWithTerms.map((grade) => grade.term)

    // If no subjects or terms found in the database, provide default values
    const defaultSubjects = [
      "Mathematics",
      "English",
      "Science",
      "History",
      "Geography",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Art",
      "Music",
      "Physical Education",
    ]

    const defaultTerms = ["Term 1", "Term 2", "Term 3", "Final"]

    return NextResponse.json({
      subjects: subjects.length > 0 ? subjects : defaultSubjects,
      terms: terms.length > 0 ? terms : defaultTerms,
    })
  } catch (error) {
    console.error("Error fetching subjects and terms:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

