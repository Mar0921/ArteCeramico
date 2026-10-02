"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Bell, User, LogOut, LayoutDashboard, Package, Calendar, CheckCircle, Users, FileText, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const empleadoNavItems = [
  { label: "Inicio", href: "/empleados/dashboard", icon: LayoutDashboard },
  { label: "Mis Trabajos", href: "/empleados/dashboard/trabajos", icon: Package },
  { label: "Solicitudes", href: "/empleados/dashboard/solicitudes", icon: FileText },
  { label: "Clientes", href: "/empleados/dashboard/clientes", icon: Users },
  { label: "Calendario", href: "/empleados/dashboard/calendario", icon: Calendar },
  { label: "Mis Fases", href: "/empleados/dashboard/fases", icon: CheckCircle },
]

export function EmpleadoNavbar({
  empleado,
}: {
  empleado: any
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto"
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/empleados/login")
  }

  return (
    <>
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
            <Link href="/empleados/dashboard" className="flex items-center">
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

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/empleados/dashboard/solicitudes/nueva"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
              >
                <Plus size={16} />
                Nueva solicitud
              </Link>

              {empleadoNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-card px-3 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-lg p-2 text-foreground transition-colors hover:bg-blue-500/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-medium text-sm">
                    {empleado?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block font-medium">{empleado?.nombre}</span>
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-card px-3 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:border-red-500 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>

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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-card/95 backdrop-blur-md shadow-lg lg:hidden"
          >
            <div className="flex flex-col px-4 py-6">
              <Link
                href="/empleados/dashboard/solicitudes/nueva"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white transition-all duration-300 hover:bg-blue-700"
              >
                <Plus size={18} />
                Nueva solicitud
              </Link>

              {empleadoNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-card px-4 py-3 text-left text-base font-medium text-foreground transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}

              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-card px-5 py-3 text-center text-base font-medium text-red-600 transition-all duration-300 hover:border-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}