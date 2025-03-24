"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define validation schema
const classSchema = z.object({
  name: z.string().min(1, { message: "Class name is required" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  section: z.string().min(1, { message: "Section is required" }),
  teacherId: z.string().min(1, { message: "Teacher ID is required" }),
})

export async function addClass(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to add a class"],
      },
    }
  }

  // Only admins can add classes
  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You do not have permission to add classes"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get("name") as string,
    grade: formData.get("grade") as string,
    section: formData.get("section") as string,
    teacherId: formData.get("teacherId") as string,
  }

  // Validate data
  const validationResult = classSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if class already exists
    const existingClass = await db.class.findFirst({
      where: {
        name: rawData.name,
      },
    })

    if (existingClass) {
      return {
        success: false,
        errors: {
          name: ["A class with this name already exists"],
        },
      }
    }

    // Create class
    await db.class.create({
      data: {
        name: rawData.name,
        grade: rawData.grade,
        section: rawData.section,
        teacherId: rawData.teacherId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/admin/classes")
    revalidatePath("/dashboard/teacher/classes")

    return {
      success: true,
      message: "Class added successfully",
    }
  } catch (error) {
    console.error("Error adding class:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getClasses(grade?: string, teacherId?: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view classes"],
      },
    }
  }

  try {
    // Build filter
    const filter: any = {}

    if (grade && grade !== "all") {
      filter.grade = grade
    }

    if (teacherId && teacherId !== "all") {
      filter.teacherId = teacherId
    }

    // If teacher, only show their classes
    if (session.user.role === "TEACHER" && !teacherId) {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!teacher) {
        return {
          success: false,
          errors: {
            _form: ["Teacher profile not found"],
          },
        }
      }

      filter.teacherId = teacher.id
    }

    // Get classes
    const classes = await db.class.findMany({
      where: filter,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return {
      success: true,
      data: classes,
    }
  } catch (error) {
    console.error("Error fetching classes:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getClassById(id: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view class details"],
      },
    }
  }

  try {
    const classData = await db.class.findUnique({
      where: {
        id,
      },
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
        students: {
          include: {
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
        },
      },
    })

    if (!classData) {
      return {
        success: false,
        errors: {
          _form: ["Class not found"],
        },
      }
    }

    return {
      success: true,
      data: classData,
    }
  } catch (error) {
    console.error("Error fetching class:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function updateClass(id: string, formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to update a class"],
      },
    }
  }

  // Only admins can update classes
  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You do not have permission to update classes"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get("name") as string,
    grade: formData.get("grade") as string,
    section: formData.get("section") as string,
    teacherId: formData.get("teacherId") as string,
  }

  // Validate data
  const validationResult = classSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if class with the same name exists (excluding current class)
    const existingClass = await db.class.findFirst({
      where: {
        name: rawData.name,
        NOT: {
          id,
        },
      },
    })

    if (existingClass) {
      return {
        success: false,
        errors: {
          name: ["A class with this name already exists"],
        },
      }
    }

    // Update class
    await db.class.update({
      where: {
        id,
      },
      data: {
        name: rawData.name,
        grade: rawData.grade,
        section: rawData.section,
        teacherId: rawData.teacherId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/admin/classes")
    revalidatePath(`/dashboard/admin/classes/${id}`)
    revalidatePath("/dashboard/teacher/classes")

    return {
      success: true,
      message: "Class updated successfully",
    }
  } catch (error) {
    console.error("Error updating class:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function deleteClass(id: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to delete a class",
    }
  }

  // Only admins can delete classes
  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      error: "You do not have permission to delete classes",
    }
  }

  try {
    // Check if class exists
    const classData = await db.class.findUnique({
      where: {
        id,
      },
      include: {
        students: true,
      },
    })

    if (!classData) {
      return {
        success: false,
        error: "Class not found",
      }
    }

    // Check if class has students
    if (classData.students.length > 0) {
      return {
        success: false,
        error: "Cannot delete class with students. Please reassign or remove students first.",
      }
    }

    // Delete class
    await db.class.delete({
      where: {
        id,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/admin/classes")
    revalidatePath("/dashboard/teacher/classes")

    return {
      success: true,
      message: "Class deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting class:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

