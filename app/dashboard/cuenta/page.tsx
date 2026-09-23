"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, LogOut, Mail, Shield, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AdminProfile {
  id: number
  user_id: string
  nombre: string
  email: string
  activo: boolean
  created_at: string
}

export default function CuentaPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/admin/login")
        return
      }

      const { data, error } = await supabase
        .from("admins")
        .select("id, user_id, nombre, email, activo, created_at")
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        setError("No se pudo cargar la cuenta administrativa.")
      } else {
        setAdmin(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !admin) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={18} />
          Error al cargar la cuenta
        </div>
        <p className="mt-2 text-sm opacity-80">{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Volver al panel
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuenta administrativa</h1>
          <p className="mt-1 text-muted-foreground">
            Administra la información de acceso y sesión del panel.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Volver al panel
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-foreground">{admin.nombre || "Administrador"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700">
                  <Shield size={13} />
                  Cuenta activa
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <User size={13} />
                  Acceso administrativo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Datos de la cuenta</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-foreground">
                <Mail size={15} />
                {admin.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Identificador</dt>
              <dd className="mt-1 break-words font-medium text-foreground">#{admin.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Fecha de creación</dt>
              <dd className="mt-1 font-medium text-foreground">
                {new Date(admin.created_at).toLocaleDateString("es-CO")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
