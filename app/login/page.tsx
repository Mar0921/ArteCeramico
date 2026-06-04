"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
     setError(null)
     
      try {
        // Query the clientes table for a record with matching email and password
        const { data, error: supabaseError } = await supabase
          .from('clientes')
          .select('*')
          .eq('correo', email)
          .eq('contraseña', password)
          .single()
        
        if (supabaseError) {
          // Handle specific error cases
          if (supabaseError.code === 'PGRST116') {
            // No rows found
            throw new Error('Email o contraseña incorrectos')
          }
          throw supabaseError
        }
        
        if (!data) {
          throw new Error('Email o contraseña incorrectos')
        }
        
        // Set login state
        sessionStorage.setItem('clienteEmail', email)
        localStorage.setItem('isLoggedIn', 'true')
        
        // Check if we came from formulario (purchase flow)
        const redirect = searchParams.get('redirect')
        if (redirect === 'formulario') {
          // Redirect back to formulario
          router.push('/formulario')
        } else {
          // Redirect to client dashboard
          router.push('/page_clientes')
        }
      } catch (err: any) {
       setError(err.message || 'Error al iniciar sesión')
     } finally {
       setLoading(false)
     }
   }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      
      {/* Back Link */}
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
          
          {/* LOGO */}
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

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-card p-6 shadow-lg sm:p-8"
          >
            <div className="space-y-5">

              {/* EMAIL */}
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

              {/* PASSWORD */}
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

               {/* FORGOT */}
               <div className="flex justify-end">
                 <a
                   href="#"
                   className="text-sm font-medium text-primary hover:text-primary-dark"
                 >
                   ¿Olvidaste tu contraseña?
                 </a>
               </div>

                 {/* ERROR MESSAGE */}
                 {error && (
                   <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                     {error}
                   </div>
                 )}

                 {/* BUTTON */}
               <button
                 type="submit"
                 disabled={loading}
                 className={`w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl ${
                   loading ? 'opacity-50 cursor-not-allowed' : ''
                 }`}
               >
                 {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
               </button>
            </div>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* REGISTER */}
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

          {/* ADMIN */}
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
    </div>
  )
}
