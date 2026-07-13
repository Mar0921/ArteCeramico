"use client"

import { useState } from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  MessageCircle,
  Send,
  X,
} from "lucide-react"

interface Message {
  id: number
  text: string
  isBot: boolean
}

const initialMessages: Message[] =
  [
    {
      id: 1,
      text: "Hola! Soy el asistente virtual de Arte Cerámico. Preguntame por nuestros servicios y precios actualizados.",
      isBot: true,
    },
  ]

export function Chatbot() {
  const [isOpen, setIsOpen] =
    useState(false)

  const [messages, setMessages] =
    useState<Message[]>(
      initialMessages
    )

  const [inputValue, setInputValue] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const handleSend =
    async () => {
      if (!inputValue.trim())
        return

      const userMessage: Message =
        {
          id: Date.now(),
          text: inputValue,
          isBot: false,
        }

      setMessages((prev) => [
        ...prev,
        userMessage,
      ])

      const currentMessage =
        inputValue

      setInputValue("")
      setLoading(true)

      try {
        const response =
          await fetch(
            "/api/assistant/chat",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                message:
                  currentMessage,
              }),
            }
          )

        const data =
          await response.json()

        const botMessage: Message =
          {
            id: Date.now() + 1,
            text:
              data.response,
            isBot: true,
          }

        setMessages((prev) => [
          ...prev,
          botMessage,
        ])
      } catch (error) {
        console.error(error)

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Ocurrió un error.",
            isBot: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

  return (
    <>
      <motion.button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle
            size={24}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className="fixed bottom-40 right-4 z-50 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* HEADER */}
            <div className="bg-primary p-4 text-white">
              <div className="flex items-center gap-3">
                <MessageCircle
                  size={20}
                />

                <div>
                  <h3 className="font-semibold">
                    Arte Cerámico
                  </h3>

                  <p className="text-xs opacity-80">
                    Asistente Virtual
                  </p>
                </div>
              </div>
            </div>

            {/* MENSAJES */}
            <div className="h-80 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map(
                  (message) => (
                    <div
                      key={
                        message.id
                      }
                      className={`flex ${
                        message.isBot
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.isBot
                            ? "bg-gray-100 text-black"
                            : "bg-primary text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line break-words">
                          {message.text
                            .split(
                              /(https?:\/\/[^\s]+)/g
                            )
                            .map(
                              (
                                part,
                                index
                              ) => {
                                const isLink =
                                  part.startsWith(
                                    "http://"
                                  ) ||
                                  part.startsWith(
                                    "https://"
                                  )

                                if (
                                  isLink
                                ) {
                                  return (
                                    <a
                                      key={
                                        index
                                      }
                                      href={
                                        part
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`underline break-all ${
                                        message.isBot
                                          ? "text-blue-600"
                                          : "text-white"
                                      }`}
                                    >
                                      {
                                        part
                                      }
                                    </a>
                                  )
                                }

                                return (
                                  <span
                                    key={
                                      index
                                    }
                                  >
                                    {
                                      part
                                    }
                                  </span>
                                )
                              }
                            )}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {loading && (
                  <div className="text-sm text-gray-500">
                    Escribiendo...
                  </div>
                )}
              </div>
            </div>

            {/* INPUT */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={
                    inputValue
                  }
                  onChange={(e) =>
                    setInputValue(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    e.key ===
                      "Enter" &&
                    handleSend()
                  }
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none"
                />

                <button
                  onClick={
                    handleSend
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}