"use server"

import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Define validation schema
const parentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  relationship: z.string().optional(),
})

export async function registerParent(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You are not authorized to perform this action"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    contactNumber: formData.get("contactNumber") as string,
    address: formData.get("address") as string,
    relationship: formData.get("relationship") as string,
  }

  // Validate data
  const validationResult = parentSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: rawData.email,
      },
    })

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ["User with this email already exists"],
        },
      }
    }

    // Hash password
    const hashedPassword = await hash(rawData.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name: rawData.name,
        email: rawData.email,
        password: hashedPassword,
        role: "PARENT",
      },
    })

    // Create parent profile
    await db.parent.create({
      data: {
        userId: user.id,
        contactNumber: rawData.contactNumber,
        address: rawData.address,
        relationship: rawData.relationship,
      },
    })

    revalidatePath("/dashboard/admin/parents")

    return {
      success: true,
      message: "Parent registered successfully",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getParents() {
  try {
    const parents = await db.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return parents
  } catch (error) {
    console.error("Error fetching parents:", error)
    return []
  }
}

