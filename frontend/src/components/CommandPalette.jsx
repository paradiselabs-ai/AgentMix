import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bot, 
  MessageSquare, 
  Palette, 
  Wrench, 
  Settings, 
  Plus,
  Play,
  Pause,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Command,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const commands = [
    // Navigation
    { 
      id: 'nav-dashboard', 
      title: 'Go to Dashboard', 
      description: 'View platform overview and analytics',
      icon: Bot, 
      category: 'Navigation',
      action: () => onNavigate('dashboard'),
      shortcut: 'D'
    },
    { 
      id: 'nav-agents', 
      title: 'Go to AI Agents', 
      description: 'Manage your AI agents',
      icon: Bot, 
      category: 'Navigation',
      action: () => onNavigate('agents'),
      shortcut: 'A'
    },
    { 
      id: 'nav-conversations', 
      title: 'Go to Conversations', 
      description: 'View AI conversations',
      icon: MessageSquare, 
      category: 'Navigation',
      action: () => onNavigate('conversations'),
      shortcut: 'C'
    },
    { 
      id: 'nav-tools', 
      title: 'Go to Tools', 
      description: 'Manage AI tools and plugins',
      icon: Wrench, 
      category: 'Navigation',
      action: () => onNavigate('tools'),
      shortcut: 'T'
    },
    { 
      id: 'nav-canvas', 
      title: 'Go to Canvas', 
      description: 'Open collaborative canvas',
      icon: Palette, 
      category: 'Navigation',
      action: () => onNavigate('canvas'),
      shortcut: 'V'
    },
    
    // Quick Actions
    { 
      id: 'create-agent', 
      title: 'Create New Agent', 
      description: 'Set up a new AI agent',
      icon: Plus, 
      category: 'Quick Actions',
      action: () => {
        onNavigate('agents')
        // Trigger agent creation
      }
    },
    { 
      id: 'start-conversation', 
      title: 'Start New Conversation', 
      description: 'Begin AI-to-AI collaboration',
      icon: MessageSquare, 
      category: 'Quick Actions',
      action: () => {
        onNavigate('conversations')
        // Trigger conversation creation
      }
    },
    { 
      id: 'open-canvas', 
      title: 'Open Canvas', 
      description: 'Launch visual collaboration workspace',
      icon: Palette, 
      category: 'Quick Actions',
      action: () => onNavigate('canvas')
    },
    { 
      id: 'create-tool', 
      title: 'Create Custom Tool', 
      description: 'Build a new tool for agents',
      icon: Wrench, 
      category: 'Quick Actions',
      action: () => {
        onNavigate('tools')
        // Trigger tool creation
      }
    },
    
    // Agent Management
    { 
      id: 'activate-all-agents', 
      title: 'Activate All Agents', 
      description: 'Enable all inactive agents',
      icon: Play, 
      category: 'Agent Management',
      action: () => console.log('Activating all agents')
    },
    { 
      id: 'pause-all-agents', 
      title: 'Pause All Agents', 
      description: 'Disable all active agents',
      icon: Pause, 
      category: 'Agent Management',
      action: () => console.log('Pausing all agents')
    },
    
    // System
    { 
      id: 'export-data', 
      title: 'Export Platform Data', 
      description: 'Download conversations and settings',
      icon: Download, 
      category: 'System',
      action: () => console.log('Exporting data')
    },
    { 
      id: 'import-data', 
      title: 'Import Configuration', 
      description: 'Upload agents and settings',
      icon: Upload, 
      category: 'System',
      action: () => console.log('Importing data')
    },
    { 
      id: 'settings', 
      title: 'Open Settings', 
      description: 'Configure platform preferences',
      icon: Settings, 
      category: 'System',
      action: () => console.log('Opening settings')
    },
    
    // Recent Actions
    { 
      id: 'recent-1', 
      title: 'Research Agent', 
      description: 'Last used 2 minutes ago',
      icon: Clock, 
      category: 'Recent',
      action: () => console.log('Opening Research Agent')
    },
    { 
      id: 'recent-2', 
      title: 'Data Analysis Chat', 
      description: 'Last used 5 minutes ago',
      icon: Clock, 
      category: 'Recent',
      action: () => console.log('Opening Data Analysis Chat')
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(command)
    return groups
  }, {})

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  const executeCommand = (command) => {
    command.action()
    onClose()
    setQuery('')
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Navigation': return ArrowRight
      case 'Quick Actions': return Plus
      case 'Agent Management': return Bot
      case 'System': return Settings
      case 'Recent': return Clock
      default: return Command
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Navigation': return 'text-brand-purple'
      case 'Quick Actions': return 'text-brand-teal'
      case 'Agent Management': return 'text-brand-pink'
      case 'System': return 'text-brand-orange'
      case 'Recent': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  let commandIndex = 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/30 max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/20">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none bg-transparent focus:ring-0 focus:outline-none text-lg placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 text-xs bg-muted rounded border">ESC</kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No commands found</h3>
              <p className="text-sm text-muted-foreground">
                Try searching for something else
              </p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => {
              const CategoryIcon = getCategoryIcon(category)
              const categoryColor = getCategoryColor(category)
              
              return (
                <div key={category} className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <CategoryIcon className={`h-3 w-3 ${categoryColor}`} />
                    {category}
                  </div>
                  
                  {categoryCommands.map((command) => {
                    const isSelected = commandIndex === selectedIndex
                    const currentIndex = commandIndex++
                    const IconComponent = command.icon
                    
                    return (
                      <div
                        key={command.id}
                        className={`flex items-center gap-3 px-3 py-3 mx-1 rounded-lg cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-brand-purple/10 border border-brand-purple/20' 
                            : 'hover:bg-white/50'
                        }`}
                        onClick={() => executeCommand(command)}
                      >
                        <div className={`p-2 rounded-lg ${
                          isSelected 
                            ? 'bg-brand-purple text-white' 
                            : 'bg-white/80 text-muted-foreground'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {command.title}
                            </span>
                            {command.shortcut && (
                              <Badge variant="outline" className="text-xs bg-white/50 border-white/30">
                                {command.shortcut}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {command.description}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs bg-muted rounded border">↵</kbd>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/20 bg-white/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">ESC</kbd>
              <span>Close</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommandPalette