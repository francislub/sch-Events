import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Award, BookOpen } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Wobulezi Senior Secondary School</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Providing quality education and fostering excellence since 1985
          </p>
        </div>

        <div className="mb-12">
          <img
            src="/placeholder.svg?height=400&width=800"
            alt="Wobulezi Senior Secondary School"
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        <div className="prose max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p>
            At Wobulezi Senior Secondary School, our mission is to provide a comprehensive, high-quality education that
            empowers students to achieve academic excellence, develop critical thinking skills, and become responsible
            global citizens. We are committed to creating a nurturing environment that fosters intellectual curiosity,
            creativity, and personal growth.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Vision</h2>
          <p>
            Our vision is to be a leading educational institution that prepares students to thrive in a rapidly changing
            world. We aim to cultivate a community of lifelong learners who are equipped with the knowledge, skills, and
            values necessary to make positive contributions to society.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our History</h2>
          <p>
            Founded in 1985, Wobulezi Senior Secondary School has a rich history of academic excellence and community
            engagement. What began as a small institution with just a few classrooms has grown into a comprehensive
            educational facility serving hundreds of students from diverse backgrounds.
          </p>
          <p>
            Over the decades, we have continuously evolved our curriculum and facilities to meet the changing needs of
            our students and the demands of the modern world. Our commitment to providing quality education has remained
            unwavering throughout our journey.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Core Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Excellence:</strong> We strive for the highest standards in all aspects of education.
            </li>
            <li>
              <strong>Integrity:</strong> We uphold honesty, ethics, and transparency in all our actions.
            </li>
            <li>
              <strong>Respect:</strong> We value diversity and treat all individuals with dignity and fairness.
            </li>
            <li>
              <strong>Innovation:</strong> We embrace creativity and new ideas to enhance learning experiences.
            </li>
            <li>
              <strong>Community:</strong> We foster a sense of belonging and encourage collaboration among students,
              staff, and the wider community.
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Established</h3>
              <p className="text-muted-foreground">1985</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Students</h3>
              <p className="text-muted-foreground">1,200+</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Achievements</h3>
              <p className="text-muted-foreground">50+ National Awards</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Programs</h3>
              <p className="text-muted-foreground">15+ Specialized Courses</p>
            </CardContent>
          </Card>
        </div>

        <div className="prose max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">Leadership Team</h2>
          <p>
            Our school is led by a dedicated team of experienced educators and administrators who are committed to
            maintaining high standards of education and fostering a positive learning environment.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Dr. Sarah Nakato</strong> - Principal
            </li>
            <li>
              <strong>Mr. Joseph Mukasa</strong> - Vice Principal, Academics
            </li>
            <li>
              <strong>Mrs. Elizabeth Ochieng</strong> - Vice Principal, Administration
            </li>
            <li>
              <strong>Mr. Daniel Kigozi</strong> - Head of Sciences Department
            </li>
            <li>
              <strong>Ms. Patricia Nambi</strong> - Head of Arts Department
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

