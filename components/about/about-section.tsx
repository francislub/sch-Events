import { Button } from "@/components/ui/button"
import Image from "next/image"
import img from "../../public/images/doct.jpg"

export function AboutSection() {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Image
            src={img}
            alt="Dental Services"
            width={600}
            height={400}
            className="rounded-lg"
          />
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Comprehensive Dental Services</h2>
            <p className="text-gray-600">
              We offer a complete range of dental services to meet all your oral health needs. From routine cleanings to
              complex procedures, our experienced team is here to help you maintain a healthy, beautiful smile.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Image
            src={img}
            alt="Modern Facility"
            width={600}
            height={400}
            className="rounded-lg md:order-2"
          />
          <div className="space-y-4 md:order-1">
            <h2 className="text-3xl font-bold">State-of-the-Art Facility</h2>
            <p className="text-gray-600">
              Our modern facility is equipped with the latest dental technology to provide you with the highest quality
              care. We maintain strict sterilization standards and use advanced diagnostic tools for precise treatment
              planning.
            </p>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Schedule an Appointment</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ready to experience exceptional dental care? Contact us today to schedule your appointment. We look forward
            to helping you achieve optimal oral health.
          </p>
          <Button size="lg">Book Now</Button>
        </div>
      </div>
    </section>
  )
}

