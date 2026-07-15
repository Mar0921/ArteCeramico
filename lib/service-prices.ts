export function parsePrice(priceStr: string): number {
  const cleaned = priceStr
    .replace(/[$\s\.]/g, "")
    .replace(/,/g, "")
  const num = parseInt(cleaned, 10)
  return Number.isFinite(num) ? num : 0
}

export const SERVICE_CATALOG: { name: string; price: string }[] = [
  { name: "Provisional PMMA", price: "$100.000" },
  { name: "Provisional sobreimplante", price: "$120.000" },
  { name: "Híbrida PMMA unidad", price: "$210.000" },
  { name: "Plato base con rodete", price: "$45.000" },
  { name: "Corona disilicato maquillada", price: "$330.000" },
  { name: "Carilla disilicato", price: "$310.000" },
  { name: "Incrustación disilicato", price: "$300.000" },
  { name: "Apoyo disilicato", price: "$115.000" },
  { name: "Corona zirconio maquillada", price: "$340.000" },
  { name: "Incrustación zirconio", price: "$315.000" },
  { name: "Apoyo balcón zirconio", price: "$85.000" },
  { name: "Microfresado", price: "$130.000" },
  { name: "Corona MP atornillada", price: "$320.000" },
  { name: "Corona atornillada disilicato", price: "$380.000" },
  { name: "Corona atornillada zirconio", price: "$380.000" },
  { name: "Corona metal porcelana", price: "$315.000" },
  { name: "Híbrida metal-acrílico (Duratone)", price: "$3.200.000" },
  { name: "Híbrida metal-porcelana unidad", price: "$600.000" },
  { name: "Encerado DX", price: "$40.000" },
  { name: "Encerado guía", price: "$35.000" },
  { name: "Modelos 3D completos", price: "$100.000" },
  { name: "Modelos 3D media arcada", price: "$60.000" },
  { name: "Carillas impresas c/u", price: "$180.000" },
  { name: "Coronas impresas c/u", price: "$200.000" },
  { name: "Incrustaciones impresas c/u", price: "$180.000" },
]

export const SERVICE_PRICES: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((item) => {
    const cleaned = item.price.replace(/[$\s\.]/g, "").replace(/,/g, "")
    const num = parseInt(cleaned, 10)
    return [item.name, Number.isFinite(num) ? num : 0]
  })
)
