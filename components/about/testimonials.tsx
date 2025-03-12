"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Emily Thompson",
    text: "The best dental experience I've ever had. The staff is incredibly professional and caring.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Wilson",
    text: "State-of-the-art facility with a warm, welcoming atmosphere. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Maria Garcia",
    text: "Outstanding service and results. The team made me feel comfortable throughout my treatment.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Patients Say
        </h2>
        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${testimonials.length * 100}%`,
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-full px-4 md:px-6 lg:px-8"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">{testimonial.text}</p>
                    <p className="font-semibold">{testimonial.name}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
          >
            &lt;
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
