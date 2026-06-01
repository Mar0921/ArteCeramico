"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import Image from "next/image"

const carouselItems = [
  {
    id: 1,
    title: "Coronas de Zirconio Premium",
    description: "Restauraciones estéticas de alta resistencia",
    image: "/portfolio/carousel-1.jpg",
  },
  {
    id: 2,
    title: "Carillas de Porcelana",
    description: "Sonrisas perfectas con acabado natural",
    image: "/portfolio/carousel-2.jpg",
  },
  {
    id: 3,
    title: "Prótesis sobre Implantes",
    description: "Soluciones fijas de última generación",
    image: "/portfolio/carousel-3.jpg",
  },
  {
    id: 4,
    title: "Diseño Digital de Sonrisa",
    description: "Planificación estética personalizada",
    image: "/portfolio/carousel-4.jpg",
  },
]

const portfolioItems = [
  {
    id: 1,
    title: "Corona E.max",
    category: "Coronas",
    image: "/portfolio/work-1.jpg",
  },
  {
    id: 2,
    title: "Puente de Zirconio",
    category: "Puentes",
    image: "/portfolio/work-2.jpg",
  },
  {
    id: 3,
    title: "Carillas Anteriores",
    category: "Carillas",
    image: "/portfolio/work-3.jpg",
  },
  {
    id: 4,
    title: "Prótesis Total",
    category: "Prótesis",
    image: "/portfolio/work-4.jpg",
  },
  {
    id: 5,
    title: "Incrustación Cerámica",
    category: "Incrustaciones",
    image: "/portfolio/work-5.jpg",
  },
  {
    id: 6,
    title: "Corona sobre Implante",
    category: "Implantes",
    image: "/portfolio/work-6.jpg",
  },
]

export function PortfolioSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }, [])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section id="portafolio" className="bg-background py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-primary-dark">
            Nuestro Trabajo
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Portafolio de Trabajos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Cada pieza es una obra de arte que refleja nuestra dedicación a la
            excelencia y precisión dental.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-16 overflow-hidden rounded-2xl bg-card shadow-xl"
        >
          <div className="relative aspect-[21/9]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {/* Placeholder for carousel image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary-dark/20">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <ZoomIn size={32} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Imagen: {carouselItems[currentSlide].image}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white sm:text-3xl"
                  >
                    {carouselItems[currentSlide].title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-white/80"
                  >
                    {carouselItems[currentSlide].description}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-card shadow-lg"
              onClick={() => setSelectedImage(item.image)}
            >
              <div className="aspect-[4/3]">
                {/* Placeholder for portfolio image */}
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary-dark/10">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ZoomIn size={20} className="text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.image}
                    </p>
                  </div>
                </div>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="mb-1 text-xs font-medium text-accent">
                  {item.category}
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
              </div>
              {/* Zoom icon */}
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                <ZoomIn size={16} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-card"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary-dark/10 p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <ZoomIn size={28} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground">{selectedImage}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click para cerrar
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
