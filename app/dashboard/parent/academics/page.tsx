"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
}

interface GradeRecord {
  id: string
  subject: string
  term: string
  score: number
  grade: string
  remarks: string
  teacher: string
}

export default function ParentAcademics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("Term 1")
  const [isLoading, setIsLoading] = useState(true)
  const [grades, setGrades] = useState<GradeRecord[]>([])

  // Terms
  const terms = ["Term 1", "Term 2", "Term 3", "Final"]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/students?parentId=current")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data)
        if (data.length > 0) {
          setSelectedChild(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching children:", error)
        toast({
          title: "Error",
          description: "Failed to load your children's data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchChildren()
    }
  }, [status, toast])

  useEffect(() => {
    async function fetchGrades() {
      if (!selectedChild || !selectedTerm) {
        setGrades([])
        return
      }

      try {
        setIsLoading(true)
        const res = await fetch(`/api/grades?studentId=${selectedChild}&term=${selectedTerm}`)
        if (!res.ok) throw new Error("Failed to fetch grades")
        const data = await res.json()
        setGrades(data)
      } catch (error) {
        console.error("Error fetching grades:", error)
        toast({
          title: "Error",
          description: "Failed to load academic records. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedChild && selectedTerm) {
      fetchGrades()
    }
  }, [selectedChild, selectedTerm, toast])

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Academic records are being exported to PDF.",
    })

    // In a real app, you would implement the export functionality
  }

  // Calculate GPA
  const calculateGPA = (grades: GradeRecord[]) => {
    if (!grades.length) return "N/A"

    const gradePoints: { [key: string]: number } = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    }

    const totalPoints = grades.reduce((sum, grade) => {
      return sum + (gradePoints[grade.grade] || 0)
    }, 0)

    return (totalPoints / grades.length).toFixed(2)
  }

  if (isLoading && !children.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">Loading academic data...</p>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">View your child's academic performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!selectedChild || !grades.length}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName} - Grade {child.grade}
                {child.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!selectedChild}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term} value={term}>
                {term}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedChild ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Please select a child to view their academic records.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Loading academic records...</p>
          </CardContent>
        </Card>
      ) : grades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No academic records found for the selected term.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grades">
          <TabsList>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                  {children.find((c) => c.id === selectedChild)?.lastName} - {selectedTerm} Grades
                </CardTitle>
                <CardDescription>Detailed academic performance for {selectedTerm}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Score</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-t">
                          <td className="p-2">{grade.subject}</td>
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
                          <td className="p-2">{grade.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
                <CardDescription>
                  Overall performance summary for {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                  {children.find((c) => c.id === selectedChild)?.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800">GPA</h3>
                    <p className="text-2xl font-bold">{calculateGPA(grades)}</p>
                    <p className="text-sm text-muted-foreground">Based on current grades</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800">Highest Grade</h3>
                    <p className="text-2xl font-bold">
                      {grades.length ? Math.max(...grades.map((g) => g.score)) : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {grades.length
                        ? grades.reduce((highest, grade) => (grade.score > highest.score ? grade : highest), grades[0])
                            .subject
                        : ""}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-800">Average Score</h3>
                    <p className="text-2xl font-bold">
                      {grades.length
                        ? (grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length).toFixed(1)
                        : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">Across all subjects</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Subject Performance</h3>
                  <div className="space-y-3">
                    {grades.map((grade) => (
                      <div key={grade.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{grade.subject}</span>
                          <span>{grade.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              grade.score >= 90
                                ? "bg-green-600"
                                : grade.score >= 80
                                  ? "bg-blue-600"
                                  : grade.score >= 70
                                    ? "bg-yellow-600"
                                    : grade.score >= 60
                                      ? "bg-orange-600"
                                      : "bg-red-600"
                            }`}
                            style={{ width: `${grade.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

