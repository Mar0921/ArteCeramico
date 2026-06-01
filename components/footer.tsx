"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin } from "lucide-react"

const footerLinks = {
  servicios: [
    { label: "Coronas Cerámicas", href: "#servicios" },
    { label: "Prótesis Dentales", href: "#servicios" },
    { label: "Carillas", href: "#servicios" },
    { label: "Diseño Digital", href: "#servicios" },
  ],
  empresa: [
    { label: "Sobre Nosotros", href: "#nosotros" },
    { label: "Preguntas Frecuentes", href: "#faq" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Contacto", href: "#contacto" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* LOGO + DESCRIPCIÓN */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/Arte_Ceramico_Logo_Blanco.svg"
                alt="Arte Cerámico"
                width={160}
                height={60}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>

            <p className="mt-4 text-sm text-background/70">
              Laboratorio Dental Arte Cerámico - Más de 10 años transformando
              sonrisas con excelencia y tecnología de vanguardia.
            </p>

            {/* REDES SOCIALES */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* SERVICIOS */}
          <div>
            <h3 className="mb-4 font-semibold">Servicios</h3>
            <ul className="space-y-3">
              {footerLinks.servicios.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* EMPRESA */}
          <div>
            <h3 className="mb-4 font-semibold">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h3 className="mb-4 font-semibold">Contacto</h3>
            <ul className="space-y-3 text-sm text-background/70">
              <li>Cra 42a # 5c -36</li>
              <li>Cali, Valle del Cauca</li>
              <li>Colombia</li>
              <li className="pt-2">
                <a
                  href="tel:3177280804"
                  className="transition-colors hover:text-primary"
                >
                  3177280804
                </a>
              </li>
              <li>
                <a
                  href="mailto:lab-arteceramico@hotmail.com"
                  className="transition-colors hover:text-primary"
                >
                  lab-arteceramico@hotmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/573177280804"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  WhatsApp: 3177280804
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BARRA INFERIOR */}
        <div className="mt-12 border-t border-background/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} Laboratorio Dental Arte Cerámico.
              Todos los derechos reservados.
            </p>

            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-background/50 transition-colors hover:text-primary"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-sm text-background/50 transition-colors hover:text-primary"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}