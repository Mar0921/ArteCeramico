"use client"

import { motion } from "framer-motion"
import { ArrowRight, Phone } from "lucide-react"

export function HeroSection() {
  const handleScrollToServices = () => {
    const element = document.querySelector("#servicios")
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  const handleScrollToContact = () => {
    const element = document.querySelector("#contacto")
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-background pt-20"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float-delayed absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="animate-float absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center py-12 lg:flex-row lg:gap-12 lg:py-0">

          {/* TEXT */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-sm font-medium text-primary-dark">
                Laboratorio Dental
              </span>
            </motion.div>

            {/* TITULO */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-balance font-bold tracking-tight text-foreground leading-[0.95]"
            >
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                Excelencia en
              </span>

              <span className="block -mt-2 sm:-mt-1">
                <img
                  src="/Arte_Ceramico_Logo.svg"
                  alt="Arte Cerámico"
                  className="h-[2.6em] sm:h-[2.2em] lg:h-[7.8em] w-auto mx-auto lg:mx-0"
                />
              </span>
            </motion.h1>

            {/* DESCRIPCIÓN */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl"
            >
              Somos un laboratorio dental especializado en prótesis fija, con más de 15 años de experiencia brindando soluciones de alta calidad para profesionales de la odontología. Combinamos procesos técnicos precisos, materiales certificados y un enfoque estético personalizado para fabricar prótesis confiables, funcionales y adaptadas a cada paciente.
            </motion.p>

            {/* BOTONES */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={handleScrollToServices}
                className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary-dark hover:shadow-xl"
              >
                Ver Servicios
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={handleScrollToContact}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-transparent px-6 py-3.5 text-base font-semibold text-primary transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground"
              >
                <Phone size={18} />
                Contáctanos
              </button>
            </motion.div>

          </div>

          {/* IMAGEN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 flex-1 lg:mt-0"
          >
            <div className="relative mx-auto aspect-square max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-3xl bg-card shadow-2xl">
                <p className="text-sm text-muted-foreground">
                  Imagen de Laboratorio Dental
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}