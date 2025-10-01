import React, { useState, useRef, useEffect } from 'react'
import { 
  Palette, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Pen, 
  Eraser,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Download,
  Upload,
  Users,
  Settings,
  Grid,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EnhancedCanvas = () => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState('pen')
  const [currentColor, setCurrentColor] = useState('#7C3AED')
  const [brushSize, setBrushSize] = useState(3)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [layers, setLayers] = useState([
    { id: 1, name: 'Background', visible: true, locked: false },
    { id: 2, name: 'Sketch', visible: true, locked: false },
    { id: 3, name: 'Details', visible: true, locked: false }
  ])
  const [activeLayer, setActiveLayer] = useState(2)
  const [collaborators, setCollaborators] = useState([
    // Remove fake collaborators - will be populated with real data when collaboration is active
  ])

  const tools = [
    { id: 'move', icon: Move, label: 'Move', shortcut: 'V' },
    { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' }
  ]

  const colors = [
    '#7C3AED', '#0891B2', '#EC4899', '#F59E0B', 
    '#10B981', '#EF4444', '#6366F1', '#8B5CF6',
    '#000000', '#FFFFFF', '#6B7280', '#F3F4F6'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx)
    }

    // Draw collaborator cursors
    drawCollaboratorCursors(ctx)
  }, [showGrid, collaborators])

  const drawGrid = (ctx) => {
    const gridSize = 20
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.5

    for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ctx.canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y <= ctx.canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  const drawCollaboratorCursors = (ctx) => {
    // Only draw if there are actual collaborators
    if (!collaborators || collaborators.length === 0) return;
    
    collaborators.forEach(collaborator => {
      const { x, y } = collaborator.cursor
      
      // Draw cursor
      ctx.fillStyle = collaborator.color
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()
      
      // Draw name label
      ctx.fillStyle = 'white'
      ctx.font = '12px Inter'
      const textWidth = ctx.measureText(collaborator.name).width
      ctx.fillRect(x + 12, y - 8, textWidth + 8, 16)
      ctx.fillStyle = collaborator.color
      ctx.fillText(collaborator.name, x + 16, y + 2)
    })
  }

  const startDrawing = (e) => {
    if (currentTool === 'move') return
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing || currentTool === 'move') return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize * 2
      ctx.lineCap = 'round'
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (showGrid) {
      drawGrid(ctx)
    }
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = 'agentmix-canvas.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const ToolButton = ({ tool, isActive, onClick }) => (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={`w-10 h-10 p-0 ${
        isActive 
          ? 'bg-brand-purple text-white' 
          : 'glass-card border-white/30 hover:bg-white/50'
      }`}
      title={`${tool.label} (${tool.shortcut})`}
    >
      <tool.icon className="h-4 w-4" />
    </Button>
  )

  const ColorButton = ({ color, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
        isActive ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  )

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left Toolbar */}
      <Card className="glass-card border-white/30 w-16 flex flex-col items-center py-4">
        <div className="space-y-2">
          {tools.map(tool => (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={currentTool === tool.id}
              onClick={() => setCurrentTool(tool.id)}
            />
          ))}
        </div>
        
        <div className="my-4 w-8 h-px bg-border" />
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(zoom + 25, 200))}
            className="w-10 h-10 p-0 glass-card border-white/30"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(zoom - 25, 25))}
            className="w-10 h-10 p-0 glass-card border-white/30"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="w-10 h-10 p-0 glass-card border-white/30"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <Card className="glass-card border-white/30 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Brush Size:</span>
                  <div className="w-32">
                    <Slider
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{brushSize}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Colors:</span>
                  <div className="flex gap-1">
                    {colors.map(color => (
                      <ColorButton
                        key={color}
                        color={color}
                        isActive={currentColor === color}
                        onClick={() => setCurrentColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`glass-card border-white/30 ${showGrid ? 'bg-white/50' : ''}`}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  Grid
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCanvas}
                  className="glass-card border-white/30"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="glass-card border-white/30 flex-1 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            />
            
            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-4 glass-card border-white/30 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-foreground">{zoom}%</span>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Layers */}
      <Card className="glass-card border-white/30 w-64">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {layers.map(layer => (
            <div
              key={layer.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeLayer === layer.id 
                  ? 'bg-brand-purple/10 border border-brand-purple/20' 
                  : 'hover:bg-white/50'
              }`}
              onClick={() => setActiveLayer(layer.id)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setLayers(layers.map(l => 
                    l.id === layer.id ? { ...l, visible: !l.visible } : l
                  ))
                }}
              >
                {layer.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
              
              <span className="flex-1 text-sm font-medium text-foreground">
                {layer.name}
              </span>
              
              {layer.locked && (
                <div className="w-3 h-3 bg-muted-foreground rounded-sm" />
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full glass-card border-white/30"
            onClick={() => {
              const newLayer = {
                id: layers.length + 1,
                name: `Layer ${layers.length + 1}`,
                visible: true,
                locked: false
              }
              setLayers([...layers, newLayer])
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Layer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedCanvas