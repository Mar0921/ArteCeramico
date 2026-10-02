"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { EmpleadoNavbar } from "@/components/empleados/navbar"
import { EmpleadoSidebar } from "@/components/empleados/sidebar"

export default function EmpleadoDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [empleado, setEmpleado] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkEmpleado = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/empleados/login")
        return
      }

      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .eq("user_id", user.id)
        .eq("activo", true)
        .single()

      if (error || !data) {
        await supabase.auth.signOut()
        router.push("/empleados/login")
        return
      }

      setEmpleado(data)
      setAuthorized(true)
    }

    checkEmpleado()
  }, [router])

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <EmpleadoNavbar empleado={empleado} showClientButtons={false} />
      <EmpleadoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} empleado={empleado} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="ml-4 font-semibold text-foreground">Panel Empleado</span>
        </div>
        <main className="flex-1 w-full px-4 lg:px-6 lg:pb-6 pt-8">{children}</main>
      </div>
    </div>
  )
}