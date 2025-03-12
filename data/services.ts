import type { DentalService } from "../types/booking"

export const dentalServices: DentalService[] = [
  {
    id: "dental-checkup",
    title: "Dental Checkup",
    category: "All",
    duration: "15 m",
    price: 15000,
    icon: "tooth",
  },
  {
    id: "dental-checkup-full",
    title: "Dental Check - Up",
    category: "All",
    duration: "60 m",
    price: 15000,
    icon: "tooth",
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    category: "Cosmetic Dentistry",
    duration: "60 m",
    price: 500000,
    icon: "tooth",
  },
  {
    id: "root-canal",
    title: "Root Canal",
    category: "Endodontics",
    duration: "60 m",
    price: 200000,
    icon: "tooth",
  },
  {
    id: "dental-implant",
    title: "Dental Implant",
    category: "Cosmetic Dentistry",
    duration: "180 m",
    price: 5000000,
    icon: "tooth",
  },
  {
    id: "pfm-bridge",
    title: "PFM Bridge",
    category: "Cosmetic Dentistry",
    duration: "30 m",
    price: 400000,
    icon: "tooth",
  },
]

