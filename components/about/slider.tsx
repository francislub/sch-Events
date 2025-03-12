"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import imag from "../../public/images/do.jpg";
import imag1 from "../../public/images/doct.jpg";
import imag2 from "../../public/images/doct.jpg";

const slides = [
  {
    id: 1,
    image: imag,
    title: "State-of-the-art Dental Care",
    description: "Experience modern dentistry at its finest",
  },
  {
    id: 2,
    image: imag1,
    title: "Expert Team of Professionals",
    description: "Dedicated to your oral health",
  },
  {
    id: 3,
    image: imag2,
    title: "Comfortable Environment",
    description: "Your comfort is our priority",
  },
];

export function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section className="relative w-full">
      {/* Carousel Content */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentIndex ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
            }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
      >
        &lt;
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
      >
        &gt;
      </button>
    </section>
  );
}
