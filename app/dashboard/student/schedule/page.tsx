"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function StudentSchedule() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [schedule, setSchedule] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/schedule")
        const data = await response.json()

        if (response.ok) {
          setSchedule(data)
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch schedule.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast({
          title: "Error",
          description: "Failed to fetch schedule. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [session, toast])

  if (isLoading) {
    return <div>Loading schedule...</div>
  }

  return (
    
  Student
  Schedule

  Your
  schedule
  for the week.
        
      
      
        {schedule.length > 0 ? (
          
            {schedule.map((item: any) => (
              
                
                  {item.courseName}
                
                
                  
                    {item.startTime} - {item.endTime}
                  
                  
                    {item.location}
                  
                
              
            ))}

  ) : (
          
            No schedule found.
          
        )
}

)
}

