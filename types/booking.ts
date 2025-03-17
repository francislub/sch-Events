export interface DentalService {
    id: string
    title: string
    category: string
    duration: string
    price: number
    icon: string
  }
  
  export interface TimeSlot {
    start: string
    end: string
    available: number
    period: "Morning" | "Afternoon"
  }
  
  export interface BookingFormData {
    service: DentalService | null
    date: Date | null
    timeSlot: TimeSlot | null
    firstName: string
    lastName: string
    email: string
    phone: string
    note: string
  }
  
  