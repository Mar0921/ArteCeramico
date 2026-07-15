"use client"

import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"

export interface DrawableToothRef {
  getDrawingDataUrl: () => string | null
  clearCanvas: () => void
}

const GUIAS_Y_TONOS: Record<string, string[]> = {
  "VITAPAN Classical": ["M1","M2","M3","A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4"],
  "VITAPAN 3D Master": ["0M1","0M2","0M3","1M1","1M2","2L1.5","2L2.5","2M1","2M2","2M3","2R1.5","2R2.5","3L1.5","3L2.5","3M1","3M2","3M3","3R1.5","3R2.5","4L1.5","4L2.5","4M1","4M2","4M3","4R1.5","4R2.5","5M1","5M2","5M3"],
  "Ivoclar Vivodent PE": ["01","1A","2A","1C","2B","1D","1E","2C","3A","5B","2E","3E","4A","6B","4B","6C","6D","4C","3C","4D"],
  "Ivoclar Vivodent Chromascop": ["110","120","130","140","150","160","170","180","190","200","210","220","230","240","250","260","270","280","290","300","310","320","330","340","350","360","370","380","390","400","410","420","430","440","450","460","470","480","490","500","510","520","530","540"],
  "Ivoclar Vivadent A-D + Bleach": ["BL1","BL2","BL3","BL4","A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4"],
  "IPS Natural Die Material": ["ND","ND2","ND3","ND4","ND5","ND6","ND7","ND8","ND9"],
  "Odilux": ["11A","11C","11D","11E","12A","12B","12C","12E","13A","13C","13E","14A","14B","14C","14D","15B","16B","16C","16D"],
  "Odident": ["A1","A2","A3","A3.5","A4","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4"],
  "Acry Lux": ["1A","2A","3A","4A","2B","4B","5B","6B","1C","2C","3C","4C","6C","1D","4D","6D","1E","2E","3E"],
  "Acry Lux V": ["A1","A2","A3","A3.5","A4","B0","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","BL"],
  "Acry Plus": ["1A","2A","3A","4A","2B","4B","5B","6B","1C","2C","3C","4C","6C","1D","4D","6D","1E","2E","3E"],
  "Acry Plus V": ["A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4"],
  "Trubyte New Hue": ["59","60","61","62","65","66","67","68","69","77","78","81","87"],
  "Kuraray Noritake": ["NW0","NW0.5","A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","NP1.5","NP2.5"],
  "Trilux Acrylic Teeth": ["A1","A2","A3","A3.5","A4","B1","B2","C2","C3","D3","D4"],
  "GC Initial": ["IN-43","IN-44","IN-46","INC","CL-F","D-A1","D-A2","D-A3","D-A3.5","D-A4","D-B1","D-B2","D-B3","D-B4","D-C1","D-C2","D-C3","D-C4","D-D2","D-D3","D-D4","E-57","E-58","E-59","E-60","GL","TN","TO"],
  "Creation Willi Geller": ["A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","TD-A1","TD-A2","TD-A3","TD-A3.5","TD-A4","TD-B1","TD-B2","TD-B3","TD-B4","TD-C1","TD-C2","TD-C3","TD-C4","TD-D2","TD-D3","TD-D4","TD-BA","57","58","59","60","CL-O","UC","NT","OT","TI-01","TI-02","TI-03","TI-04","TI-05","SI-01","SI-02","SI-03","SI-04","SI-05","SI-06","SO-10","SO-11","PS-0","PS-1","PS-2","PS-3","HT-51","HT-52","HT-53","HT-54","HT-55","HT-56","SP-21","SP-22","SP-23","SP-24","SP-25","SP-26","SP-27","SP-28","SP-29","SP-G","G1","G2","G3","G4","G5","G6","G7","GN","OD-32","OD-37","OD-41","OD-42","OD-43","OD-44","O-AB","BD-A","BD-B","BD-BO","S-AB","SP-AB","KM"],
  "Noritake Tissue": ["1","2","3","4","5","6","7"],
  "Hass Amber Mill": ["W1","W2","W3","W4","A1","A2","A3","A3.5","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4"],
  "Duratone": ["A0","A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3"],
}

interface DrawableToothProps {
  width?: number
  height?: number
  color: string
  guia: string
  onColorChange: (value: string) => void
  onGuiaChange: (value: string) => void
}

export const DrawableTooth = forwardRef<DrawableToothRef, DrawableToothProps>(
  function DrawableTooth({ 
    width = 160, 
    height = 180,
    color,
    guia,
    onColorChange,
    onGuiaChange,
  }: DrawableToothProps, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

    const drawToothOutline = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h)
      
      const centerX = w / 2
      const centerY = h / 2
      const toothWidth = w * 0.5
      const toothHeight = h * 0.55

      ctx.fillStyle = "#d0d0d0"
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, toothWidth / 2, toothHeight / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "#333"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, toothWidth / 2, toothHeight / 2, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(w, centerY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(centerX, 0)
      ctx.lineTo(centerX, h)
      ctx.stroke()

    }, [])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      drawToothOutline(ctx, canvas.width, canvas.height)
    }, [drawToothOutline])

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ("touches" in e) {
        const touch = e.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const pos = getPos(e)
      setIsDrawing(true)
      setLastPos(pos)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      if (!isDrawing) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      const pos = getPos(e)

      ctx.strokeStyle = "#c62828"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(lastPos.x, lastPos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      setLastPos(pos)
    }

    const stopDrawing = () => {
      setIsDrawing(false)
    }

    const clearCanvas = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      drawToothOutline(ctx, canvas.width, canvas.height)
    }

    const getDrawingDataUrl = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.toDataURL("image/png")
    }, [drawToothOutline])

    useImperativeHandle(ref, () => ({
      getDrawingDataUrl,
      clearCanvas,
    }))

    const guiaKeys = Object.keys(GUIAS_Y_TONOS)
    const coloresDisponibles = guia ? GUIAS_Y_TONOS[guia] : []

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-700 w-12">GUIA</span>
          <select
            value={guia}
            onChange={(e) => {
              onGuiaChange(e.target.value)
              onColorChange("")
            }}
            className="flex-1 border-b border-gray-400 bg-transparent outline-none text-xs py-0.5"
          >
            <option value="">Selecciona...</option>
            {guiaKeys.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-700 w-12">COLOR</span>
          <select
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={!guia}
            className="flex-1 border-b border-gray-400 bg-transparent outline-none text-xs py-0.5 disabled:opacity-50"
          >
            <option value="">Selecciona...</option>
            {coloresDisponibles.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center mt-2">
          <canvas
            ref={canvasRef}
            width={width * 2}
            height={height * 2}
            className="border border-gray-400 cursor-crosshair touch-none bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ width: `${width}px`, height: `${height}px` }}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[10px] text-gray-500 hover:text-gray-700 underline mt-1"
          >
            Borrar
          </button>
        </div>
      </div>
    )
  }
)