"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from "lucide-react"

const clients = [
  {
    id: 1,
    name: "Clínica Dental Sonrisa",
    email: "contacto@sonrisa.com",
    phone: "+57 300 123 4567",
    orders: 45,
    status: "Activo",
    totalSpent: "$15,200,000",
  },
  {
    id: 2,
    name: "Dr. Juan García",
    email: "jgarcia@email.com",
    phone: "+57 301 234 5678",
    orders: 28,
    status: "Activo",
    totalSpent: "$8,500,000",
  },
  {
    id: 3,
    name: "Centro Odontológico Elite",
    email: "info@elite.com",
    phone: "+57 302 345 6789",
    orders: 62,
    status: "Activo",
    totalSpent: "$22,800,000",
  },
  {
    id: 4,
    name: "Dra. María López",
    email: "mlopez@dental.com",
    phone: "+57 303 456 7890",
    orders: 15,
    status: "Inactivo",
    totalSpent: "$4,200,000",
  },
  {
    id: 5,
    name: "Clínica Dental Norte",
    email: "norte@clinica.com",
    phone: "+57 304 567 8901",
    orders: 38,
    status: "Activo",
    totalSpent: "$12,100,000",
  },
  {
    id: 6,
    name: "Consultorio Dr. Pérez",
    email: "drperez@consultorio.com",
    phone: "+57 305 678 9012",
    orders: 21,
    status: "Activo",
    totalSpent: "$6,800,000",
  },
]

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")

   const filteredClients = clients
     .filter((client) => client.status === "Activo")
     .filter(
       (client) =>
         client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         client.email.toLowerCase().includes(searchTerm.toLowerCase())
     )

  return (
    <div className="space-y-6">
       {/* Page Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
           <p className="text-muted-foreground">
             Gestiona la información de tus clientes
           </p>
         </div>
         <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
           <Link
             href="/dashboard"
             className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M5 12l-2 2l3 3"></path>
             </svg>
             Volver al Dashboard
           </Link>
           <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark">
             <Plus size={18} />
             Nuevo Cliente
           </button>
         </div>
       </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <Filter size={18} />
          Filtros
        </button>
      </div>

       {/* Clients Grid */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {filteredClients.map((client, index) => (
           <Link
             key={client.id}
             href={`/dashboard/clientes/${client.id}`}
             className="block"
           >
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: index * 0.05 }}
               className="rounded-xl bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
             >
               <div className="mb-4 flex items-start justify-between">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                   {client.name.charAt(0)}
                 </div>
                 <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                   <MoreVertical size={18} />
                 </button>
               </div>
 
               <h3 className="mb-1 font-semibold text-foreground">{client.name}</h3>
               <span
                 className={`mb-3 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                   client.status === "Activo"
                     ? "bg-green-100 text-green-700"
                     : "bg-gray-100 text-gray-600"
                 }`}
               >
                 {client.status}
               </span>
 
               <div className="mb-4 space-y-2">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Mail size={14} />
                   {client.email}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Phone size={14} />
                   {client.phone}
                 </div>
               </div>
 
               <div className="flex items-center justify-between border-t border-border pt-4">
                 <div>
                   <p className="text-xs text-muted-foreground">Pedidos</p>
                   <p className="font-semibold text-foreground">{client.orders}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-muted-foreground">Total Gastado</p>
                   <p className="font-semibold text-primary">{client.totalSpent}</p>
                 </div>
               </div>
             </motion.div>
           </Link>
         ))}
       </div>
    </div>
  )
}
