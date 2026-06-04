"use client"

import { cn } from "@/lib/utils"

interface DentalChartProps {
  selectedTeeth: number[]
  onToothToggle: (toothNumber: number) => void
}

// Definición de tipos de dientes
type ToothType = "molar" | "premolar" | "canine" | "incisor"

interface ToothData {
  num: number
  x: number
  y: number
  type: ToothType
  labelX: number
  labelY: number
}

export function DentalChart({ selectedTeeth, onToothToggle }: DentalChartProps) {
  // MAXILAR SUPERIOR - Cuadrante 1 (derecha paciente, izquierda visual) y Cuadrante 2 (izquierda paciente, derecha visual)
  const upperRightTeeth: ToothData[] = [
    { num: 18, x: 45, y: 95, type: "molar", labelX: 25, labelY: 95 },
    { num: 17, x: 58, y: 78, type: "molar", labelX: 40, labelY: 72 },
    { num: 16, x: 70, y: 62, type: "molar", labelX: 52, labelY: 54 },
    { num: 15, x: 82, y: 48, type: "premolar", labelX: 66, labelY: 40 },
    { num: 14, x: 94, y: 38, type: "premolar", labelX: 80, labelY: 28 },
    { num: 13, x: 108, y: 28, type: "canine", labelX: 95, labelY: 16 },
    { num: 12, x: 122, y: 22, type: "incisor", labelX: 112, labelY: 8 },
    { num: 11, x: 138, y: 20, type: "incisor", labelX: 132, labelY: 5 },
  ]

  const upperLeftTeeth: ToothData[] = [
    { num: 21, x: 162, y: 20, type: "incisor", labelX: 168, labelY: 5 },
    { num: 22, x: 178, y: 22, type: "incisor", labelX: 188, labelY: 8 },
    { num: 23, x: 192, y: 28, type: "canine", labelX: 205, labelY: 16 },
    { num: 24, x: 206, y: 38, type: "premolar", labelX: 220, labelY: 28 },
    { num: 25, x: 218, y: 48, type: "premolar", labelX: 234, labelY: 40 },
    { num: 26, x: 230, y: 62, type: "molar", labelX: 248, labelY: 54 },
    { num: 27, x: 242, y: 78, type: "molar", labelX: 260, labelY: 72 },
    { num: 28, x: 255, y: 95, type: "molar", labelX: 275, labelY: 95 },
  ]

  // MAXILAR INFERIOR - Cuadrante 4 (derecha paciente, izquierda visual) y Cuadrante 3 (izquierda paciente, derecha visual)
  const lowerRightTeeth: ToothData[] = [
    { num: 48, x: 45, y: 175, type: "molar", labelX: 25, labelY: 175 },
    { num: 47, x: 58, y: 192, type: "molar", labelX: 38, labelY: 200 },
    { num: 46, x: 72, y: 208, type: "molar", labelX: 52, labelY: 218 },
    { num: 45, x: 86, y: 222, type: "premolar", labelX: 68, labelY: 234 },
    { num: 44, x: 100, y: 234, type: "premolar", labelX: 84, labelY: 248 },
    { num: 43, x: 114, y: 244, type: "canine", labelX: 100, labelY: 260 },
    { num: 42, x: 130, y: 250, type: "incisor", labelX: 120, labelY: 268 },
    { num: 41, x: 144, y: 254, type: "incisor", labelX: 140, labelY: 272 },
  ]

  const lowerLeftTeeth: ToothData[] = [
    { num: 31, x: 156, y: 254, type: "incisor", labelX: 160, labelY: 272 },
    { num: 32, x: 170, y: 250, type: "incisor", labelX: 180, labelY: 268 },
    { num: 33, x: 186, y: 244, type: "canine", labelX: 200, labelY: 260 },
    { num: 34, x: 200, y: 234, type: "premolar", labelX: 216, labelY: 248 },
    { num: 35, x: 214, y: 222, type: "premolar", labelX: 232, labelY: 234 },
    { num: 36, x: 228, y: 208, type: "molar", labelX: 248, labelY: 218 },
    { num: 37, x: 242, y: 192, type: "molar", labelX: 262, labelY: 200 },
    { num: 38, x: 255, y: 175, type: "molar", labelX: 275, labelY: 175 },
  ]

  const getToothPath = (x: number, y: number, type: ToothType, quadrant: number): string => {
    const rotation = getRotation(x, quadrant)
    
    switch(type) {
      case "molar":
        // Molar más grande y redondeado
        return `M ${x-10} ${y-8} 
                Q ${x-12} ${y}, ${x-10} ${y+8}
                Q ${x} ${y+12}, ${x+10} ${y+8}
                Q ${x+12} ${y}, ${x+10} ${y-8}
                Q ${x} ${y-12}, ${x-10} ${y-8} Z`
      case "premolar":
        // Premolar ovalado
        return `M ${x-7} ${y-6} 
                Q ${x-9} ${y}, ${x-7} ${y+6}
                Q ${x} ${y+9}, ${x+7} ${y+6}
                Q ${x+9} ${y}, ${x+7} ${y-6}
                Q ${x} ${y-9}, ${x-7} ${y-6} Z`
      case "canine":
        // Canino puntiagudo
        return `M ${x} ${y-10}
                Q ${x+6} ${y-4}, ${x+5} ${y+6}
                Q ${x} ${y+10}, ${x-5} ${y+6}
                Q ${x-6} ${y-4}, ${x} ${y-10} Z`
      case "incisor":
        // Incisivo rectangular/trapezoidal
        return `M ${x-4} ${y-8}
                L ${x+4} ${y-8}
                Q ${x+6} ${y}, ${x+5} ${y+8}
                Q ${x} ${y+10}, ${x-5} ${y+8}
                Q ${x-6} ${y}, ${x-4} ${y-8} Z`
      default:
        return ""
    }
  }

  const getRotation = (x: number, quadrant: number): number => {
    const center = 150
    const distance = Math.abs(x - center)
    const maxRotation = 45
    const rotation = (distance / 120) * maxRotation
    
    if (quadrant === 1 || quadrant === 4) {
      return -rotation
    }
    return rotation
  }

  const getXMark = (x: number, y: number, type: ToothType): JSX.Element | null => {
    if (type === "molar" || type === "premolar") {
      const size = type === "molar" ? 5 : 4
      return (
        <>
          <line x1={x-size} y1={y-size} x2={x+size} y2={y+size} stroke="#555" strokeWidth="1" />
          <line x1={x+size} y1={y-size} x2={x-size} y2={y+size} stroke="#555" strokeWidth="1" />
        </>
      )
    }
    return null
  }

  const Tooth = ({ tooth, quadrant }: { tooth: ToothData; quadrant: number }) => {
    const isSelected = selectedTeeth.includes(tooth.num)
    const rotation = getRotation(tooth.x, quadrant)
    
    return (
      <g 
        onClick={() => onToothToggle(tooth.num)} 
        className="cursor-pointer"
        style={{ transformOrigin: `${tooth.x}px ${tooth.y}px` }}
      >
        <g transform={`rotate(${rotation} ${tooth.x} ${tooth.y})`}>
          <path
            d={getToothPath(tooth.x, tooth.y, tooth.type, quadrant)}
            fill={isSelected ? "#8BC34A" : "white"}
            stroke={isSelected ? "#558b2f" : "#333"}
            strokeWidth="1.5"
            className="transition-colors hover:fill-green-100"
          />
          {!isSelected && getXMark(tooth.x, tooth.y, tooth.type)}
        </g>
        <text
          x={tooth.labelX}
          y={tooth.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="500"
          fill="#333"
          className="pointer-events-none select-none"
        >
          {tooth.num}
        </text>
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full max-w-[300px] text-[10px] font-bold text-gray-600 mb-1">
        <span className="flex-1 text-center">DERECHO</span>
        <span className="flex-1 text-center">IZQUIERDO</span>
      </div>
      
      <svg viewBox="0 0 300 280" className="w-full max-w-[300px] h-auto">
        {/* Línea central vertical */}
        <line x1="150" y1="0" x2="150" y2="280" stroke="#ccc" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Línea horizontal separadora entre maxilares */}
        <line x1="30" y1="135" x2="270" y2="135" stroke="#ccc" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Etiquetas de maxilares */}
        <text x="150" y="115" textAnchor="middle" fontSize="9" fill="#666" fontWeight="500">Maxilar superior</text>
        <text x="150" y="155" textAnchor="middle" fontSize="9" fill="#666" fontWeight="500">Maxilar inferior</text>
        
        {/* Números de cuadrantes */}
        <text x="135" y="128" textAnchor="middle" fontSize="10" fill="#888" fontWeight="600">1</text>
        <text x="165" y="128" textAnchor="middle" fontSize="10" fill="#888" fontWeight="600">2</text>
        <text x="135" y="145" textAnchor="middle" fontSize="10" fill="#888" fontWeight="600">4</text>
        <text x="165" y="145" textAnchor="middle" fontSize="10" fill="#888" fontWeight="600">3</text>
        
        {/* Dientes superiores derechos (18-11) - Cuadrante 1 */}
        {upperRightTeeth.map((tooth) => (
          <Tooth key={tooth.num} tooth={tooth} quadrant={1} />
        ))}
        
        {/* Dientes superiores izquierdos (21-28) - Cuadrante 2 */}
        {upperLeftTeeth.map((tooth) => (
          <Tooth key={tooth.num} tooth={tooth} quadrant={2} />
        ))}
        
        {/* Dientes inferiores derechos (48-41) - Cuadrante 4 */}
        {lowerRightTeeth.map((tooth) => (
          <Tooth key={tooth.num} tooth={tooth} quadrant={4} />
        ))}
        
        {/* Dientes inferiores izquierdos (31-38) - Cuadrante 3 */}
        {lowerLeftTeeth.map((tooth) => (
          <Tooth key={tooth.num} tooth={tooth} quadrant={3} />
        ))}
      </svg>

      <div className="flex w-full max-w-[300px] text-[10px] font-bold text-gray-600 mt-1">
        <span className="flex-1 text-center">DERECHO</span>
        <span className="flex-1 text-center">IZQUIERDO</span>
      </div>
    </div>
  )
}
