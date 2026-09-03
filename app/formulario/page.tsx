"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PrescriptionForm } from "@/app/formulario/components/prescription-form"
import { Navbar } from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"

function FormContent() {
  const searchParams = useSearchParams()

  return (
    <PrescriptionForm
      servicio={searchParams.get("servicio") || ""}
      tipoServicio={searchParams.get("tipoServicio") || ""}
      tipoTrabajo={searchParams.get("tipoTrabajo")?.split(",").filter(Boolean) || []}
      material={searchParams.get("material")?.split(",").filter(Boolean) || []}
    />
  )
}

export default function FormPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=formulario")
      }
    }
    checkAuth()
  }, [router, mounted])

  if (!mounted) return null

  return (
    <>
      <Navbar />
      <main id="formulario" className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4 pt-20">
        <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]"><p>Cargando formulario...</p></div>}>
          <FormContent />
        </Suspense>
        <footer className="text-center mt-8 text-sm text-muted-foreground max-w-3xl mx-auto">
          La prescripción del dispositivo médico sobre medida bucal vence en seis (6) meses. Una vez transcurrido este tiempo, y al no haber concluido el trabajo, es necesario una nueva valoración del paciente y con fundamento a lo cual se determinará iniciar nuevamente el proceso de fabricación.
        </footer>
      </main>
    </>
  )
}
