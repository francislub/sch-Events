import { Card, CardContent } from "@/components/ui/card"
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import Image from "next/image"
import img from "../../public/images/doct.jpg"


const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Lead Dentist",
    image: img,
    schedule: "Mon-Fri: 9:00 AM - 5:00 PM",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      email: "sarah@example.com",
    },
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    title: "Orthodontist",
    image: img,
    schedule: "Mon-Thu: 10:00 AM - 6:00 PM",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      email: "michael@example.com",
    },
  },
  // Add more doctors as needed
]

export function DoctorsSection() {
  return (
    <section className="bg-gray-50 py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Expert Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="p-6">
                <div className="relative h-[300px] mb-4">
                  <Image
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.title}</p>
                  <p className="text-sm text-gray-500">{doctor.schedule}</p>
                  <div className="flex justify-center gap-4 pt-2">
                    <a href={doctor.social.facebook} className="text-gray-600 hover:text-primary">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href={doctor.social.twitter} className="text-gray-600 hover:text-primary">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href={doctor.social.linkedin} className="text-gray-600 hover:text-primary">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={`mailto:${doctor.social.email}`} className="text-gray-600 hover:text-primary">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

