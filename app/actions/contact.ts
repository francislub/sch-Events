"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Add ContactMessage model to prisma schema
// This will be done in the next step

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Validate input
    const validatedData = contactFormSchema.parse({
      name,
      email,
      subject,
      message,
    })

    // Create contact message
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "UNREAD",
      },
    })

    revalidatePath("/contact")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Contact form submission error:", error)
    return { success: false, error: "Failed to submit contact form" }
  }
}

export async function markContactMessageAsRead(messageId: string) {
  try {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: "READ" },
    })

    revalidatePath("/admin/contact-messages")
    return { success: true }
  } catch (error) {
    console.error("Error marking message as read:", error)
    return { success: false, error: "Failed to update message status" }
  }
}

export async function deleteContactMessage(messageId: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id: messageId },
    })

    revalidatePath("/admin/contact-messages")
    return { success: true }
  } catch (error) {
    console.error("Error deleting message:", error)
    return { success: false, error: "Failed to delete message" }
  }
}

