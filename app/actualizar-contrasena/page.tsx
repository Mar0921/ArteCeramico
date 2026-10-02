"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

type Estado = "verificando" | "listo" | "invalido" | "exito"

const MIN_PASSWORD = 8

export default function ActualizarContrasenaPage() {
  const [estado, setEstado] = useState<Estado>("verificando")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const marcarListo = () => {
      if (cancelled || readyRef.current) return
      readyRef.current = true
      setEstado("listo")
    }

    const marcarInvalido = () => {
      if (cancelled || readyRef.current) return
      setEstado("invalido")
    }

    // El enlace puede venir con el error ya en el hash (otp_expired, etc.).
    const hash = window.location.hash || ""
    if (
      hash.includes("error_code=") ||
      hash.includes("error_description=")
    ) {
      marcarInvalido()
      return
    }

    // detectSessionInUrl procesa el token del enlace de forma asíncrona:
    // puede llegar como evento PASSWORD_RECOVERY o como sesión ya activa.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          marcarListo()
        }
      }
    )

    const verificar = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          marcarListo()
          return
        }

        // Si el token no llegó por sesión ni por evento, el enlace no es válido.
        window.setTimeout(() => {
          if (!readyRef.current) {
            marcarInvalido()
          }
        }, 3000)
      } catch {
        marcarInvalido()
      }
    }

    verificar()

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        throw updateError
      }

      setEstado("exito")
      await supabase.auth.signOut({ scope: "local" }).catch(() => {})
    } catch (err: any) {
      setError(
        err?.message || "No fue posible actualizar la contraseña. Solicita un nuevo enlace."
      )
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (estado === "verificando") {
      return (
        <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-lg">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verificando tu enlace de recuperación...
          </p>
        </div>
      )
    }

    if (estado === "invalido") {
      return (
        <div className="rounded-2xl bg-card p-6 shadow-lg sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertCircle size={28} className="text-red-600" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">
              Enlace inválido o expirado
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Los enlaces de recuperación tienen una vigencia limitada y solo
              pueden usarse una vez. Solicita uno nuevo para continuar.
            </p>
          </div>

          <Link
            href="/recuperar-contrasena"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-dark"
          >
            <KeyRound size={18} />
            Solicitar nuevo enlace
          </Link>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      )
    }

    if (estado === "exito") {
      return (
        <div className="rounded-2xl bg-card p-6 shadow-lg sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">
              Contraseña actualizada
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu contraseña se cambió correctamente. Ya puedes iniciar sesión con
              tu nueva contraseña.
            </p>
          </div>

          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-dark"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      )
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-card p-6 shadow-lg sm:p-8"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Nueva Contraseña
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock size={18} className="text-muted-foreground" />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Confirmar Contraseña
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock size={18} className="text-muted-foreground" />
              </div>

              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {loading ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="p-4 sm:p-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center">
              <Image
                src="/Arte_Ceramico_Logo.svg"
                alt="Arte Cerámico"
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-muted-foreground">
              Elige una contraseña segura para tu cuenta
            </p>
          </div>

          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}
