"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PrescriptionForm } from "@/app/formulario/components/prescription-form"
import { Navbar } from "@/components/navbar"

export default function FormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const isLoggedIn = sessionStorage.getItem("clienteEmail") || localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/login?redirect=formulario")
    }
  }, [router, mounted])

  if (!mounted) return null

  return (
    <>
      <Navbar />
      <main id="formulario" className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4 pt-20">
        <PrescriptionForm 
          servicio={searchParams.get("servicio") || ""}
          tipoServicio={searchParams.get("tipoServicio") || ""}
          tipoTrabajo={searchParams.get("tipoTrabajo")?.split(",").filter(Boolean) || []}
          material={searchParams.get("material")?.split(",").filter(Boolean) || []}
        />
      </main>
    </>
  )
}
