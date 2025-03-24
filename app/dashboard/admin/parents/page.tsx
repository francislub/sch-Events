"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Search, MoreHorizontal, FileText, Trash2, Edit, Mail, Users } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getParents } from "@/app/actions/parent-actions"

export default function AdminParents() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    search: "",
  })

  const [parents, setParents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch parents data
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const data = await getParents()
        setParents(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching parents:", error)
        toast({
          title: "Error",
          description: "Failed to load parents data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchParents()
  }, [toast])

  // Filter parents
  const filteredParents = parents.filter((parent) => {
    const searchTerm = filter.search.toLowerCase()
    return (
      !searchTerm ||
      parent.user.name.toLowerCase().includes(searchTerm) ||
      parent.user.email.toLowerCase().includes(searchTerm) ||
      (parent.contactNumber && parent.contactNumber.toLowerCase().includes(searchTerm))
    )
  })

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ search: e.target.value })
  }

  const handleViewParent = (id: string) => {
    router.push(`/dashboard/admin/parents/${id}`)
  }

  const handleEditParent = (id: string) => {
    router.push(`/dashboard/admin/parents/${id}/edit`)
  }

  const handleViewChildren = (id: string) => {
    router.push(`/dashboard/admin/parents/${id}/children`)
  }

  const handleDeleteParent = (id: string) => {
    // In a real app, you would call your API to delete the parent
    toast({
      title: "Parent Deleted",
      description: `Parent has been deleted successfully.`,
    })

    setParents((prev) => prev.filter((parent) => parent.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Management</h1>
          <p className="text-muted-foreground">View and manage all parents and guardians</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/parents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Parent
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parents</CardTitle>
          <CardDescription>Browse and search for parents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parents by name, email or contact number..."
                  className="pl-8"
                  value={filter.search}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center border-b pb-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="space-x-2">
                      <div className="h-8 w-16 bg-muted rounded inline-block"></div>
                      <div className="h-8 w-16 bg-muted rounded inline-block"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No parents found matching the search term.</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Email</th>
                      <th className="p-2 text-left font-medium">Contact</th>
                      <th className="p-2 text-left font-medium">Children</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map((parent) => (
                      <tr key={parent.id} className="border-t">
                        <td className="p-2 font-medium">{parent.user.name}</td>
                        <td className="p-2">{parent.user.email}</td>
                        <td className="p-2">{parent.contactNumber || "N/A"}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {parent.children.length} children
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewParent(parent.id)}>
                              View
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewParent(parent.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditParent(parent.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Parent
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewChildren(parent.id)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  View Children
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`mailto:${parent.user.email}`)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email Parent
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteParent(parent.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Parent
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parents.length}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.reduce((total, parent) => total + parent.children.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all parents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Children per Parent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.length > 0
                ? (parents.reduce((total, parent) => total + parent.children.length, 0) / parents.length).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Children per parent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

