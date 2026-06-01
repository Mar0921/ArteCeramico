"use client"

import { motion } from "framer-motion"
import { MapPin, Navigation, Clock, ExternalLink } from "lucide-react"

export function MapSection() {
  const address = "Cra 42a # 5c -36, Cali, Valle del Cauca, Colombia"
  const googleMapsUrl = `https://maps.app.goo.gl/NY7w9hcY48P59soH9`

  return (
    <section id="ubicacion" className="bg-background py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-primary-dark">
            Ubicación
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Encuéntranos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Visítanos en nuestro laboratorio o contáctanos para coordinar una
            visita.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Address Card */}
            <div className="rounded-2xl bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={20} />
                </div>
                <h3 className="font-semibold text-foreground">Dirección</h3>
              </div>
              <p className="text-muted-foreground">
                Cra 42a # 5c -36
                <br />
                Cali, Valle del Cauca
                <br />
                Colombia
              </p>
            </div>

            {/* Hours Card */}
            <div className="rounded-2xl bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock size={20} />
                </div>
                <h3 className="font-semibold text-foreground">Horario</h3>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Lunes - Viernes</span>
                  <span className="font-medium text-foreground">
                    8:00 - 18:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <span className="font-medium text-foreground">
                    8:00 - 13:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="font-medium text-foreground">Cerrado</span>
                </div>
              </div>
            </div>

            {/* Directions Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl"
            >
              <Navigation size={18} />
              Abrir en Google Maps
              <ExternalLink size={16} />
            </a>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.7384!2d-76.5320!3d3.4372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a6d7c3a9b1%3A0x1234567890abcdef!2sCra%2042a%20%23%205c-36%2C%20Cali%2C%20Valle%20del%20Cauca%2C%20Colombia!5e0!3m2!1ses!2sco!4v1699999999999"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[300px] w-full sm:h-[400px] lg:h-[450px]"
                title="Ubicación de Laboratorio Dental Arte Cerámico"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
