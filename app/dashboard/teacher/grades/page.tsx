"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, FileDown, Search } from "lucide-react"
import Link from "next/link"

export default function TeacherGrades() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    class: "",
    subject: "",
    term: "",
    search: "",
  })

  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for classes, subjects, and terms
  const classes = [
    { id: "1", name: "10A" },
    { id: "2", name: "10B" },
    { id: "3", name: "9A" },
    { id: "4", name: "9B" },
  ]

  const subjects = [
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

  const terms = ["Term 1", "Term 2", "Term 3", "Final"]

  // Mock data for grades
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const mockGrades = [
      {
        id: "1",
        student: { id: "1", firstName: "Sarah", lastName: "Doe", grade: "10", section: "A" },
        subject: "Mathematics",
        term: "Term 1",
        score: 92,
        grade: "A",
        remarks: "Excellent work!",
        createdAt: "2025-03-10T14:30:00",
      },
      {
        id: "2",
        student: { id: "2", firstName: "Michael", lastName: "Smith", grade: "10", section: "A" },
        subject: "Mathematics",
        term: "Term 1",
        score: 85,
        grade: "B",
        remarks: "Good effort, but needs improvement in algebra.",
        createdAt: "2025-03-10T14:35:00",
      },
      {
        id: "3",
        student: { id: "3", firstName: "Emily", lastName: "Johnson", grade: "9", section: "B" },
        subject: "Science",
        term: "Term 1",
        score: 88,
        grade: "B+",
        remarks: "Strong understanding of concepts.",
        createdAt: "2025-03-11T09:15:00",
      },
      {
        id: "4",
        student: { id: "4", firstName: "David", lastName: "Wilson", grade: "10", section: "B" },
        subject: "English",
        term: "Term 1",
        score: 78,
        grade: "C+",
        remarks: "Needs to improve writing skills.",
        createdAt: "2025-03-11T10:30:00",
      },
      {
        id: "5",
        student: { id: "1", firstName: "Sarah", lastName: "Doe", grade: "10", section: "A" },
        subject: "Science",
        term: "Term 1",
        score: 95,
        grade: "A",
        remarks: "Outstanding performance in all areas.",
        createdAt: "2025-03-12T14:30:00",
      },
    ]

    setGrades(mockGrades)
    setIsLoading(false)
  }, [])

  // Filter grades based on selected filters
  const filteredGrades = grades.filter((grade) => {
    const matchesClass = !filter.class || `${grade.student.grade}${grade.student.section}` === filter.class
    const matchesSubject = !filter.subject || grade.subject === filter.subject
    const matchesTerm = !filter.term || grade.term === filter.term
    const matchesSearch =
      !filter.search ||
      grade.student.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      grade.student.lastName.toLowerCase().includes(filter.search.toLowerCase())

    return matchesClass && matchesSubject && matchesTerm && matchesSearch
  })

  const handleFilterChange = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Grades are being exported to CSV.",
    })

    // In a real app, you would implement the export functionality
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades Management</h1>
          <p className="text-muted-foreground">View and manage student grades</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher/grades/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Grade
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>View and filter student grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select value={filter.class} onValueChange={(value) => handleFilterChange("class", value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filter.subject} onValueChange={(value) => handleFilterChange("subject", value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filter.term} onValueChange={(value) => handleFilterChange("term", value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading grades...</div>
            ) : filteredGrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No grades found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Student</th>
                      <th className="p-2 text-left font-medium">Class</th>
                      <th className="p-2 text-left font-medium">Subject</th>
                      <th className="p-2 text-left font-medium">Term</th>
                      <th className="p-2 text-left font-medium">Score</th>
                      <th className="p-2 text-left font-medium">Grade</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((grade) => (
                      <tr key={grade.id} className="border-t">
                        <td className="p-2">{`${grade.student.firstName} ${grade.student.lastName}`}</td>
                        <td className="p-2">{`${grade.student.grade}${grade.student.section}`}</td>
                        <td className="p-2">{grade.subject}</td>
                        <td className="p-2">{grade.term}</td>
                        <td className="p-2">{grade.score}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              grade.grade.startsWith("A")
                                ? "bg-green-100 text-green-800"
                                : grade.grade.startsWith("B")
                                  ? "bg-blue-100 text-blue-800"
                                  : grade.grade.startsWith("C")
                                    ? "bg-yellow-100 text-yellow-800"
                                    : grade.grade.startsWith("D")
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {grade.grade}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/teacher/grades/${grade.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/teacher/grades/${grade.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

