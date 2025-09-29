import React, { useState, useRef, useEffect } from 'react';
import { Save, Download, Upload, Trash2, Undo, Redo, Palette, Type, Square, Circle, ArrowRight } from 'lucide-react';

const CollaborativeCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [canvasData, setCanvasData] = useState(null);

  useEffect(() => {
    fetchAgents();
    initializeCanvas();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents.filter(agent => agent.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveCanvasState();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    if (tool === 'pen' || tool === 'eraser') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 2;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const drawShape = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalCompositeOperation = 'source-over';
    
    if (tool === 'rectangle') {
      ctx.strokeRect(x - 25, y - 25, 50, 50);
    } else if (tool === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    saveCanvasState();
  };

  const addText = (e) => {
    const text = prompt('Enter text:');
    if (text) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.font = `${lineWidth * 8}px Arial`;
      ctx.fillStyle = color;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillText(text, x, y);
      
      saveCanvasState();
    }
  };

  const handleCanvasClick = (e) => {
    if (tool === 'rectangle' || tool === 'circle') {
      drawShape(e);
    } else if (tool === 'text') {
      addText(e);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreCanvasState(canvasHistory[newIndex]);
    }
  };

  const restoreCanvasState = (imageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const link = document.createElement('a');
    link.download = 'collaborative-canvas.png';
    link.href = imageData;
    link.click();
  };

  const shareWithAgents = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent to share with');
      return;
    }

    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    // In a real implementation, this would send the canvas to the selected agents
    // For demo purposes, we'll just show a success message
    alert(`Canvas shared with ${selectedAgents.length} agent(s): ${selectedAgents.map(id => {
      const agent = agents.find(a => a.id === id);
      return agent ? agent.name : id;
    }).join(', ')}`);
  };

  const requestAgentInput = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent to request input from');
      return;
    }

    // Simulate agent adding content to canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Add some demo AI-generated content
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '16px Arial';
    ctx.fillText('AI Agent Contribution:', 50, 50);
    ctx.fillText('• Analysis complete', 50, 80);
    ctx.fillText('• Recommendations ready', 50, 110);
    
    // Draw a simple diagram
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.strokeRect(200, 200, 100, 60);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('AI Output', 220, 235);
    
    saveCanvasState();
    alert('AI agents have added their contributions to the canvas!');
  };

  const tools = [
    { id: 'pen', icon: '✏️', name: 'Pen' },
    { id: 'eraser', icon: '🧽', name: 'Eraser' },
    { id: 'rectangle', icon: '⬜', name: 'Rectangle' },
    { id: 'circle', icon: '⭕', name: 'Circle' },
    { id: 'text', icon: '📝', name: 'Text' },
  ];

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500',
    '#800080', '#008000', '#ffc0cb', '#a52a2a'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborative Canvas</h1>
        <p className="text-gray-600">Create and collaborate with AI agents on visual content</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tools */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tools:</span>
            {tools.map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-md border ${
                  tool === t.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                title={t.name}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <div className="flex space-x-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 ${
                    color === c ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300"
            />
          </div>

          {/* Line Width */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{lineWidth}px</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= canvasHistory.length - 1}
              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
              title="Clear Canvas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={saveCanvas}
              className="p-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
              title="Save Canvas"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onClick={handleCanvasClick}
              className="border border-gray-300 rounded cursor-crosshair"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Collaboration Panel */}
        <div className="space-y-6">
          {/* Agent Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Collaborate with Agents</h3>
            
            <div className="space-y-2 mb-4">
              {agents.map(agent => (
                <label key={agent.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(agent.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAgents([...selectedAgents, agent.id]);
                      } else {
                        setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{agent.name}</span>
                  <span className="ml-auto text-xs text-gray-500">({agent.provider})</span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <button
                onClick={shareWithAgents}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Share Canvas
              </button>
              <button
                onClick={requestAgentInput}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Request AI Input
              </button>
            </div>
          </div>

          {/* Canvas Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Canvas Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Size: 800 × 600 px</div>
              <div>History: {canvasHistory.length} states</div>
              <div>Current tool: {tools.find(t => t.id === tool)?.name}</div>
              <div>Collaborators: {selectedAgents.length} selected</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select tools from the toolbar</li>
              <li>• Choose colors and brush size</li>
              <li>• Select agents to collaborate with</li>
              <li>• Share your canvas or request AI input</li>
              <li>• Use undo/redo for corrections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeCanvas;

