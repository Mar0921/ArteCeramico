"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import {
  User,
  LogOut,
  MessageSquare,
  Package,
  Send,
  X,
  Loader2,
} from "lucide-react"

interface Cliente {
  id?: number
  nombre: string
  tipo: string
  documento: string
  correo: string
  telefono: string
  clinica: string
  created_at: string
}

interface Message {
  id: number
  text: string
  isBot: boolean
}

export default function ClientesPage() {
  const router = useRouter()

  const [clientData, setClientData] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [chatOpen, setChatOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy el asistente virtual de Arte Cerámico. ¿En qué puedo ayudarte hoy?",
      isBot: true,
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true)

        const storedEmail = sessionStorage.getItem("clienteEmail")

        let email = storedEmail

        if (!email) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser()

          if (error) throw error

          email = user?.email || null
        }

        if (!email) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("correo", email)
          .single()

        if (error) throw error

        setClientData(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error cargando datos"
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()

      sessionStorage.removeItem("clienteEmail")
      localStorage.removeItem("isLoggedIn")

      router.push("/")
    } catch {
      setError("Error al cerrar sesión")
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatLoading) return

    const text = inputValue.trim()

    const userMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
    }

    setMessages((prev) => [...prev, userMessage])

    setInputValue("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en el servidor")
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.response,
          isBot: true,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Ocurrió un error al enviar el mensaje.",
          isBot: true,
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !clientData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Error
          </h2>

          <p className="text-red-400">
            {error || "No se encontraron datos"}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02]"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-3">
              <User className="text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Panel Cliente
              </h1>

              <p className="text-sm text-muted-foreground">
                Bienvenido, {clientData.nombre}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        {/* INFO CARD */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <User className="text-primary" size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Información del Cliente
              </h2>

              <p className="text-sm text-muted-foreground">
                Datos registrados en el sistema
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Tipo de Documento"
              value={clientData.tipo}
            />

            <InfoItem
              label="Número de Documento"
              value={clientData.documento}
            />

            <InfoItem
              label="Correo Electrónico"
              value={clientData.correo}
            />

            <InfoItem
              label="Teléfono"
              value={clientData.telefono}
            />

            <InfoItem
              label="Clínica"
              value={clientData.clinica}
            />

            <InfoItem
              label="Fecha de Registro"
              value={new Date(
                clientData.created_at
              ).toLocaleDateString()}
            />
          </div>
        </section>

        {/* PRODUCTOS */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Package className="text-primary" size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Productos Activos
              </h2>

              <p className="text-sm text-muted-foreground">
                Servicios asociados a tu cuenta
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6">
            <p className="text-sm font-medium text-foreground">
              Sin productos activos
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Aún no tienes productos o servicios registrados.
            </p>
          </div>
        </section>

        {/* CHAT */}
        <section className="rounded-3xl border border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <MessageSquare className="text-primary" size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Asistente Virtual
                </h2>

                <p className="text-sm text-muted-foreground">
                  Consulta información, precios y servicios.
                </p>
              </div>
            </div>

            <button
              onClick={() => setChatOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02]"
            >
              {chatOpen ? (
                <>
                  <X size={16} />
                  Cerrar
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Abrir Chat
                </>
              )}
            </button>
          </div>

          {chatOpen && (
            <div className="flex h-[500px] flex-col">
              {/* MENSAJES */}
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isBot
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm shadow-lg ${
                        message.isBot
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                    Escribiendo...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {chatLoading ? (
                      <Loader2
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-lg font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}
