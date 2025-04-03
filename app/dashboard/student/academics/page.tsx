"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Award, BookOpen, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentAcademics() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    term: "all",
    subject: "all",
  })

  // Fetch grades data
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("/api/grades")
        const data = await response.json()
        setGrades(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching grades:", error)
        toast({
          title: "Error",
          description: "Failed to load grades data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (session) {
      fetchGrades()
    }
  }, [session, toast])

  // Filter grades
  const filteredGrades = grades.filter((grade) => {
    const matchesTerm = filter.term === "all" || grade.term === filter.term
    const matchesSubject = filter.subject === "all" || grade.subject === filter.subject
    return matchesTerm && matchesSubject
  })

  // Get unique terms and subjects for filters
  const terms = [...new Set(grades.map((grade) => grade.term))].sort()
  const subjects = [...new Set(grades.map((grade) => grade.subject))].sort()

  // Calculate average score
  const averageScore =
    filteredGrades.length > 0
      ? Math.round(filteredGrades.reduce((sum, grade) => sum + grade.score, 0) / filteredGrades.length)
      : 0

  // Get grade distribution
  const gradeDistribution = {
    A: filteredGrades.filter((grade) => grade.grade === "A").length,
    B: filteredGrades.filter((grade) => grade.grade === "B").length,
    C: filteredGrades.filter((grade) => grade.grade === "C").length,
    D: filteredGrades.filter((grade) => grade.grade === "D").length,
    F: filteredGrades.filter((grade) => grade.grade === "F").length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">Loading your academic records...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
        <p className="text-muted-foreground">View your grades and academic performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="mr-2 h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore}%</div>
            <p className="text-sm text-muted-foreground">Based on {filteredGrades.length} grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
            <p className="text-sm text-muted-foreground">Total subjects with grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex flex-col items-center">
                  <span className="font-bold">{count}</span>
                  <span>{grade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>View and filter your academic grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Select value={filter.term} onValueChange={(value) => setFilter((prev) => ({ ...prev, term: value }))}>
                <SelectTrigger className="w-full md:w-[150px]">
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

              <Select
                value={filter.subject}
                onValueChange={(value) => setFilter((prev) => ({ ...prev, subject: value }))}
              >
                <SelectTrigger className="w-full md:w-[200px]">
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
            </div>

            {filteredGrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No grades found matching the selected filters.
              </div>
            ) : (
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="subject">By Subject</TabsTrigger>
                  <TabsTrigger value="term">By Term</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Subject</th>
                          <th className="p-2 text-left font-medium">Term</th>
                          <th className="p-2 text-left font-medium">Score</th>
                          <th className="p-2 text-left font-medium">Grade</th>
                          <th className="p-2 text-left font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGrades.map((grade) => (
                          <tr key={grade.id} className="border-t">
                            <td className="p-2 font-medium">{grade.subject}</td>
                            <td className="p-2">{grade.term}</td>
                            <td className="p-2">{grade.score}%</td>
                            <td className="p-2">
                              <Badge
                                className={
                                  grade.grade === "A"
                                    ? "bg-green-100 text-green-800"
                                    : grade.grade === "B"
                                      ? "bg-blue-100 text-blue-800"
                                      : grade.grade === "C"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : grade.grade === "D"
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-red-100 text-red-800"
                                }
                              >
                                {grade.grade}
                              </Badge>
                            </td>
                            <td className="p-2">{new Date(grade.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="subject">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((subject) => {
                      const subjectGrades = filteredGrades.filter((g) => g.subject === subject)
                      if (subjectGrades.length === 0) return null

                      const avgScore = Math.round(
                        subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length,
                      )

                      return (
                        <Card key={subject}>
                          <CardHeader className="pb-2">
                            <CardTitle>{subject}</CardTitle>
                            <CardDescription>Average: {avgScore}%</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {subjectGrades.map((grade) => (
                                <div key={grade.id} className="flex justify-between items-center border-b pb-2">
                                  <div>
                                    <p className="text-sm font-medium">{grade.term}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(grade.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      grade.grade === "A"
                                        ? "bg-green-100 text-green-800"
                                        : grade.grade === "B"
                                          ? "bg-blue-100 text-blue-800"
                                          : grade.grade === "C"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : grade.grade === "D"
                                              ? "bg-orange-100 text-orange-800"
                                              : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {grade.score}% - {grade.grade}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="term">
                  <div className="space-y-6">
                    {terms.map((term) => {
                      const termGrades = filteredGrades.filter((g) => g.term === term)
                      if (termGrades.length === 0) return null

                      const avgScore = Math.round(termGrades.reduce((sum, g) => sum + g.score, 0) / termGrades.length)

                      return (
                        <div key={term}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{term}</h3>
                            <Badge variant="outline">Average: {avgScore}%</Badge>
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="p-2 text-left font-medium">Subject</th>
                                  <th className="p-2 text-left font-medium">Score</th>
                                  <th className="p-2 text-left font-medium">Grade</th>
                                </tr>
                              </thead>
                              <tbody>
                                {termGrades.map((grade) => (
                                  <tr key={grade.id} className="border-t">
                                    <td className="p-2 font-medium">{grade.subject}</td>
                                    <td className="p-2">{grade.score}%</td>
                                    <td className="p-2">
                                      <Badge
                                        className={
                                          grade.grade === "A"
                                            ? "bg-green-100 text-green-800"
                                            : grade.grade === "B"
                                              ? "bg-blue-100 text-blue-800"
                                              : grade.grade === "C"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : grade.grade === "D"
                                                  ? "bg-orange-100 text-orange-800"
                                                  : "bg-red-100 text-red-800"
                                        }
                                      >
                                        {grade.grade}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

