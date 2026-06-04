"use client"

import { useRef, useState, useEffect, useCallback } from "react"

interface DrawableToothProps {
  width?: number
  height?: number
  color: string
  guia: string
  onColorChange: (value: string) => void
  onGuiaChange: (value: string) => void
}

export function DrawableTooth({ 
  width = 160, 
  height = 180,
  color,
  guia,
  onColorChange,
  onGuiaChange
}: DrawableToothProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const drawToothOutline = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h)
    
    const centerX = w / 2
    const centerY = h / 2
    const toothWidth = w * 0.5
    const toothHeight = h * 0.55

    // Relleno gris del diente
    ctx.fillStyle = "#d0d0d0"
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, toothWidth / 2, toothHeight / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Borde del diente
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, toothWidth / 2, toothHeight / 2, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Línea horizontal que atraviesa todo el canvas
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(w, centerY)
    ctx.stroke()

    // Línea vertical que atraviesa todo el canvas
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

  return (
    <div className="flex flex-col gap-1">
      {/* COLOR field */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-gray-700 w-12">COLOR</span>
        <input
          type="text"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="flex-1 border-b border-gray-400 bg-transparent outline-none text-xs py-0.5"
        />
      </div>
      
      {/* GUIA field */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-gray-700 w-12">GUIA</span>
        <input
          type="text"
          value={guia}
          onChange={(e) => onGuiaChange(e.target.value)}
          className="flex-1 border-b border-gray-400 bg-transparent outline-none text-xs py-0.5"
        />
      </div>

      {/* Canvas del diente */}
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
