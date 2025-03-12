import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Bell, BookOpen } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Wobulezi Senior Secondary School</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">Event Management System</h2>
          <p className="text-xl mb-8 max-w-2xl">
            Streamline school events planning, registration, and management with our comprehensive platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CalendarDays className="h-10 w-10" />}
              title="Event Planning"
              description="Create, schedule, and manage school events with ease."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="User Management"
              description="Different roles for admin, teachers, students, and parents."
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10" />}
              title="Notifications"
              description="Automated reminders and updates for upcoming events."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Resource Management"
              description="Manage venues, equipment, and other resources."
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <Button asChild variant="outline">
              <Link href="/events">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* These would be dynamically generated from your database */}
            <EventCard title="Annual Sports Day" date="March 15, 2025" category="Sports" location="School Grounds" />
            <EventCard title="Science Exhibition" date="April 5, 2025" category="Academic" location="Main Hall" />
            <EventCard title="Cultural Festival" date="May 10, 2025" category="Cultural" location="Auditorium" />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function EventCard({ title, date, category, location }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm border">
      <div className="p-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
          {category}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-muted border-t">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/events/${title.toLowerCase().replace(/\s+/g, "-")}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}

