"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Users,
  Package,
  CheckCircle,
  Clock,
  FileText,
  Database,
  Search,
  LayoutDashboard,
  X,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    label: "Productos",
    href: "/dashboard/productos",
    icon: Package,
  },
  {
    label: "Aprobados",
    href: "/dashboard/aprobados",
    icon: CheckCircle,
  },
  {
    label: "Pre-aprobados",
    href: "/dashboard/preaprobados",
    icon: Clock,
  },
  {
    label: "Facturas",
    href: "/dashboard/facturas",
    icon: FileText,
  },
  {
    label: "Base de Datos",
    href: "/dashboard/base-datos",
    icon: Database,
  },
  {
    label: "Búsqueda",
    href: "/dashboard/busqueda",
    icon: Search,
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl lg:relative lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex h-full flex-col">
           {/* Header */}
           <div className="flex h-16 items-center justify-between border-b border-border px-4">
             <Link href="/dashboard" className="flex items-center gap-2">
               <div className="relative h-10 w-auto">
                 <Image
                   src="/Arte_Ceramico_Logo.svg"
                   alt="Arte Cerámico - Laboratorio Dental"
                   width={120}
                   height={48}
                   className="h-10 w-auto object-contain"
                   priority
                 />
               </div>
             </Link>
             <button
               onClick={onClose}
               className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
             >
               <X size={20} />
             </button>
           </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut size={18} />
              Salir del Panel
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
