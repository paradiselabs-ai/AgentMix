import React, { useState, useEffect } from 'react'
import { 
  Wrench, 
  Calculator, 
  Globe, 
  FileText, 
  Code, 
  Search,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Bot,
  Activity,
  BarChart3,
  Database,
  Mail,
  Calendar,
  Image,
  Music,
  Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const EnhancedToolsManager = ({ agents = [] }) => {
  const [tools, setTools] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCreating, setIsCreating] = useState(false)
  const [editingTool, setEditingTool] = useState(null)
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: 'utility',
    parameters: '',
    code: '',
    status: 'active'
  })

  const toolCategories = [
    { id: 'all', label: 'All Tools', icon: Wrench },
    { id: 'calculation', label: 'Calculation', icon: Calculator },
    { id: 'web', label: 'Web & API', icon: Globe },
    { id: 'file', label: 'File Operations', icon: FileText },
    { id: 'code', label: 'Code & Development', icon: Code },
    { id: 'data', label: 'Data Processing', icon: Database },
    { id: 'communication', label: 'Communication', icon: Mail },
    { id: 'media', label: 'Media & Content', icon: Image },
    { id: 'utility', label: 'Utilities', icon: Settings }
  ]

  const builtInTools = [
    // Built-in tools will be loaded from API
  ]

  useEffect(() => {
    fetchTools();
  }, [])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const data = await response.json();
      if (data.success) {
        setTools(data.tools || []);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      // Fallback to empty array if API fails
      setTools([]);
    }
  };

  const getToolIcon = (category) => {
    const categoryData = toolCategories.find(cat => cat.id === category)
    return categoryData?.icon || Wrench
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        }
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          iconColor: 'text-gray-600'
        }
      case 'error':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-600'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          iconColor: 'text-gray-600'
        }
    }
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTool = () => {
    const tool = {
      id: tools.length + 1,
      ...newTool,
      usageCount: 0,
      lastUsed: 'Never',
      assignedAgents: 0,
      isBuiltIn: false
    }
    setTools([...tools, tool])
    setNewTool({
      name: '',
      description: '',
      category: 'utility',
      parameters: '',
      code: '',
      status: 'active'
    })
    setIsCreating(false)
  }

  const toggleToolStatus = (toolId) => {
    setTools(tools.map(tool => 
      tool.id === toolId 
        ? { ...tool, status: tool.status === 'active' ? 'inactive' : 'active' }
        : tool
    ))
  }

  const ToolCard = ({ tool }) => {
    const IconComponent = tool.icon || getToolIcon(tool.category)
    const statusConfig = getStatusConfig(tool.status)
    const StatusIcon = statusConfig.icon

    return (
      <Card className="glass-card card-hover border-white/30 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-teal rounded-xl flex items-center justify-center animate-float-gentle">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{tool.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
                {tool.status}
              </Badge>
              {tool.isBuiltIn && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Built-in
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {tool.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{tool.usageCount}</div>
              <div className="text-xs text-muted-foreground">Uses</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-teal">{tool.assignedAgents}</div>
              <div className="text-xs text-muted-foreground">Agents</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-orange">
                {tool.lastUsed === 'Never' ? '—' : tool.lastUsed.split(' ')[0]}
              </div>
              <div className="text-xs text-muted-foreground">Last Used</div>
            </div>
          </div>

          {tool.parameters && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Parameters
              </h4>
              <div className="flex flex-wrap gap-1">
                {tool.parameters.map((param, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white/50 border-white/30">
                    {param}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => toggleToolStatus(tool.id)}
              className={`flex-1 ${
                tool.status === 'active'
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
              variant="outline"
            >
              {tool.status === 'active' ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Disable
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Enable
                </>
              )}
            </Button>

            {!tool.isBuiltIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTool(tool)}
                className="bg-white/50 border-white/30 hover:bg-white/70"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 border-white/30 hover:bg-white/70"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-md gradient-text">Tools Manager</h2>
          <p className="text-body text-muted-foreground">Manage AI tools and assign them to agents</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tool</DialogTitle>
              <DialogDescription>
                Build a custom tool for your AI agents to use
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tool Name
                  </label>
                  <Input
                    placeholder="Enter tool name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                    className="glass-card border-white/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={newTool.category} onValueChange={(value) => setNewTool({...newTool, category: value})}>
                    <SelectTrigger className="glass-card border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toolCategories.slice(1).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Describe what this tool does"
                  value={newTool.description}
                  onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                  className="glass-card border-white/30"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Parameters (one per line)
                </label>
                <Textarea
                  placeholder="param1: string&#10;param2: number&#10;param3?: boolean"
                  value={newTool.parameters}
                  onChange={(e) => setNewTool({...newTool, parameters: e.target.value})}
                  className="glass-card border-white/30"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Implementation Code
                </label>
                <Textarea
                  placeholder="function execute(params) {&#10;  // Your tool logic here&#10;  return result;&#10;}"
                  value={newTool.code}
                  onChange={(e) => setNewTool({...newTool, code: e.target.value})}
                  className="glass-card border-white/30 font-mono text-sm"
                  rows={6}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="glass-card border-white/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTool}
                disabled={!newTool.name || !newTool.description}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white"
              >
                Create Tool
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/30"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 glass-card border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toolCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {tools.filter(t => t.status === 'active').length} Active
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {tools.filter(t => t.status === 'inactive').length} Inactive
          </Badge>
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <Card className="glass-card border-white/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-teal rounded-2xl flex items-center justify-center mb-6 animate-float-gentle">
              <Wrench className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-display-sm text-foreground mb-2">No Tools Found</h3>
            <p className="text-body text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first custom tool to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tool
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Usage Statistics */}
      <Card className="glass-card border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-purple" />
            Tool Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {tools.reduce((sum, tool) => sum + tool.usageCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-teal mb-1">
                {tools.filter(t => t.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-pink mb-1">
                {tools.filter(t => !t.isBuiltIn).length}
              </div>
              <div className="text-sm text-muted-foreground">Custom Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-orange mb-1">
                {agents.length}
              </div>
              <div className="text-sm text-muted-foreground">Connected Agents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedToolsManager