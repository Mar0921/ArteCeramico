import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Solicitud de Servicio - Arte Cerámico',
  description: 'Formulario para solicitar servicios dentales',
}

export default function FormLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
    </>
  )
}
