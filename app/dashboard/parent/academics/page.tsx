"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ParentAcademics() {
  const { toast } = useToast()

  const [selectedChild, setSelectedChild] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("Term 1")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for children and terms
  const children = [
    { id: "1", name: "Sarah Doe", grade: "10A" },
    { id: "2", name: "Michael Doe", grade: "8B" },
  ]

  const terms = ["Term 1", "Term 2", "Term 3", "Final"]

  // Mock data for grades
  const [grades, setGrades] = useState<any[]>([])

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    if (selectedChild && selectedTerm) {
      // Simulate API call
      setTimeout(() => {
        const mockGrades = {
          "1": {
            // Sarah
            "Term 1": [
              { subject: "Mathematics", score: 92, grade: "A", remarks: "Excellent work!" },
              { subject: "Science", score: 88, grade: "B+", remarks: "Good understanding of concepts." },
              { subject: "English", score: 85, grade: "B", remarks: "Well-written essays, but needs work on grammar." },
              { subject: "History", score: 90, grade: "A-", remarks: "Excellent analysis of historical events." },
            ],
            "Term 2": [
              { subject: "Mathematics", score: 94, grade: "A", remarks: "Outstanding performance!" },
              { subject: "Science", score: 90, grade: "A-", remarks: "Improved understanding of complex concepts." },
              { subject: "English", score: 87, grade: "B+", remarks: "Improved grammar and writing style." },
              { subject: "History", score: 92, grade: "A", remarks: "Excellent research and analysis." },
            ],
          },
          "2": {
            // Michael
            "Term 1": [
              {
                subject: "Mathematics",
                score: 82,
                grade: "B",
                remarks: "Good effort, needs more practice with algebra.",
              },
              { subject: "Science", score: 87, grade: "B+", remarks: "Strong interest and participation in class." },
              { subject: "English", score: 89, grade: "B+", remarks: "Creative writing is excellent." },
              { subject: "Geography", score: 83, grade: "B", remarks: "Good understanding of basic concepts." },
            ],
            "Term 2": [
              { subject: "Mathematics", score: 85, grade: "B", remarks: "Showing improvement in algebra." },
              { subject: "Science", score: 88, grade: "B+", remarks: "Excellent lab work." },
              { subject: "English", score: 90, grade: "A-", remarks: "Outstanding progress in writing skills." },
              { subject: "Geography", score: 85, grade: "B", remarks: "Good map work and project submissions." },
            ],
          },
        }

        setGrades(mockGrades[selectedChild as keyof typeof mockGrades]?.[selectedTerm] || [])
        setIsLoading(false)
      }, 500)
    } else {
      setGrades([])
      setIsLoading(false)
    }
  }, [selectedChild, selectedTerm])

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Academic records are being exported to PDF.",
    })

    // In a real app, you would implement the export functionality
  }

  // Calculate GPA
  const calculateGPA = (grades: any[]) => {
    if (!grades.length) return "N/A"

    const gradePoints = {
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
      return sum + (gradePoints[grade.grade as keyof typeof gradePoints] || 0)
    }, 0)

    return (totalPoints / grades.length).toFixed(2)
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
                {child.name} - {child.grade}
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
                  {children.find((c) => c.id === selectedChild)?.name} - {selectedTerm} Grades
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
                      {grades.map((grade, index) => (
                        <tr key={index} className="border-t">
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
                  Overall performance summary for {children.find((c) => c.id === selectedChild)?.name}
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
                    {grades.map((grade, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
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

