"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PrescriptionForm } from "@/app/formulario/components/prescription-form"
import { Navbar } from "@/components/navbar"

export default function FormPage() {
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("clienteEmail") || localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/login?redirect=formulario")
    }
  }, [router])

  return (
    <>
      <Navbar />
      <main id="formulario" className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4 pt-20">
        <PrescriptionForm />
      </main>
    </>
  )
}
