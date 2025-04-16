import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can add students
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const {
      firstName,
      lastName,
      admissionNumber,
      dateOfBirth,
      gender,
      enrollmentDate,
      grade,
      section,
      address,
      parentId,
      classId,
      createAccount,
      email,
      password,
    } = await req.json()

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !admissionNumber ||
      !dateOfBirth ||
      !gender ||
      !enrollmentDate ||
      !grade ||
      !section ||
      !parentId ||
      !classId
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if student with admission number already exists
    const existingStudent = await db.student.findUnique({
      where: {
        admissionNumber,
      },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Student with this admission number already exists" }, { status: 409 })
    }

    // Create student with or without user account
    let student

    if (createAccount && email && password) {
      // Check if user with email already exists
      const existingUser = await db.user.findUnique({
        where: {
          email,
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }

      // Hash password
      const hashedPassword = await hash(password, 10)

      // Create user
      const user = await db.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      })

      // Create student with user account
      student = await db.student.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          admissionNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          enrollmentDate: new Date(enrollmentDate),
          grade,
          section,
          address,
          parentId,
          classId,
        },
      })
    } else {
      // Create student without user account
      student = await db.student.create({
        data: {
          firstName,
          lastName,
          admissionNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          enrollmentDate: new Date(enrollmentDate),
          grade,
          section,
          address,
          parentId,
          classId,
        },
      })
    }

    return NextResponse.json({ message: "Student added successfully", student }, { status: 201 })
  } catch (error) {
    console.error("Error adding student:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const grade = searchParams.get("grade")
    const section = searchParams.get("section")
    const classId = searchParams.get("classId")
    const parentId = searchParams.get("parentId")

    console.log("Student API request params:", { grade, section, classId, parentId })

    // Build filter
    const filter: any = {}

    if (grade) {
      filter.grade = grade
    }

    if (section) {
      filter.section = section
    }

    if (classId) {
      filter.classId = classId
    }

    if (parentId) {
      filter.parentId = parentId
    }

    // If parent, only show their children
    if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      filter.parentId = parent.id
    }

    console.log("Student API filter:", filter)

    // Get students
    const students = await db.student.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            email: true,
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
        class: true,
      },
    })

    console.log(`Students fetched: ${students.length}`)

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
