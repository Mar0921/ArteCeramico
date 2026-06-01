"use client"

import { motion } from "framer-motion"
import { Target, Eye, Cpu, ImageIcon } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Nuestra Misión",
    description:
      "Proveer a los profesionales odontológicos soluciones dentales de la más alta calidad, combinando artesanía tradicional con tecnología de vanguardia para transformar sonrisas.",
  },
  {
    icon: Eye,
    title: "Nuestra Visión",
    description:
      "Ser el laboratorio dental líder en Colombia, reconocido por nuestra excelencia, innovación y compromiso con la satisfacción de nuestros clientes y pacientes.",
  },
]

const technologies = [
  "Tecnologia CADCAM (scaner de mesa e intraoral, fresadoras e impresoras 3d)",
  "Hornos ceramica y otros asociados a la correcta elaboracion de protesis dentales",
]

const facilityImages = [
  {
    id: 1,
    title: "Área de Diseño Digital",
    image: "/instalaciones/diseno-digital.jpg",
  },
  {
    id: 2,
    title: "Laboratorio de Cerámica",
    image: "/instalaciones/laboratorio-ceramica.jpg",
  },
  {
    id: 3,
    title: "Sala de Fresado CAD/CAM",
    image: "/instalaciones/fresado-cadcam.jpg",
  },
  {
    id: 4,
    title: "Área de Control de Calidad",
    image: "/instalaciones/control-calidad.jpg",
  },
]

export function AboutSection() {
  return (
    <section id="nosotros" className="bg-card py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-primary-dark">
              QUIENES SOMOS
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Historia de la empresa
            </h2>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              Somos un laboratorio dental especializado en prótesis fija, con más de 15 años de experiencia brindando soluciones de alta calidad para profesionales de la odontología. Combinamos procesos técnicos precisos, materiales certificados y un enfoque estético personalizado para fabricar prótesis confiables, funcionales y adaptadas a cada paciente.
            </p>

            {/* Mission & Vision */}
            <div className="mt-10 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    Misión
                  </h3>
                  <p className="text-muted-foreground">
                    Fabricar prótesis dentales sobremedida principalmente prótesis fija, como carillas, coronas, coronas sobre implantes, entre otros—con un estándar de alta calidad enfocado en la estética y la personalización.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    Visión
                  </h3>
                  <p className="text-muted-foreground">
                    Para el 2027 lograr la certificación de calidad INVIMA, que nos permita garantizar la calidad en todos nuestros procesos tanto productivos como administrativos.
                  </p>
            </div>
          </motion.div>
        </div>
          </motion.div>

          {/* Right Column - Technology */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="rounded-2xl bg-background p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Tecnología de Vanguardia
                </h3>
              </div>
              <p className="mb-6 text-muted-foreground">
                Invertimos constantemente en la mejor tecnología disponible para
                garantizar precisión y calidad en cada trabajo.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {technologies.map((tech, index) => (
                  <motion.li
                    key={tech}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {tech}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Facility Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
              Nuestras Instalaciones
            </h3>
            <p className="mt-3 text-muted-foreground">
              Conoce los espacios donde creamos sonrisas perfectas
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {facilityImages.map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-background shadow-lg"
              >
                <div className="aspect-[4/3]">
                  {/* Placeholder for facility image */}
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary-dark/10 transition-transform duration-500 group-hover:scale-105">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ImageIcon size={20} className="text-primary" />
                      </div>
                      <p className="px-2 text-xs text-muted-foreground">
                        {facility.image}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Title overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h4 className="text-sm font-medium text-white">
                    {facility.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
