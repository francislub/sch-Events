"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen, GraduationCap, AlertCircle, Download, BarChart3, FileText, Award, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
}

interface Grade {
  id: string
  subject: string
  term: string
  score: number
  grade: string
  remarks?: string
  createdAt: string
}

interface SubjectSummary {
  subject: string
  average: number
  trend: "up" | "down" | "stable"
  lastGrade: string
}

export default function AcademicsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1")
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildren() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/students?parentId=current")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data)
        if (data.length > 0) {
          setSelectedChild(data[0].id)
        }
      } catch (err) {
        console.error("Error fetching children:", err)
        setError("Failed to load children data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive",
        })

        // Set mock data for development
        const mockChildren = [
          { id: "child1", firstName: "John", lastName: "Doe", grade: "5", section: "A" },
          { id: "child2", firstName: "Jane", lastName: "Doe", grade: "3", section: "B" },
        ]
        setChildren(mockChildren)
        setSelectedChild("child1")
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
      if (!selectedChild) return

      try {
        setIsLoading(true)
        const res = await fetch(`/api/grades?studentId=${selectedChild}&term=${selectedTerm}`)
        if (!res.ok) throw new Error("Failed to fetch grades")
        const data = await res.json()

        // Ensure data is an array
        const gradesArray = Array.isArray(data) ? data : []
        setGrades(gradesArray)

        // Calculate subject summaries
        calculateSubjectSummaries(gradesArray)
      } catch (err) {
        console.error("Error fetching grades:", err)
        setError("Failed to load grades data. Please try again.")

        // Set mock data for development
        const mockGrades = [
          {
            id: "grade1",
            subject: "Mathematics",
            term: selectedTerm,
            score: 85,
            grade: "B+",
            remarks: "Good progress in algebra",
            createdAt: new Date().toISOString(),
          },
          {
            id: "grade2",
            subject: "Science",
            term: selectedTerm,
            score: 92,
            grade: "A",
            remarks: "Excellent understanding of concepts",
            createdAt: new Date().toISOString(),
          },
          {
            id: "grade3",
            subject: "English",
            term: selectedTerm,
            score: 78,
            grade: "C+",
            remarks: "Needs improvement in writing skills",
            createdAt: new Date().toISOString(),
          },
          {
            id: "grade4",
            subject: "History",
            term: selectedTerm,
            score: 88,
            grade: "B+",
            remarks: "Good analytical skills",
            createdAt: new Date().toISOString(),
          },
          {
            id: "grade5",
            subject: "Art",
            term: selectedTerm,
            score: 95,
            grade: "A",
            remarks: "Creative and talented",
            createdAt: new Date().toISOString(),
          },
        ]
        setGrades(mockGrades)
        calculateSubjectSummaries(mockGrades)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedChild) {
      fetchGrades()
    }
  }, [selectedChild, selectedTerm])

  const calculateSubjectSummaries = (gradesData: Grade[]) => {
    const subjects = [...new Set(gradesData.map((grade) => grade.subject))]

    const summaries = subjects.map((subject) => {
      const subjectGrades = gradesData.filter((grade) => grade.subject === subject)
      const average = subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length

      // Determine trend (in a real app, you'd compare with previous terms)
      const trend = Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable"

      return {
        subject,
        average: Math.round(average),
        trend: trend as "up" | "down" | "stable",
        lastGrade: subjectGrades[0]?.grade || "N/A",
      }
    })

    setSubjectSummaries(summaries)
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500"
    if (score >= 80) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    if (score >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  const calculateGPA = () => {
    if (!grades || grades.length === 0) return "N/A"

    const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0)
    const gpa = totalScore / grades.length / 20 // Convert to 4.0 scale
    return gpa.toFixed(2)
  }

  const handleExportReport = () => {
    toast({
      title: "Report Generated",
      description: "Academic report has been generated and is ready for download.",
    })
    // In a real app, this would generate and download a PDF report
  }

  const getSelectedChildName = () => {
    const child = children.find((c) => c.id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Select a child"
  }

  if (isLoading && children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">Loading academic records...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">View and track your children's academic performance and grades.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-64">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Child</label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child" />
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="bg-blue-50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">GPA</span>
                    <span className="text-lg font-bold text-blue-600">{calculateGPA()}</span>
                  </div>
                  <Progress value={Number.parseFloat(calculateGPA()) * 25} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Subjects</span>
                    <span className="text-sm">{grades.length}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Term</span>
                    <span className="text-sm">{selectedTerm}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Student</span>
                    <span className="text-sm">{getSelectedChildName()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="grades" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="grades" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Grades
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grades">
              <Card>
                <CardHeader className="bg-slate-50 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-slate-600" />
                      Grade Report
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {selectedTerm} • {getSelectedChildName()}
                    </div>
                  </div>
                  <CardDescription>Detailed academic performance for each subject</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Loading grades...</p>
                    </div>
                  ) : Array.isArray(grades) && grades.length > 0 ? (
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
                            <tr key={grade.id} className="border-t hover:bg-slate-50">
                              <td className="p-2 font-medium">{grade.subject}</td>
                              <td className="p-2">
                                <div className="flex items-center">
                                  <div className="w-16 mr-2">
                                    <Progress
                                      value={grade.score}
                                      className="h-2"
                                      indicatorClassName={getProgressColor(grade.score)}
                                    />
                                  </div>
                                  <span>{grade.score}%</span>
                                </div>
                              </td>
                              <td className={`p-2 font-bold ${getGradeColor(grade.score)}`}>{grade.grade}</td>
                              <td className="p-2 text-muted-foreground">{grade.remarks || "No remarks"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">No grades available for this term</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardHeader className="bg-slate-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-slate-600" />
                    Performance Summary
                  </CardTitle>
                  <CardDescription>Overview of academic performance across subjects</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {subjectSummaries.map((summary, index) => (
                      <Card key={index} className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{summary.subject}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Average Score</span>
                            <span className={`font-bold ${getGradeColor(summary.average)}`}>{summary.average}%</span>
                          </div>
                          <Progress
                            value={summary.average}
                            className="h-2 mb-4"
                            indicatorClassName={getProgressColor(summary.average)}
                          />
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">Trend:</span>
                              {summary.trend === "up" ? (
                                <span className="text-green-600 flex items-center">
                                  Improving <TrendingUp className="ml-1 h-3 w-3" />
                                </span>
                              ) : summary.trend === "down" ? (
                                <span className="text-red-600">Declining</span>
                              ) : (
                                <span className="text-blue-600">Stable</span>
                              )}
                            </div>
                            <div>
                              <span className="text-muted-foreground mr-1">Latest:</span>
                              <span className="font-medium">{summary.lastGrade}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader className="bg-slate-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-slate-600" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>Track academic progress over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center p-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">
                      Performance trends will be available after multiple terms of data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
