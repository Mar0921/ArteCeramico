import { NextResponse } from "next/server"

const companyInfo = {
  name: "Arte Cerámico Laboratorio Dental",
  address: "Cra 42a # 5c -36, Cali, Valle del Cauca, Colombia",
  googleMaps: "https://maps.app.goo.gl/NY7w9hcY48P59soH9",
  phone: "3177280804",
  email: "lab-arteceramico@hotmail.com",
  history: "Somos un laboratorio dental especializado en prótesis fija, contando con más de 15 años de experiencia, la cual nos avala como unos de los líderes en el sector regional; trabajando con procesos técnicos precisos y materiales certificados, brindando resultados confiables y de muy alta calidad, consistentes para profesionales de la odontología.",
  mission: "Fabricar prótesis dentales sobre medida principalmente prótesis fija, como carillas, coronas, coronas sobre implantes, entre otros con un estándar de alta calidad enfocado en la estética y la personalización.",
  vision: "Para el 2027 lograr la certificación de calidad INVIMA, que nos permita garantizar la calidad en todos nuestros procesos tanto productivos como administrativos.",
  technology: "Tecnología CADCAM (scanner de mesa e intraoral, fresadoras e impresoras 3D). Hornos de cerámica y otros equipos asociados a la correcta elaboración de prótesis dentales.",
  deliveryTime: "8 días",
  materials: "Zirconio, disilicato de litio, PMMA, resinas 3D, metal, entre otros",
  warranty: "Garantía de 1 año en adaptación, funcionalidad y color, sobre primer modelo o primera impresión de trabajo.",
  paymentMethods: "Efectivo, transferencias bancarias, pagos PSE, tarjetas crédito y débito",
  acceptsInstallments: false,
  deliveryZones: "Solo realizamos domicilios dentro de la ciudad de Cali"
}

interface ServiceItem {
  name: string
  price: string
  type?: string
  variant?: string
}

interface Category {
  id: string
  title: string
  keywords: string[]
  items: ServiceItem[]
}

interface ConversationContext {
  lastIntent: string | null
  waitingFor: string | null
  lastQuery: string | null
}

const categories: Category[] = [
  {
    id: "acrilicos",
    title: "ACRÍLICOS",
    keywords: ["acrílico", "acrilico", "plato base", "rodete", "pmma", "hibrida pmma"],
    items: [
      { name: "Provisional PMMA", price: "$100.000" },
      { name: "Provisional sobre implante", price: "$120.000" },
      { name: "Híbrida PMMA unidad", price: "$210.000" },
      { name: "Plato base con rodete", price: "$45.000" },
    ]
  },
  {
    id: "libre-metal",
    title: "LIBRE DE METAL",
    keywords: ["libre metal", "disilicato", "zirconio", "carilla", "incrustacion zirconio", "apoyo disilicato", "apoyo balcón"],
    items: [
      { name: "Corona disilicato maquillada", price: "$330.000" },
      { name: "Carilla disilicato", price: "$310.000" },
      { name: "Incrustación disilicato", price: "$300.000" },
      { name: "Apoyo disilicato", price: "$115.000" },
      { name: "Corona zirconio maquillada", price: "$340.000" },
      { name: "Incrustación zirconio", price: "$315.000" },
      { name: "Apoyo, balcón zirconio", price: "$85.000" },
    ]
  },
  {
    id: "implantologia",
    title: "IMPLANTOLOGÍA",
    keywords: ["implante", "implantología", "implantologia", "atornillada", "microfresado"],
    items: [
      { name: "Microfresado", price: "$130.000" },
      { name: "Corona MP atornillada", price: "$320.000" },
      { name: "Corona atornillada disilicato", price: "$380.000" },
      { name: "Corona atornillada zirconio", price: "$380.000" },
    ]
  },
  {
    id: "metal",
    title: "METAL",
    keywords: ["metal", "hibrida metal-acrilico", "hibrida metal-porcelana"],
    items: [
      { name: "Corona metal porcelana", price: "$315.000" },
      { name: "Híbrida metal-acrílico (Duratone)", price: "$3.200.000" },
      { name: "Híbrida metal-porcelana unidad", price: "$600.000" },
    ]
  },
  {
    id: "encerados",
    title: "ENCERADOS",
    keywords: ["encerado", "dx", "guía", "guia"],
    items: [
      { name: "Encerado DX", price: "$40.000" },
      { name: "Encerado guía", price: "$35.000" },
    ]
  },
  {
    id: "resinas-impresas",
    title: "RESINAS IMPRESAS",
    keywords: ["resina", "impresa", "3d", "modelos 3d", "carillas impresas", "coronas impresas", "incrustaciones impresas"],
    items: [
      { name: "Modelos 3D completos", price: "$100.000" },
      { name: "Modelos 3D media arcada", price: "$60.000" },
      { name: "Carillas impresas c/u", price: "$180.000" },
      { name: "Coronas impresas c/u", price: "$200.000" },
      { name: "Incrustaciones impresas c/u", price: "$180.000" },
    ]
  }
]

let conversationContext: ConversationContext = {
  lastIntent: null,
  waitingFor: null,
  lastQuery: null
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim()
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function findSpecificService(query: string): { item: ServiceItem; category: Category } | null {
  const normalizedQuery = normalizeText(query)
  
  for (const category of categories) {
    for (const item of category.items) {
      const normalizedName = normalizeText(item.name)
      if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
        return { item, category }
      }
      if (levenshtein(normalizedQuery, normalizedName) <= 2) {
        return { item, category }
      }
    }
  }
  return null
}

function findServicesByMaterial(query: string): { items: ServiceItem[]; category: Category | null } {
  const normalizedQuery = normalizeText(query)
  const matchingItems: ServiceItem[] = []
  let matchedCategory: Category | null = null
  
  const wantsZirconio = normalizedQuery.includes("zirconio") || normalizedQuery.includes("zircon")
  const wantsDisilicato = normalizedQuery.includes("disilicato")
  const wantsCorona = normalizedQuery.includes("corona")
  const wantsCarilla = normalizedQuery.includes("carilla")
  
  for (const category of categories) {
    for (const item of category.items) {
      const itemNameNorm = normalizeText(item.name)
      
      if (wantsCorona && !wantsZirconio && !wantsDisilicato) {
        if (itemNameNorm.includes("corona")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
      else if (wantsZirconio && wantsCorona) {
        if (itemNameNorm.includes("zirconio") && itemNameNorm.includes("corona")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
      else if (wantsZirconio && wantsCarilla) {
        if (itemNameNorm.includes("zirconio") && itemNameNorm.includes("carilla")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
      else if (wantsDisilicato && wantsCorona) {
        if (itemNameNorm.includes("disilicato") && itemNameNorm.includes("corona")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
      else if (wantsZirconio && !wantsCorona && !wantsCarilla) {
        if (itemNameNorm.includes("zirconio")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
      else if (wantsDisilicato && !wantsCorona && !wantsCarilla) {
        if (itemNameNorm.includes("disilicato")) {
          matchingItems.push(item)
          matchedCategory = category
        }
      }
    }
  }
  
  return { items: matchingItems, category: matchedCategory }
}

function getCategoryOptions(categoryId: string): string | null {
  const category = categories.find(c => c.id === categoryId)
  if (!category) return null
  
  let response = `${category.title}\n\n`
  for (const item of category.items) {
    response += `${item.name}: ${item.price}\n`
  }
  response += `\nCuál de estos servicios te interesa?`
  return response
}

function getFilteredServicesResponse(items: ServiceItem[], category: Category | null): string {
  if (!items.length) {
    return "No encontré servicios que coincidan con tu búsqueda. Podrías ser más específico?"
  }
  
  let response = `Resultados para tu búsqueda:\n\n`
  for (const item of items) {
    response += `${item.name}: ${item.price}\n`
  }
  response += `\nTe interesa alguno de estos servicios?`
  return response
}

function getAllPrices(): string {
  let response = "LISTA COMPLETA DE PRECIOS\n\n"
  
  for (const category of categories) {
    response += `${category.title}\n`
    for (const item of category.items) {
      response += `${item.name}: ${item.price}\n`
    }
    response += "\n"
  }
  
  response += "Necesitas información más detallada de alguna categoría o servicio específico?"
  return response
}

function handleAffirmativeNegative(query: string, context: ConversationContext): string | null {
  const normalizedQuery = normalizeText(query)
  
  const affirmatives = ["si", "sí", "claro", "ok", "dale", "bueno", "vale", "sip", "siii"]
  const negatives = ["no", "nop", "nel", "nada", "ninguno", "no gracias"]
  
if (affirmatives.includes(normalizedQuery)) {
     if (context.waitingFor === "directions") {
       return "Te recomiendo usar Google Maps para las indicaciones exactas:\n" + companyInfo.googleMaps + "\n\nNecesitas otra cosa?"
     }
     return "Perfecto, en qué más puedo ayudarte?"
   }
  
  if (negatives.includes(normalizedQuery)) {
    return "De acuerdo! Si necesitas algo más, aquí estoy. Gracias por contactarnos!"
  }
  
  return null
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const originalMessage: string = body.message || ""
    const message: string = normalizeText(originalMessage)
    
    let response: string = ""
    
    const contextualResponse = handleAffirmativeNegative(message, conversationContext)
    if (contextualResponse) {
      conversationContext = { lastIntent: null, waitingFor: null, lastQuery: null }
      return NextResponse.json({ response: contextualResponse })
    }
    
    const greetings = ["hola", "buenas", "saludos", "hey", "buenos días", "buenas tardes", "buenas noches"]
    if (greetings.some(g => message.includes(g)) && originalMessage.length < 30) {
      response = "Hola! Bienvenido a Arte Cerámico Laboratorio Dental. Somos especialistas en prótesis fija con más de 15 años de experiencia. En qué podemos ayudarte hoy?"
      conversationContext = { lastIntent: "greeting", waitingFor: null, lastQuery: message }
    }

    else if (["ubicacion", "direccion", "mapa", "dónde", "donde", "ubicación", "ubicados"].some(word => message.includes(word))) {
      response = `Ubicación\n\n${companyInfo.address}\n\nGoogle Maps:\n${companyInfo.googleMaps}\n\nNecesitas indicaciones de cómo llegar? (responde "sí" o "no")`
      conversationContext = { lastIntent: "location", waitingFor: "directions", lastQuery: message }
    }

    else if (["contacto", "telefono", "whatsapp", "llamar", "comunicarme", "celular", "teléfono", "número", "numero"].some(word => message.includes(word))) {
      response = `Contacto\n\nWhatsApp: ${companyInfo.phone}\nCorreo: ${companyInfo.email}\n\nHorario de atención:\nLunes a Viernes: 8am - 6pm\nSábados: 8am - 1pm\n\nEn qué más puedo ayudarte?`
      conversationContext = { lastIntent: "contact", waitingFor: null, lastQuery: message }
    }

    else if (["horario", "horarios", "atención", "atencion"].some(word => message.includes(word))) {
      response = `Horario de atención\n\nLunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 8:00 AM - 1:00 PM\nDomingos: Cerrado\n\nTe esperamos!`
      conversationContext = { lastIntent: "schedule", waitingFor: null, lastQuery: message }
    }

    else if (["tiempo", "entrega", "demora", "tardan", "cuanto tardan", "cuánto tardan", "días", "plazo", "tiempo de espera", "entrega de trabajos", "cuanto se demoran"].some(word => message.includes(word))) {
      response = `Tiempo de entrega\n\nEl tiempo de entrega de nuestros trabajos es de ${companyInfo.deliveryTime}.\n\nEste tiempo puede variar según la complejidad del caso. Necesitas más información sobre algún servicio en específico?`
      conversationContext = { lastIntent: "delivery", waitingFor: null, lastQuery: message }
    }

    else if (["materiales", "material", "materia prima", "que materiales", "qué materiales", "utilizan", "usan", "fabrican", "composición", "con que"].some(word => message.includes(word))) {
      response = `Materiales utilizados\n\nEn Arte Cerámico utilizamos materiales de alta calidad:\n\n${companyInfo.materials.replace(/, /g, "\n")}\n\nTe interesa algún material en particular para tu trabajo?`
      conversationContext = { lastIntent: "materials", waitingFor: null, lastQuery: message }
    }

    else if (["garantia", "garantía", "aseguran", "respaldo", "cubren", "cubre", "protección", "seguro"].some(word => message.includes(word))) {
      response = `Garantía\n\n${companyInfo.warranty}\n\nTienes alguna pregunta adicional sobre nuestra garantía?`
      conversationContext = { lastIntent: "warranty", waitingFor: null, lastQuery: message }
    }

    else if (["pago", "pagos", "forma de pago", "metodo de pago", "método de pago", "transferencia", "efectivo", "tarjeta", "credito", "crédito", "debito", "débito", "pse"].some(word => message.includes(word))) {
      response = `Formas de pago\n\nAceptamos:\n\n${companyInfo.paymentMethods.replace(/, /g, "\n")}\n\nImportante: No aceptamos pagos a cuotas. El pago debe ser de contado.\n\nNecesitas más información sobre algún método de pago?`
      conversationContext = { lastIntent: "payment", waitingFor: null, lastQuery: message }
    }

    else if (["cuotas", "cuota", "credito", "crédito", "financiar", "financiación", "meses", "plazos", "pagar a cuotas", "paguitos", "diferido", "diferidos"].some(word => message.includes(word))) {
      response = `Pagos a cuotas\n\nLo sentimos, actualmente no aceptamos pagos a cuotas. Todas las transacciones deben ser de contado.\n\nAceptamos: ${companyInfo.paymentMethods}\n\nTe gustaría que un asesor te ayude con más información sobre costos?`
      conversationContext = { lastIntent: "installments", waitingFor: null, lastQuery: message }
    }

    else if (["domicilio", "domicilios", "envio", "envíos", "entrega a domicilio", "delivery", "envían", "mandan", "llevan", "recoger", "recojo", "despacho", "despachos"].some(word => message.includes(word))) {
      response = `Domicilios\n\n${companyInfo.deliveryZones}.\n\nLos domicilios tienen un costo adicional según la zona. Necesitas que un asesor te confirme el valor de envío a tu ubicación?`
      conversationContext = { lastIntent: "delivery_zone", waitingFor: null, lastQuery: message }
    }

    else if (["quienes somos", "quienes son", "historia", "trayectoria", "experiencia", "años", "laboratorio", "nosotros", "conócenos", "conoceme"].some(word => message.includes(word))) {
      response = `Quiénes somos?\n\n${companyInfo.history}\n\nMisión: ${companyInfo.mission}\n\nVisión: ${companyInfo.vision}\n\nTe gustaría conocer más sobre nuestros servicios o tecnologías?`
      conversationContext = { lastIntent: "about", waitingFor: null, lastQuery: message }
    }

    else if (["tecnologia", "tecnología", "equipos", "cadcam", "scanner", "fresadora", "impresora", "cad cam", "maquinaria", "herramientas"].some(word => message.includes(word))) {
      response = `Tecnología y equipos\n\n${companyInfo.technology}\n\nEsto nos permite garantizar alta precisión y calidad en todos nuestros trabajos. Te interesa algún servicio en particular?`
      conversationContext = { lastIntent: "technology", waitingFor: null, lastQuery: message }
    }

    else if (["todos los precios", "lista precios", "precios completos", "todos los servicios", "todo los precios", "todos", "todo", "lista completa", "todos los productos", "precios todos"].some(p => message.includes(p))) {
      response = getAllPrices()
      conversationContext = { lastIntent: "all_prices", waitingFor: null, lastQuery: message }
    }
    
    else if (["asesor", "asesoría", "hablar con alguien", "comunicarme con un asesor", "persona", "humano", "ayuda personalizada", "necesito un asesor", "requiero asesoría"].some(word => message.includes(word))) {
      response = `Contacto con asesor\n\nPuedes comunicarte directamente con nosotros:\n\nWhatsApp: ${companyInfo.phone}\nCorreo: ${companyInfo.email}\n\nUn asesor te atenderá en horario laboral:\nLunes a Viernes: 8am - 6pm\nSábados: 8am - 1pm\n\nNecesitas algo más mientras esperas?`
      conversationContext = { lastIntent: "advisor", waitingFor: null, lastQuery: message }
    }

else if (message.includes("precios") || message.includes("precio") || message.includes("valores") || message.includes("costo") || message.includes("tarifas") || message.includes("cuánto cuesta") || message.includes("cuanto cuesta") || message.includes("cuánto vale") || message.includes("cuanto vale")) {
      response = `Te ayudo con los precios. Qué categoría te interesa?\n\n` +
        categories.map(c => `${c.title}`).join("\n") +
        `\n\nO puedes preguntar por un servicio específico (ej: "corona zirconio") o escribir "todos" para ver la lista completa.`
      conversationContext = { lastIntent: "prices", waitingFor: null, lastQuery: message }
    }

    else if ((message.includes("zirconio") || message.includes("disilicato")) && 
             (message.includes("hacen") || message.includes("manejan") || message.includes("ofrecen"))) {
      const filtered = findServicesByMaterial(message)
      response = getFilteredServicesResponse(filtered.items, filtered.category)
    }

    else if (message.includes("acrilico") || message.includes("acrílico") || message.includes("pmma")) {
      response = getCategoryOptions("acrilicos") || "No encontré información sobre acrílicos."
    }
    else if (message.includes("encerado") || message.includes("dx") || message.includes("guía") || message.includes("guia")) {
      response = getCategoryOptions("encerados") || "No encontré información sobre encerados."
    }
    else if (message.includes("resina impresa") || message.includes("resinas impresas") || (message.includes("3d") && message.includes("modelo"))) {
      response = getCategoryOptions("resinas-impresas") || "No encontré información sobre resinas impresas."
    }
    else if (message.includes("libre metal") || message.includes("libre de metal")) {
      response = getCategoryOptions("libre-metal") || "No encontré información sobre libre de metal."
    }
    else if (message.includes("implante") || message.includes("implantologia") || message.includes("implantología")) {
      response = getCategoryOptions("implantologia") || "No encontré información sobre implantología."
    }
    else if (message.includes("metal") || (message.includes("cofia") && !message.includes("implantologia"))) {
      response = getCategoryOptions("metal") || "No encontré información sobre metal."
    }

    else if (message.includes("yeso") || message.includes("modelo")) {
      response = "No encontré información sobre yesos. Ten en cuenta que trabajamos con múltiples materiales y servicios. ¿Buscas algo específico?"
    }

    else if (message.includes("zirconio") || message.includes("disilicato") || message.includes("zircon")) {
      const filtered = findServicesByMaterial(message)
      response = getFilteredServicesResponse(filtered.items, filtered.category)
    }

    else {
      const specificService = findSpecificService(message)
      
      if (specificService) {
        response = `${specificService.item.name} tiene un valor de ${specificService.item.price}\n\nCategoría: ${specificService.category.title}\nNecesitas el precio de otro servicio o más información sobre esta categoría?`
      } 
      else {
        response = `Lo siento, no entendí tu consulta. Puedo ayudarte con:\n\n` +
          `Categorías: Acrílicos, Libre de Metal, Implantología, Metal, Encerados, Resinas Impresas\n` +
          `Consultar precios de servicios específicos\n` +
          `Información de la empresa (quiénes somos, tecnología, misión, visión)\n` +
          `Tiempos de entrega, materiales, garantía y formas de pago\n` +
          `Domicilios y envíos (solo Cali)\n` +
          `Asesoría si necesitas hablar con un humano\n\n` +
          `Por ejemplo:\n- "tiempo de entrega"\n- "materiales"\n- "garantía"\n- "formas de pago"\n- "domicilios"\n- "cuotas"\n- "quienes son"\n- "corona zirconio"`
      }
    }

    return NextResponse.json({ response })
    
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { response: "Ocurrió un error procesando tu mensaje. Por favor, intenta de nuevo." },
      { status: 500 }
    )
  }
}