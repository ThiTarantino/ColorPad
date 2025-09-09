"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Palette, Eraser, RotateCcw, Download, Brush, Type, Heart, Shapes, Star } from "lucide-react"

interface DrawingData {
  paths: Array<{
    points: Array<{ x: number; y: number }>
    color: string
    size: number
    text?: string
    isHeart?: boolean
    isStar?: boolean
    isCircle?: boolean
    isSquare?: boolean
    isTriangle?: boolean
    isFlower?: boolean
    isSmiley?: boolean
    isButterfly?: boolean
  }>
}

const colors = [
  "#000000", // Preto
  "#FF0000", // Vermelho
  "#00FF00", // Verde
  "#0000FF", // Azul
  "#FFFF00", // Amarelo
  "#FF00FF", // Magenta
  "#00FFFF", // Ciano
  "#FFA500", // Laranja
  "#800080", // Roxo
  "#FFC0CB", // Rosa
  "#A52A2A", // Marrom
  "#808080", // Cinza
  "#FFB6C1", // Rosa claro
  "#98FB98", // Verde claro
  "#87CEEB", // Azul céu
  "#DDA0DD", // Ameixa
  "#F0E68C", // Cáqui
  "#FF6347", // Tomate
  "#40E0D0", // Turquesa
  "#EE82EE", // Violeta
]

const brushSizes = [2, 5, 10, 15, 20]

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [currentSize, setCurrentSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [drawingData, setDrawingData] = useState<DrawingData>({ paths: [] })
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTextMode, setIsTextMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const [currentText, setCurrentText] = useState("")
  const [cursorVisible, setCursorVisible] = useState(true)
  const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false)
  const [selectedShape, setSelectedShape] = useState<string | null>(null)

  useEffect(() => {
    const savedDrawing = localStorage.getItem("paint-app-drawing")
    if (savedDrawing) {
      try {
        const data = JSON.parse(savedDrawing)
        setDrawingData(data)
        redrawCanvas(data)
      } catch (error) {
        console.error("Erro ao carregar desenho:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (!isTyping) return

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [isTyping])

  useEffect(() => {
    if (!isTyping) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()

      if (e.key === "Enter") {
        finishTyping()
      } else if (e.key === "Backspace") {
        setCurrentText((prev) => prev.slice(0, -1))
      } else if (e.key.length === 1) {
        setCurrentText((prev) => prev + e.key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isTyping, currentText])

  useEffect(() => {
    if (isTyping) {
      redrawCanvasWithTyping()
    }
  }, [currentText, cursorVisible, isTyping])

  const saveDrawing = useCallback((data: DrawingData) => {
    localStorage.setItem("paint-app-drawing", JSON.stringify(data))
  }, [])

  const redrawCanvas = useCallback((data: DrawingData) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    data.paths.forEach((path) => {
      if (path.text) {
        ctx.font = `bold ${path.size}px Arial`
        ctx.fillStyle = path.color
        if (path.text === "TE AMO" || path.text === "ISABELA LUETKEMEYER") {
          ctx.textAlign = "center"
        } else {
          ctx.textAlign = "left"
        }
        ctx.fillText(path.text, path.points[0].x, path.points[0].y)
        return
      }

      if (path.isHeart) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color
        ctx.beginPath()
        const topCurveHeight = size * 0.3
        ctx.moveTo(x, y + topCurveHeight)
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight)
        ctx.bezierCurveTo(
          x - size / 2,
          y + (topCurveHeight + size) / 2,
          x,
          y + (topCurveHeight + size) / 2,
          x,
          y + size,
        )
        ctx.bezierCurveTo(
          x,
          y + (topCurveHeight + size) / 2,
          x + size / 2,
          y + (topCurveHeight + size) / 2,
          x + size / 2,
          y + topCurveHeight,
        )
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight)
        ctx.fill()
        return
      }

      if (path.isStar) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color
        ctx.beginPath()

        const spikes = 5
        const outerRadius = size
        const innerRadius = size * 0.4

        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes
          const px = x + Math.cos(angle - Math.PI / 2) * radius
          const py = y + Math.sin(angle - Math.PI / 2) * radius

          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }

        ctx.closePath()
        ctx.fill()
        return
      }

      if (path.isCircle) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()
        return
      }

      if (path.isSquare) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color
        ctx.fillRect(x - size, y - size, size * 2, size * 2)
        return
      }

      if (path.isTriangle) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.lineTo(x + size, y + size)
        ctx.closePath()
        ctx.fill()
        return
      }

      if (path.isFlower) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color

        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const petalX = x + Math.cos(angle) * size * 0.6
          const petalY = y + Math.sin(angle) * size * 0.6

          ctx.beginPath()
          ctx.arc(petalX, petalY, size * 0.4, 0, 2 * Math.PI)
          ctx.fill()
        }

        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(x, y, size * 0.3, 0, 2 * Math.PI)
        ctx.fill()
        return
      }

      if (path.isSmiley) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.1, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.1, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = "#000000"
        ctx.lineWidth = size * 0.1
        ctx.beginPath()
        ctx.arc(x, y + size * 0.2, size * 0.5, 0, Math.PI)
        ctx.stroke()
        return
      }

      if (path.isButterfly) {
        const x = path.points[0].x
        const y = path.points[0].y
        const size = path.size

        ctx.fillStyle = path.color

        ctx.beginPath()
        ctx.ellipse(x - size * 0.4, y - size * 0.3, size * 0.4, size * 0.6, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(x + size * 0.4, y - size * 0.3, size * 0.4, size * 0.6, 0, 0, 2 * Math.PI)
        ctx.fill()

        ctx.beginPath()
        ctx.ellipse(x - size * 0.3, y + size * 0.4, size * 0.3, size * 0.4, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(x + size * 0.3, y + size * 0.4, size * 0.3, size * 0.4, 0, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#8B4513"
        ctx.fillRect(x - size * 0.05, y - size, size * 0.1, size * 2)
        return
      }

      if (path.points.length < 2) return

      ctx.strokeStyle = path.color
      ctx.lineWidth = path.size
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(path.points[0].x, path.points[0].y)

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }

      ctx.stroke()
    })
  }, [])

  const redrawCanvasWithTyping = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    redrawCanvas(drawingData)

    if (isTyping) {
      ctx.font = `bold ${currentSize * 4}px Arial`
      ctx.fillStyle = currentColor
      ctx.textAlign = "left"

      ctx.fillText(currentText, textPosition.x, textPosition.y)

      if (cursorVisible) {
        const textWidth = ctx.measureText(currentText).width
        ctx.fillRect(textPosition.x + textWidth, textPosition.y - currentSize * 3, 2, currentSize * 4)
      }
    }
  }, [drawingData, isTyping, currentText, cursorVisible, textPosition, currentColor, currentSize, redrawCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        redrawCanvas(drawingData)
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [drawingData, redrawCanvas])

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()

    if (isTyping) {
      finishTyping()
      return
    }

    if (isTextMode) {
      const coords = getCoordinates(e)
      setTextPosition(coords)
      setIsTyping(true)
      setCurrentText("")
      setCursorVisible(true)
      return
    }

    if (selectedShape) {
      const coords = getCoordinates(e)
      drawShapeAtPosition(selectedShape, coords.x, coords.y)
      return
    }

    setIsDrawing(true)
    const coords = getCoordinates(e)
    setCurrentPath([coords])
  }

  const finishTyping = () => {
    if (!currentText.trim()) {
      cancelTyping()
      return
    }

    const textPath = {
      points: [{ x: textPosition.x, y: textPosition.y }],
      color: currentColor,
      size: currentSize * 4,
      text: currentText,
    }

    const newDrawingData = {
      paths: [...drawingData.paths, textPath],
    }

    setDrawingData(newDrawingData)
    saveDrawing(newDrawingData)

    setIsTyping(false)
    setCurrentText("")
    setIsTextMode(false)
  }

  const cancelTyping = () => {
    setIsTyping(false)
    setCurrentText("")
    setIsTextMode(false)
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const coords = getCoordinates(e)
    const newPath = [...currentPath, coords]
    setCurrentPath(newPath)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    ctx.strokeStyle = isEraser ? "#FFFFFF" : currentColor
    ctx.lineWidth = currentSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (newPath.length >= 2) {
      const lastPoint = newPath[newPath.length - 2]
      const currentPoint = newPath[newPath.length - 1]

      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(currentPoint.x, currentPoint.y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return

    setIsDrawing(false)

    const newDrawingData = {
      paths: [
        ...drawingData.paths,
        {
          points: currentPath,
          color: isEraser ? "#FFFFFF" : currentColor,
          size: currentSize,
        },
      ],
    }

    setDrawingData(newDrawingData)
    saveDrawing(newDrawingData)
    setCurrentPath([])
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const emptyData = { paths: [] }
    setDrawingData(emptyData)
    saveDrawing(emptyData)
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `desenho-${new Date().getTime()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const drawTeAmo = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const canvasWidth = canvas.width / window.devicePixelRatio
    const canvasHeight = canvas.height / window.devicePixelRatio

    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    const generateHeartPoints = (centerX: number, centerY: number, scale: number) => {
      const points = []
      const numPoints = 30

      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * 2 * Math.PI

        const x = 16 * Math.pow(Math.sin(t), 3)
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))

        points.push({
          x: centerX + x * scale,
          y: centerY + y * scale,
          size: 15 + Math.random() * 10,
        })
      }

      return points
    }

    const heartPoints = generateHeartPoints(centerX, centerY, 8)

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.fillStyle = "#FF0000"
      ctx.beginPath()
      const topCurveHeight = size * 0.3
      ctx.moveTo(x, y + topCurveHeight)
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight)
      ctx.bezierCurveTo(x - size / 2, y + (topCurveHeight + size) / 2, x, y + (topCurveHeight + size) / 2, x, y + size)
      ctx.bezierCurveTo(
        x,
        y + (topCurveHeight + size) / 2,
        x + size / 2,
        y + (topCurveHeight + size) / 2,
        x + size / 2,
        y + topCurveHeight,
      )
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight)
      ctx.fill()

      return {
        points: [{ x, y }],
        color: "#FF0000",
        size: size,
        isHeart: true,
      }
    }

    const heartPaths = heartPoints.map((heart) => drawHeart(heart.x, heart.y, heart.size))

    const teAmoPath = {
      points: [{ x: centerX, y: centerY - 30 }],
      color: "#FF1493",
      size: 48,
      text: "TE AMO",
    }

    const isabelaPath = {
      points: [{ x: centerX, y: centerY + 20 }],
      color: "#FF69B4",
      size: 32,
      text: "ISABELA LUETKEMEYER",
    }

    ctx.textAlign = "center"
    ctx.font = "bold 48px Arial"
    ctx.fillStyle = "#FF1493"
    ctx.fillText("TE AMO", centerX, centerY - 30)

    ctx.font = "bold 32px Arial"
    ctx.fillStyle = "#FF69B4"
    ctx.fillText("ISABELA LUETKEMEYER", centerX, centerY + 20)

    const newDrawingData = {
      paths: [...drawingData.paths, ...heartPaths, teAmoPath, isabelaPath],
    }

    setDrawingData(newDrawingData)
    saveDrawing(newDrawingData)

    setIsMenuOpen(false)
  }

  const drawShapeAtPosition = (shapeType: string, x: number, y: number) => {
    const size = currentSize * 3

    const shapePath = {
      points: [{ x, y }],
      color: currentColor,
      size: size,
      isHeart: shapeType === "heart",
      isStar: shapeType === "star",
      isCircle: shapeType === "circle",
      isSquare: shapeType === "square",
      isTriangle: shapeType === "triangle",
      isFlower: shapeType === "flower",
      isSmiley: shapeType === "smiley",
      isButterfly: shapeType === "butterfly",
    }

    const newDrawingData = {
      paths: [...drawingData.paths, shapePath],
    }

    setDrawingData(newDrawingData)
    saveDrawing(newDrawingData)
    redrawCanvas(newDrawingData)
  }

  const selectShape = (shapeType: string) => {
    setSelectedShape(selectedShape === shapeType ? null : shapeType)
    setIsEraser(false)
    setIsTextMode(false)
    if (isTyping) {
      finishTyping()
    }
    setIsShapesMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {isTyping && (
        <div className="fixed top-4 left-4 z-30 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
          Digite o texto • Enter para confirmar • Toque fora para cancelar
        </div>
      )}

      {selectedShape && (
        <div
          className="fixed top-4 left-4 z-30 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          onClick={() => setSelectedShape(null)}
        >
          Toque aqui para cancelar
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Ferramentas</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border-3 ${
                    currentColor === color && !isEraser ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setCurrentColor(color)
                    setIsEraser(false)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brush className="w-4 h-4" />
              Tamanho do Pincel
            </h3>
            <div className="space-y-3">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  className={`w-full h-12 rounded-lg border-2 flex items-center justify-center ${
                    currentSize === size ? "border-gray-800 bg-gray-100" : "border-gray-300"
                  }`}
                  onClick={() => setCurrentSize(size)}
                >
                  <div
                    className="rounded-full bg-gray-800"
                    style={{
                      width: Math.min(size, 20),
                      height: Math.min(size, 20),
                    }}
                  />
                  <span className="ml-2 text-sm">{size}px</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant={isTextMode ? "default" : "outline"}
              className="w-full h-12"
              onClick={() => {
                setIsTextMode(!isTextMode)
                setIsEraser(false)
                setSelectedShape(null)
                if (isTyping) {
                  finishTyping()
                }
              }}
            >
              <Type className="w-4 h-4 mr-2" />
              {isTextMode ? "Desenho" : "Texto"}
            </Button>

            <Button
              variant={isEraser ? "default" : "outline"}
              className="w-full h-12"
              onClick={() => {
                setIsEraser(!isEraser)
                setIsTextMode(false)
                setSelectedShape(null)
                if (isTyping) {
                  finishTyping()
                }
              }}
            >
              <Eraser className="w-4 h-4 mr-2" />
              {isEraser ? "Pincel" : "Borracha"}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 bg-transparent"
              onClick={() => setIsShapesMenuOpen(!isShapesMenuOpen)}
            >
              <Shapes className="w-4 h-4 mr-2" />
              Formas
            </Button>

            {isShapesMenuOpen && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                <Button
                  variant={selectedShape === "heart" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("heart")}
                >
                  <Heart className="w-5 h-5 mb-1" />
                  <span className="text-xs">Coração</span>
                </Button>
                <Button
                  variant={selectedShape === "star" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("star")}
                >
                  <Star className="w-5 h-5 mb-1" />
                  <span className="text-xs">Estrela</span>
                </Button>
                <Button
                  variant={selectedShape === "circle" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("circle")}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-current mb-1" />
                  <span className="text-xs">Círculo</span>
                </Button>
                <Button
                  variant={selectedShape === "square" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("square")}
                >
                  <div className="w-5 h-5 border-2 border-current mb-1" />
                  <span className="text-xs">Quadrado</span>
                </Button>
                <Button
                  variant={selectedShape === "triangle" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("triangle")}
                >
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current mb-1" />
                  <span className="text-xs">Triângulo</span>
                </Button>
                <Button
                  variant={selectedShape === "flower" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("flower")}
                >
                  <span className="text-lg mb-1">🌸</span>
                  <span className="text-xs">Flor</span>
                </Button>
                <Button
                  variant={selectedShape === "smiley" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("smiley")}
                >
                  <span className="text-lg mb-1">😊</span>
                  <span className="text-xs">Sorriso</span>
                </Button>
                <Button
                  variant={selectedShape === "butterfly" ? "default" : "outline"}
                  className="h-12 flex flex-col items-center justify-center"
                  onClick={() => selectShape("butterfly")}
                >
                  <span className="text-lg mb-1">🦋</span>
                  <span className="text-xs">Borboleta</span>
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-12 bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
              onClick={drawTeAmo}
            >
              <Heart className="w-4 h-4 mr-2" />
              TE AMO
            </Button>

            <Button variant="outline" className="w-full h-12 bg-transparent" onClick={clearCanvas}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
            <Button variant="outline" className="w-full h-12 bg-transparent" onClick={downloadDrawing}>
              <Download className="w-4 h-4 mr-2" />
              Salvar Imagem
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />}

      <button
        className="fixed top-4 right-4 z-30 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <canvas
        ref={canvasRef}
        className={`w-full h-screen bg-white touch-none ${
          isTextMode ? "cursor-text" : selectedShape ? "cursor-pointer" : "cursor-crosshair"
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: "none" }}
      />
    </div>
  )
}
