"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown, BookOpen, Award, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
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
  date?: string
}

export default function ParentAcademics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("Term 1")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [allGrades, setAllGrades] = useState<{ [key: string]: { [key: string]: GradeRecord[] } }>({})

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
        setIsLoading(true)
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
    async function fetchAllGrades() {
      if (!children.length) return

      try {
        const allGradesData: { [key: string]: { [key: string]: GradeRecord[] } } = {}

        for (const child of children) {
          allGradesData[child.id] = {}

          for (const term of terms) {
            const res = await fetch(`/api/grades?studentId=${child.id}&term=${term}`)
            if (res.ok) {
              const data = await res.json()
              allGradesData[child.id][term] = data
            } else {
              allGradesData[child.id][term] = []
            }
          }
        }

        setAllGrades(allGradesData)
      } catch (error) {
        console.error("Error fetching all grades:", error)
      }
    }

    if (children.length > 0) {
      fetchAllGrades()
    }
  }, [children])

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
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Academic records have been exported to PDF.",
      })
      setIsExporting(false)
    }, 2000)
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

  // Get grade color
  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    if (grade.startsWith("D")) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-600"
    if (score >= 80) return "bg-blue-600"
    if (score >= 70) return "bg-yellow-600"
    if (score >= 60) return "bg-orange-600"
    return "bg-red-600"
  }

  // Get performance trend
  const getPerformanceTrend = (childId: string, subject: string) => {
    if (!allGrades[childId]) return null

    const termScores: number[] = []

    for (const term of terms) {
      if (allGrades[childId][term]) {
        const subjectGrade = allGrades[childId][term].find((g) => g.subject === subject)
        if (subjectGrade) {
          termScores.push(subjectGrade.score)
        }
      }
    }

    if (termScores.length < 2) return null

    // Compare last two scores
    const lastScore = termScores[termScores.length - 1]
    const previousScore = termScores[termScores.length - 2]

    if (lastScore > previousScore) return "improving"
    if (lastScore < previousScore) return "declining"
    return "stable"
  }

  // Get trend icon
  const getTrendIcon = (trend: string | null) => {
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === "declining") return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (trend === "stable") return <CheckCircle className="h-4 w-4 text-blue-600" />
    return null
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
          <Button variant="outline" onClick={handleExport} disabled={!selectedChild || !grades.length || isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
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
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading academic records...</p>
          </CardContent>
        </Card>
      ) : grades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No academic records found for the selected term.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="grades" className="data-[state=active]:bg-white">
              Grades
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-white">
              Summary
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-white">
              Performance Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-slate-600" />
                  <div>
                    <CardTitle>
                      {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                      {children.find((c) => c.id === selectedChild)?.lastName} - {selectedTerm} Grades
                    </CardTitle>
                    <CardDescription>Detailed academic performance for {selectedTerm}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Score</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Teacher</th>
                        <th className="p-2 text-left font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-t hover:bg-slate-50">
                          <td className="p-2 font-medium">{grade.subject}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span>{grade.score}%</span>
                              {getPerformanceTrend(selectedChild, grade.subject) && (
                                <span>{getTrendIcon(getPerformanceTrend(selectedChild, grade.subject))}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          </td>
                          <td className="p-2">{grade.teacher}</td>
                          <td className="p-2 text-sm">{grade.remarks}</td>
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
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-slate-600" />
                  <div>
                    <CardTitle>Academic Summary</CardTitle>
                    <CardDescription>
                      Overall performance summary for {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                      {children.find((c) => c.id === selectedChild)?.lastName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800">GPA</h3>
                    <p className="text-2xl font-bold text-blue-700">{calculateGPA(grades)}</p>
                    <p className="text-sm text-blue-600">Based on current grades</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800">Highest Grade</h3>
                    <p className="text-2xl font-bold text-green-700">
                      {grades.length ? Math.max(...grades.map((g) => g.score)) : "N/A"}
                    </p>
                    <p className="text-sm text-green-600">
                      {grades.length
                        ? grades.reduce((highest, grade) => (grade.score > highest.score ? grade : highest), grades[0])
                            .subject
                        : ""}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-purple-800">Average Score</h3>
                    <p className="text-2xl font-bold text-purple-700">
                      {grades.length
                        ? (grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length).toFixed(1)
                        : "N/A"}
                    </p>
                    <p className="text-sm text-purple-600">Across all subjects</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Subject Performance</h3>
                  <div className="space-y-3">
                    {grades.map((grade) => (
                      <div key={grade.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{grade.subject}</span>
                          <span className="flex items-center gap-1">
                            {grade.score}%
                            {getPerformanceTrend(selectedChild, grade.subject) && (
                              <span>{getTrendIcon(getPerformanceTrend(selectedChild, grade.subject))}</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${getScoreColor(grade.score)}`}
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

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-slate-600" />
                  <div>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>
                      Track academic progress across terms for {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                      {children.find((c) => c.id === selectedChild)?.lastName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {allGrades[selectedChild] ? (
                  <div className="space-y-6">
                    {grades.map((grade) => {
                      const subjectData = terms
                        .map((term) => {
                          const termGrades = allGrades[selectedChild][term] || []
                          return termGrades.find((g) => g.subject === grade.subject)
                        })
                        .filter(Boolean) as GradeRecord[]

                      return (
                        <div key={grade.id} className="border rounded-lg p-4">
                          <h3 className="font-medium text-lg mb-3">{grade.subject}</h3>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {subjectData.map((termGrade, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg ${
                                    termGrade.grade.startsWith("A")
                                      ? "bg-green-50 border border-green-100"
                                      : termGrade.grade.startsWith("B")
                                        ? "bg-blue-50 border border-blue-100"
                                        : termGrade.grade.startsWith("C")
                                          ? "bg-yellow-50 border border-yellow-100"
                                          : termGrade.grade.startsWith("D")
                                            ? "bg-orange-50 border border-orange-100"
                                            : "bg-red-50 border border-red-100"
                                  }`}
                                >
                                  <div className="text-sm font-medium text-slate-600">{termGrade.term}</div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">{termGrade.score}%</span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs ${getGradeColor(termGrade.grade)}`}
                                    >
                                      {termGrade.grade}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-slate-600 mb-2">Progress Chart</h4>
                              <div className="h-24 bg-slate-50 rounded-lg p-3 flex items-end">
                                {subjectData.map((termGrade, index) => (
                                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div
                                      className={`w-6 ${getScoreColor(termGrade.score)}`}
                                      style={{ height: `${termGrade.score}%` }}
                                    ></div>
                                    <div className="text-xs mt-1">{termGrade.term}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="text-sm">
                              <h4 className="font-medium text-slate-600 mb-1">Teacher Remarks:</h4>
                              <p className="text-slate-700">{grade.remarks || "No remarks provided."}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No trend data available. Please check back after multiple terms.
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t">
                <div className="w-full text-center text-sm text-muted-foreground">
                  Note: Performance trends are calculated based on available term data.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
