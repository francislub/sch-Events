import { Button } from "@/components/ui/button"
import Image from "next/image"
import img from "../../public/images/doct.jpg"

export function GoalsSection() {
  return (
    <section className="bg-[#1e3a8a] text-white py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-gray-300 mb-2">GOALS</h3>
              <h2 className="text-4xl font-bold mb-4">Dante Center Vision & Mission</h2>
            </div>

            <div className="bg-white text-blue-900 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">VISION</h3>
              <h4 className="text-xl font-bold mb-4">Our Vision</h4>
              <p>We provide exceptional oral health care and create a welcoming environment for our patients.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">MISSION</h3>
              <h4 className="text-xl font-bold mb-4">Our Goals</h4>
              <p className="mb-4">To Provide Exceptional Dental Care and Improve Oral Health</p>
              <p className="mb-4">
                At our dental clinic, our primary goal is to provide exceptional dental care to our patients and improve
                their oral health. We aim to achieve this by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Offering a comprehensive range of dental services to meet the diverse needs of our patients.</li>
                <li>
                  Utilizing the latest advancements in dental technology to ensure precise diagnoses and effective
                  treatments.
                </li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <Image
              src={img}
              alt="Dental Professional"
              width={600}
              height={800}
              className="rounded-lg"
            />
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Become Best Dentist</h3>
              <p className="text-gray-300">
                Utilize Advanced Technology: Utilize the latest advancements in dental technology to ensure precise
                diagnoses and effective treatments. This will help you provide your patients with the best possible
                care.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="bg-blue-800 text-white hover:bg-blue-700">
            OUR GOALS
          </Button>
        </div>
      </div>
    </section>
  )
}

