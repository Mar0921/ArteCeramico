"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Portafolio", href: "#portafolio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Verificar si el usuario está logueado
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = sessionStorage.getItem("clienteEmail") || localStorage.getItem("isLoggedIn")
      setIsLoggedIn(!!loggedIn)
    }
    checkLogin()
    window.addEventListener("storage", checkLogin)
    window.addEventListener("loginStateChange", checkLogin)
    return () => {
      window.removeEventListener("storage", checkLogin)
      window.removeEventListener("loginStateChange", checkLogin)
    }
  }, [])

  // Bloquear scroll cuando menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto"
  }, [isMobileMenuOpen])

  // Scroll con offset (para navbar fijo)
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)

    if (element) {
      const offset = 80
      const top =
        element.getBoundingClientRect().top + window.scrollY - offset

      window.scrollTo({
        top,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-card/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-auto">
                <Image
                  src="/Arte_Ceramico_Logo.svg"
                  alt="Arte Cerámico - Laboratorio Dental"
                  width={120}
                  height={48}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* AUTH BUTTONS - Desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              {isLoggedIn ? (
                <Link
                  href="/page_clientes"
                  className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                >
                  Mi Cuenta
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                  >
                    Registrarse
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-dark hover:shadow-lg"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-card/95 backdrop-blur-md shadow-lg lg:hidden"
          >
            <div className="flex flex-col px-4 py-6">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="rounded-lg px-4 py-3 text-left text-base font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </button>
              ))}

              <div className="mt-4 flex flex-col gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/page_clientes"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-lg border border-primary px-5 py-3 text-center text-base font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                  >
                    Mi Cuenta
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/registro"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg border border-primary px-5 py-3 text-center text-base font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                    >
                      Registrarse
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg bg-primary px-5 py-3 text-center text-base font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-dark"
                    >
                      Iniciar Sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}