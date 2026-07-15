"use client"

import { useEffect, useRef, useState } from "react"

interface SignaturePadProps {
  value?: string
  onChange?: (dataUrl: string) => void
  width?: number
  height?: number
}

export function SignaturePad({
  value = "",
  onChange,
  width = 320,
  height = 140,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(false)

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#111827"

    clearCanvas()

    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = value
      setHasInk(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx) return
    drawing.current = true
    lastPoint.current = getPos(e)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = getCtx()
    if (!ctx || !lastPoint.current) return

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPoint.current = pos
    setHasInk(true)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    drawing.current = false
    lastPoint.current = null
    canvasRef.current?.releasePointerCapture(e.pointerId)
    const canvas = canvasRef.current
    if (canvas) onChange?.(canvas.toDataURL("image/png"))
  }

  const handleClear = () => {
    clearCanvas()
    setHasInk(false)
    onChange?.("")
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative w-full overflow-hidden rounded-lg border border-gray-400 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block w-full cursor-crosshair touch-none"
          style={{ height: `${height}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Dibuja tu firma aquí
          </span>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-600 transition-colors hover:bg-gray-100"
        >
          Limpiar firma
        </button>
      </div>
    </div>
  )
}
