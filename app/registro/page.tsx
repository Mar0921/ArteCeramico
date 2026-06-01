"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  FileText,
  ChevronDown,
} from "lucide-react"

const documentTypes = [
  { value: "cc", label: "Cédula de Ciudadanía" },
  { value: "ce", label: "Cédula de Extranjería" },
  { value: "nit", label: "NIT" },
  { value: "pasaporte", label: "Pasaporte" },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    documentType: "",
    documentNumber: "",
    email: "",
    phone: "",
    clinic: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register attempt:", formData)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      
      {/* BACK */}
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
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
            <Link href="/" className="inline-flex justify-center">
              <Image
                src="/Arte_Ceramico_Logo.svg"
                alt="Arte Cerámico"
                width={220}
                height={90}
                className="h-16 sm:h-18 w-auto object-contain"
                priority
              />
            </Link>

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Crear Cuenta
            </h1>

            <p className="mt-2 text-muted-foreground">
              Regístrate en el portal de Arte Cerámico
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-card p-6 shadow-lg sm:p-8"
          >
            <div className="space-y-4">

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User size={18} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4"
                    required
                  />
                </div>
              </div>

              {/* DOCUMENT */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tipo de Documento
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FileText size={18} className="text-muted-foreground" />
                    </div>

                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-11 pr-10"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Número
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background py-3 px-4"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-muted-foreground" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4"
                  required
                />
              </div>

              {/* PHONE */}
              <div className="relative">
                <Phone className="absolute left-4 top-3 text-muted-foreground" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4"
                  required
                />
              </div>

              {/* CLINIC */}
              <div className="relative">
                <Building2 className="absolute left-4 top-3 text-muted-foreground" size={18} />
                <input
                  type="text"
                  name="clinic"
                  value={formData.clinic}
                  onChange={handleChange}
                  placeholder="Clínica"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-muted-foreground" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* CONFIRM */}
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-muted-foreground" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar contraseña"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-3"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* BUTTON */}
              <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
                Crear Cuenta
              </button>
            </div>

            {/* LOGIN */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}