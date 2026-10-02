"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Shield, UserCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

type Rol = "cliente" | "admin" | "empleado"

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
  const [rol, setRol] = useState<Rol>("cliente")
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect")
      if (redirect === "formulario") {
        setRedirectUrl("/formulario")
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
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

  const handleLoginSuccess = async (authData: { user: { id: string; email?: string | null } }) => {
    if (rol === "admin") {
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", authData.user.id)
        .eq("activo", true)
        .single()

      if (adminError || !admin) {
        await supabase.auth.signOut()
        throw new Error("No tienes acceso de administrador")
      }

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("rol", "admin")
      router.push("/dashboard")
      return
    }

    if (rol === "empleado") {
      const { data: empleado, error: empleadoError } = await supabase
        .from("empleados")
        .select("*")
        .eq("user_id", authData.user.id)
        .eq("activo", true)
        .single()

      if (empleadoError || !empleado) {
        await supabase.auth.signOut()
        throw new Error("No tienes acceso de empleado o tu cuenta está inactiva")
      }

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("rol", "empleado")
      router.push("/empleados/dashboard")
      return
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

    if (redirectUrl) {
      router.push(redirectUrl)
    } else {
      router.push("/page_clientes")
    }
  }

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

      if (authError) {
        throw authError
      }

      await handleLoginSuccess(authData)
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

      await handleLoginSuccess(authData)
      setExistingEmail(authData.user.email ?? null)
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = {
    cliente: {
      title: "Iniciar Sesión",
      description: "Accede al portal de clientes de Arte Cerámico",
      submitBg: "bg-primary",
      submitHover: "hover:bg-primary-dark",
      accent: null as null,
    },
    admin: {
      title: "Acceso Administrativo",
      description: "Ingresa al panel de administración de Arte Cerámico",
      submitBg: "bg-primary",
      submitHover: "hover:bg-primary-dark",
      accent: (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Shield size={14} />
          Administrador
        </div>
      ),
    },
    empleado: {
      title: "Acceso Empleado",
      description: "Ingresa al panel de trabajo de Arte Cerámico",
      submitBg: "bg-blue-600",
      submitHover: "hover:bg-blue-700",
      accent: (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
          <UserCheck size={14} />
          Empleado
        </div>
      ),
    },
  }

  const cfg = roleConfig[rol]

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

            {cfg.accent}

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              {cfg.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {cfg.description}
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

              <div className="flex justify-between items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowRoleSelector((v) => !v)}
                  className={`text-sm font-medium text-primary hover:text-primary-dark underline offset-1 decoration-primary/30`}
                >
                  ¿Eres parte de Arte Cerámico?
                </button>

                <Link
                  href="/recuperar-contrasena"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <AnimatePresence initial={false}>
                {showRoleSelector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRol("admin")
                          setShowRoleSelector(false)
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20`}
                      >
                        <Shield size={16} />
                        Administrador
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRol("empleado")
                          setShowRoleSelector(false)
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-500/20`}
                      >
                        <UserCheck size={16} />
                        Empleado
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRol("cliente")
                        setShowRoleSelector(false)
                      }}
                      className="mt-2 w-full rounded-xl border border-border bg-card/50 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted"
                    >
                      Continuar como cliente
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl ${cfg.submitBg} py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] ${cfg.submitHover} hover:shadow-xl ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Iniciando sesión..." : cfg.title}
              </button>
            </div>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {rol === "cliente" && (
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Regístrate
                </Link>
              </p>
            )}
          </form>
        </motion.div>
      </div>

      {showSessionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Sesión activa detectada
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tienes una sesión abierta como{" "}
              <span className="font-semibold text-foreground">{existingEmail}</span>.
              ¿Deseas cerrarla y continuar con la cuenta{" "}
              <span className="font-semibold text-foreground">{pendingEmail}</span>?
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
