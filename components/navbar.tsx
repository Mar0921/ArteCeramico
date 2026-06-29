"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, LogOut, Users, User, Bell } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Portafolio", href: "#portafolio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
]

export function Navbar({
  showClientButtons = false,
  notificaciones = [],
  notificacionesCount = 0,
  notificacionesOpen = false,
  setNotificacionesOpen,
  onAbrirNotificacion,
  onMarcarTodasLeidas,
}: {
  showClientButtons?: boolean
  notificaciones?: any[]
  notificacionesCount?: number
  notificacionesOpen?: boolean
  setNotificacionesOpen?: (open: boolean) => void
  onAbrirNotificacion?: (notificacion: any) => void
  onMarcarTodasLeidas?: () => void
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const notifRef = useRef<HTMLDivElement>(null)

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
    const checkLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkLogin()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkLogin()
    })
    return () => subscription.unsubscribe()
  }, [])

  // Bloquear scroll cuando menú está abierto
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto"
  }, [isMobileMenuOpen])

  // Cerrar panel de notificaciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificacionesOpen?.(false)
      }
    }
    if (notificacionesOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notificacionesOpen])

  // Navegación con scroll o redirección
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const isHomePage = window.location.pathname === "/"

    if (isHomePage) {
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
    } else {
      window.location.href = href === "#inicio" ? "/" : `/${href}`
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const sinLeer = notificaciones.filter((n) => !n.vista).length

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

            {/* NOTIFICATIONS - Solo para clientes */}
            {!showClientButtons && isLoggedIn && setNotificacionesOpen && (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setNotificacionesOpen(!notificacionesOpen)}
                  className="relative rounded-lg p-2 text-foreground transition-colors hover:bg-primary/10"
                >
                  <Bell size={20} />
                  {sinLeer > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white px-1">
                      {sinLeer}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* AUTH BUTTONS - Desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              {showClientButtons ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                  >
                    <User size={16} />
                    Cuenta
                  </Link>
                  <Link
                    href="/dashboard/clientes"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                  >
                    <Users size={16} />
                    Clientes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-500/20"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </>
              ) : isLoggedIn ? (
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

      {/* NOTIFICATIONS PANEL */}
      <AnimatePresence>
        {notificacionesOpen && (
          <motion.div
            ref={notifRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-4 top-16 z-[60] mt-2 w-80 rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Notificaciones</h3>
              {notificaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay notificaciones</p>
              ) : (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {notificaciones.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onAbrirNotificacion?.(n)}
                      className={`w-full rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                        !n.vista ? "bg-primary/5" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.contenido}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {onMarcarTodasLeidas && (
                <button
                  onClick={onMarcarTodasLeidas}
                  className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {showClientButtons ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 text-center text-base font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                      >
                        <User size={18} />
                        Cuenta
                      </Link>
                      <Link
                        href="/dashboard/clientes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 text-center text-base font-medium text-primary transition-all duration-300 hover:bg-primary/10"
                      >
                        <Users size={18} />
                        Clientes
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleLogout()
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-3 text-center text-base font-medium text-red-600 transition-all duration-300 hover:bg-red-500/20"
                      >
                        <LogOut size={18} />
                        Cerrar Sesión
                      </button>
                    </>
                  ) : isLoggedIn ? (
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