import type { User } from "@prisma/client"

export type ExtendedUser = User & {
  role: string
}

export type Session = {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export type Student = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  enrollmentDate: Date
  grade: string
  section: string
  parentId: string
  classId: string
  createdAt: Date
  updatedAt: Date
}

export type Class = {
  id: string
  name: string
  grade: string
  section: string
  teacherId: string
  createdAt: Date
  updatedAt: Date
}

export type Attendance = {
  id: string
  date: Date
  status: string
  studentId: string
  createdAt: Date
  updatedAt: Date
}

export type Grade = {
  id: string
  subject: string
  term: string
  score: number
  grade: string
  remarks?: string
  studentId: string
  createdAt: Date
  updatedAt: Date
}

export type Message = {
  id: string
  sender: string
  recipient: string
  content: string
  timestamp: string
}

