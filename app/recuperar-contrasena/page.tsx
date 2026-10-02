"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError("Ingresa tu correo electrónico")
      return
    }

    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/actualizar-contrasena`,
        }
      )

      if (resetError) {
        throw resetError
      }

      setSentTo(normalizedEmail)
    } catch (err: any) {
      setError(err?.message || "No fue posible enviar el correo de recuperación")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setSentTo(null)
    setError(null)
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
              Recuperar contraseña
            </h1>
            <p className="mt-2 text-muted-foreground">
              {sentTo
                ? "Revisa tu correo para continuar"
                : "Te enviaremos un enlace para crear una nueva contraseña"}
            </p>
          </div>

          {sentTo ? (
            <div className="rounded-2xl bg-card p-6 shadow-lg sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Enviamos un enlace de recuperación a
                </p>
                <p className="mt-1 font-semibold text-foreground break-all">
                  {sentTo}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Revisa tu bandeja de entrada y la carpeta de spam. El enlace
                  expira por seguridad, así que úsalo lo antes posible.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
                >
                  <RotateCcw size={16} />
                  Usar otro correo
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-dark"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-card p-6 shadow-lg sm:p-8"
            >
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
                      autoComplete="email"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Usa el mismo correo con el que te registraste en Arte Cerámico.
                  </p>
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
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <Send size={18} />
                  {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Iniciar sesión
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
