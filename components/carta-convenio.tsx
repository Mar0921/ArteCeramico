"use client"

import type { ReactNode, RefObject } from "react"

interface CartaConvenioContenidoProps {
  contenidoRef?: RefObject<HTMLDivElement | null>
  clinica?: string | null
  nombre?: string | null
  firmaOdontologo?: ReactNode
  firmaOdontologoExtra?: ReactNode
}

export function CartaConvenioContenido({
  contenidoRef,
  clinica,
  nombre,
  firmaOdontologo,
  firmaOdontologoExtra,
}: CartaConvenioContenidoProps) {
  return (
    <div
      ref={contenidoRef}
      className="relative mx-auto w-full max-w-4xl bg-white p-10 text-sm text-gray-800"
    >
      <div className="absolute top-6 right-6 text-[10px] text-gray-500">
        <div>Fecha de elaboración: 01-02-2026</div>
        <div>CODIGO: GF-AC-001</div>
        <div>VERSION: 001</div>
      </div>

      <div className="mb-2 text-left">
        <span className="text-xs font-bold text-gray-900">ARTE CERÁMICO</span>
      </div>

      <p className="mb-2 text-center text-xs text-gray-500">
        Santiago de Cali,{" "}
        {new Date().toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
        CARTA CONVENIO
      </h3>

      <p className="mb-2 text-sm">
        <span className="font-semibold">Clínica:</span> {clinica || "XXXXXXXXX"}
      </p>
      <p className="mb-6 text-sm">
        <span className="font-semibold">Doctor:</span> {nombre || "XXXXXXXXXX"}
      </p>

      <div className="mb-6 space-y-3 text-justify text-xs leading-relaxed">
        <p>
          El laboratorio dental ARTE CERAMICO confirma el compromiso para la
          provisión en cuanto a fabricación, reparación y dispensación, de los
          DISPOSITIVOS MÉDICOS SOBRE MEDIDA BUCAL, cumpliendo con la resolución
          214 de 2022 en la cual se establecen los requisitos sanitarios que
          deben cumplir los dispositivos médicos sobre medida bucal.
        </p>
        <p>
          Nuestro compromiso es respetar su autonomía como odontólogo, fabricando
          o reparando los dispositivos acordes a la prescripción por usted
          realizada en la evaluación previa del paciente con los datos completos.
        </p>
        <p>Dclaramos nuestro compromiso como fabricante.</p>

        <p className="font-semibold">
          DENTRO DEL CONVENIO EL LABORATORIO SE COMPROMETE A:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>
            El laboratorio garantiza que los trabajos entregados estarán
            elaborados con materiales de buena calidad y conforme a las
            especificaciones solicitadas.
          </li>
          <li>
            Cumplir con Procedimientos documentados: Declaración de conformidad
            con su garantía si aplica, Ficha técnica de fabricación, manual de
            uso.
          </li>
          <li>
            El tiempo de entrega estará sujeto a acuerdos según la complejidad
            del caso.
          </li>
          <li>
            Nos comprometemos a respetar su autonomía y trabajar articuladamente
            entre técnico y odontólogo.
          </li>
          <li>
            Ambas partes se comprometen a mantener la confidencialidad respecto
            a los datos de los pacientes, precios, y cualquier información
            considerada confidencial.
          </li>
        </ol>

        <p className="font-semibold">COMPROMISO DEL ODONTOLOGO</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>
            Enviar la orden de fabricación de forma completa y clara con los
            datos solicitados sin enmendaduras y en letra legible en los términos
            establecidos en el artículo 6 de la resolución 214 de 2022.
          </li>
          <li>
            Estar debidamente habilitado ante la secretaría de salud en los
            términos establecidos en la resolución 3100 de 2019.
          </li>
          <li>
            Realizar el control pos-adaptación 8 días después en una cita de
            control al paciente y enviar copia del registro de verificación del
            estado del dispositivo en el control de la paciente realizada por el
            odontólogo.
          </li>
          <li>
            Informar al Laboratorio dental cualquier evento adverso serio y
            compartir el código del evento adverso reportado en los programas de
            tecno vigilancia.
          </li>
        </ol>
        <p>
          Esperamos atender y cumplir sus necesidades en cuanto a calidad,
          diseño y estética de los dispositivos médicos.
        </p>
      </div>

      <div className="mt-10 border-t border-gray-300 pt-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 h-24 w-full max-w-48 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              <img
                src="/firma-oscar.jpeg"
                alt="Firma Representante Legal"
                className="h-full w-full object-contain p-2"
              />
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              __________________________________
            </p>
            <p className="text-xs text-gray-600">Representante legal</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-2 h-24 w-full max-w-48 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              <img
                src="/firma-jazmin.jpeg"
                alt="Firma D.T."
                className="h-full w-full object-contain p-2"
              />
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              __________________________________
            </p>
            <p className="text-xs text-gray-600">
              D.T. LABORATORIO DENTAL ARTE CERAMICO
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            {firmaOdontologo ?? (
              <div className="mb-2 flex h-24 w-full max-w-48 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-2">
                <span className="text-center text-[10px] font-medium text-gray-400">
                  Pendiente por firmas
                </span>
              </div>
            )}
            <p className="text-xs font-semibold text-gray-700 mb-1">
              __________________________________
            </p>
            <p className="text-xs text-gray-600">Recibido Odontólogo o Auxiliar</p>
            {firmaOdontologoExtra}
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Santiago de Cali,{" "}
            {new Date().toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-300 pt-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-[10px] text-gray-500">
          <span>Carrera 42 A # 5 C 36</span>
          <span>B. Tequendama</span>
          <span>602 6670481 - 602 4082563</span>
          <span>3177280804</span>
          <span>lab-arteceramico@hotmail.com</span>
        </div>
      </div>
    </div>
  )
}
