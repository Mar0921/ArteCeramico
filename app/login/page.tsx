"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [existingEmail, setExistingEmail] = useState<string | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingPassword, setPendingPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect === 'formulario') {
        setRedirectUrl('/formulario')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setExistingEmail(session.user.email)
        }
      } catch {
        // ignore
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedExisting = existingEmail?.trim().toLowerCase()

      if (normalizedExisting && normalizedExisting !== normalizedEmail) {
        setPendingEmail(email)
        setPendingPassword(password)
        setShowSessionWarning(true)
        setLoading(false)
        return
      }

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      console.log("AUTH DATA:", authData)
      console.log("AUTH ERROR:", authError)

      if (authError) {
        throw authError
      }
      // Buscar cliente asociado
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", authData.user.id)
        .single()

      if (clienteError || !cliente) {
        throw new Error("Cliente no encontrado")
      }

// Guardar sesión
      sessionStorage.setItem("clienteId", String(cliente.id))
      localStorage.setItem("isLoggedIn", "true")

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/page_clientes")
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const confirmSwitchAccount = async () => {
    setShowSessionWarning(false)
    setLoading(true)
    setError(null)

    try {
      await supabase.auth.signOut()
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: pendingEmail,
          password: pendingPassword,
        })

      if (authError) {
        throw authError
      }

      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", authData.user.id)
        .single()

      if (clienteError || !cliente) {
        throw new Error("Cliente no encontrado")
      }

      sessionStorage.setItem("clienteId", String(cliente.id))
      localStorage.setItem("isLoggedIn", "true")
      setExistingEmail(authData.user.email)

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/page_clientes")
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Volver al inicio
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
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-muted-foreground">
              Accede al portal de clientes de Arte Cerámico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-lg sm:p-8">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Correo Electrónico
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail size={18} className="text-muted-foreground" />
                  </div>

                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Contraseña
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Regístrate
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Para acceso de administrador,{" "}
            <Link
              href="/dashboard"
              className="font-medium text-primary hover:text-primary-dark"
            >
              ir al panel de administración
            </Link>
          </p>
        </motion.div>
      </div>

      {showSessionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Sesión activa detectada
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tienes una sesión abierta como <span className="font-semibold text-foreground">{existingEmail}</span>.
              ¿Deseas cerrarla y continuar con la cuenta <span className="font-semibold text-foreground">{pendingEmail}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSessionWarning(false)
                  setLoading(false)
                }}
                className="rounded-xl border border-border bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
              >
                Continuar con la misma cuenta
              </button>
              <button
                onClick={confirmSwitchAccount}
                disabled={loading}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Cambiando..." : "Cerrar sesión anterior y continuar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}