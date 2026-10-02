"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, LayoutDashboard, Package, Calendar, CheckCircle, ChevronRight, User, FileText, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const empleadoNavItems = [
  { label: "Inicio", href: "/empleados/dashboard", icon: LayoutDashboard },
  { label: "Mis Trabajos", href: "/empleados/dashboard/trabajos", icon: Package },
  { label: "Solicitudes", href: "/empleados/dashboard/solicitudes", icon: FileText },
  { label: "Clientes", href: "/empleados/dashboard/clientes", icon: Users },
  { label: "Calendario", href: "/empleados/dashboard/calendario", icon: Calendar },
  { label: "Mis Fases", href: "/empleados/dashboard/fases", icon: CheckCircle },
]

interface EmpleadoSidebarProps {
  isOpen: boolean
  onClose: () => void
  empleado: any
}

export function EmpleadoSidebar({ isOpen, onClose, empleado }: EmpleadoSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:translate-x-0"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
                <span className="font-semibold text-foreground">Panel Empleado</span>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {empleadoNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "text-foreground hover:bg-blue-500/10 hover:text-blue-600"
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-medium">
                      {empleado?.nombre?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm text-foreground">{empleado?.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{empleado?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 px-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <User size={10} />
                      {empleado?.rol || "Empleado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-medium">
                    {empleado?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm text-foreground">{empleado?.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{empleado?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}