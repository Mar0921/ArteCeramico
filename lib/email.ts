/**
 * Envío de correos transaccionales.
 *
 * Usa la API HTTP de Resend directamente con fetch para no agregar una
 * dependencia al proyecto. Si RESEND_API_KEY no está configurado el envío
 * queda deshabilitado y las funciones lo reportan en lugar de fallar, de modo
 * que la app sigue funcionando sin correo.
 */

const RESEND_API_URL = "https://api.resend.com/emails"

export type ResultadoEnvio = {
  enviado: boolean
  error?: string
  omitido?: boolean
}

export function emailHabilitado(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

function remitente(): string {
  return process.env.EMAIL_REMITENTE || "Arte Cerámico <notificaciones@arteceramico.co>"
}

type EmailParams = {
  to: string
  subject: string
  html: string
  text: string
}

export async function enviarEmail({
  to,
  subject,
  html,
  text,
}: EmailParams): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return { enviado: false, omitido: true, error: "RESEND_API_KEY no está configurado." }
  }

  if (!to) {
    return { enviado: false, error: "El destinatario no tiene correo registrado." }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente(),
        to: [to],
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const detalle = await response.text()
      return { enviado: false, error: `Resend ${response.status}: ${detalle}` }
    }

    return { enviado: true }
  } catch (error) {
    return {
      enviado: false,
      error: error instanceof Error ? error.message : "Error de red al enviar el correo",
    }
  }
}

/** Construye el cuerpo del aviso "Listo para envío" en HTML y texto plano. */
export function cuerpoListoEnvio(params: {
  nombreCliente: string
  servicio: string
  codigoTrazabilidad: string | null
  fechaEntrega: string | null
  urlPortal: string
}) {
  const { nombreCliente, servicio, codigoTrazabilidad, fechaEntrega, urlPortal } = params

  const referencia = codigoTrazabilidad
    ? `Nº de prescripción: ${codigoTrazabilidad}`
    : "Nº de prescripción: no asignado"

  const entrega = fechaEntrega ? `Fecha de entrega estimada: ${fechaEntrega}` : null

  const asunto = "Arte Cerámico: tu trabajo está listo para envío"

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #15803d; color: #ffffff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px;">Listo para envío</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        <p style="margin-top: 0;">Hola ${nombreCliente || ""},</p>
        <p>
          Tu trabajo de <strong>${servicio || "cerámica dental"}</strong> ya está terminado
          y se encuentra listo para envío.
        </p>
        <ul style="list-style: none; padding: 0; margin: 20px 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <strong>${referencia}</strong>
          </li>
          ${entrega ? `<li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${entrega}</li>` : ""}
        </ul>
        <p style="margin-top: 24px;">
          <a href="${urlPortal}"
             style="background: #15803d; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Ver en el portal de Arte Cerámico
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
          Si crees que este trabajo aún no está listo, responde a este correo o
          escríbenos por el portal para que revisemos tu caso.
        </p>
      </div>
    </div>
  `

  const text = [
    `Hola ${nombreCliente || ""},`,
    "",
    `Tu trabajo de ${servicio || "cerámica dental"} ya está terminado y se encuentra listo para envío.`,
    "",
    referencia,
    ...(entrega ? [entrega] : []),
    "",
    `Puedes consultarlo en el portal: ${urlPortal}`,
    "",
    "Arte Cerámico",
  ].join("\n")

  return { asunto, html, text }
}
