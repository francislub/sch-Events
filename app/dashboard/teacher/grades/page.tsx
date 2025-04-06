"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, FileDown, Search, Loader2 } from "lucide-react"
import Link from "next/link"

export default function TeacherGrades() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    class: "all",
    subject: "all",
    term: "all",
    search: "",
  })

  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])

  // Define subjects directly in the component
  const subjects = [
    "Mathematics",
    "English Language",
    "Science",
    "Social Studies",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Information Technology",
    "Art",
    "Music",
    "Physical Education",
    "Foreign Language",
    "Economics",
    "Business Studies",
    "Religious Studies",
    "Civics",
    "Environmental Science",
  ]

  const terms = ["Term 1", "Term 2", "Term 3", "Final"]

  // Fetch classes taught by the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes/teacher")
        if (!response.ok) throw new Error("Failed to fetch classes")
        const data = await response.json()
        setClasses(data)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchClasses()
  }, [toast])

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true)
      try {
        let url = "/api/grades/teacher?"

        if (filter.class && filter.class !== "all") {
          url += `classId=${filter.class}&`
        }

        if (filter.subject && filter.subject !== "all") {
          url += `subject=${filter.subject}&`
        }

        if (filter.term && filter.term !== "all") {
          url += `term=${filter.term}&`
        }

        if (filter.search) {
          url += `search=${filter.search}&`
        }

        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch grades")
        }

        const data = await response.json()
        setGrades(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching grades:", error)
        toast({
          title: "Error",
          description: "Failed to load grades. Please try again.",
          variant: "destructive",
        })
        setGrades([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrades()
  }, [filter, toast])

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
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name || `${cls.grade}-${cls.section}`}
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
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : grades.length === 0 ? (
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
                    {grades.map((grade) => (
                      <tr key={grade.id} className="border-t">
                        <td className="p-2">{`${grade.student.firstName} ${grade.student.lastName}`}</td>
                        <td className="p-2">{grade.class.name}</td>
                        <td className="p-2">{grade.subject}</td>
                        <td className="p-2">{grade.term}</td>
                        <td className="p-2">{grade.score}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              grade.letterGrade.startsWith("A")
                                ? "bg-green-100 text-green-800"
                                : grade.letterGrade.startsWith("B")
                                  ? "bg-blue-100 text-blue-800"
                                  : grade.letterGrade.startsWith("C")
                                    ? "bg-yellow-100 text-yellow-800"
                                    : grade.letterGrade.startsWith("D")
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {grade.letterGrade}
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

