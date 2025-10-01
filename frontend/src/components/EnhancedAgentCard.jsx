import React, { useState } from 'react'
import { Bot, Settings, Play, Pause, Trash2, Edit3, Activity, Clock, MessageSquare, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const EnhancedAgentCard = ({ 
  agent, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onTest,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          label: 'Active',
          pulse: true
        }
      case 'processing':
        return {
          color: 'bg-brand-pink',
          textColor: 'text-brand-pink',
          bgColor: 'bg-pink-50 border-pink-200',
          label: 'Processing',
          pulse: true
        }
      case 'error':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          label: 'Error',
          pulse: false
        }
      default:
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          label: 'Inactive',
          pulse: false
        }
    }
  }

  const getProviderConfig = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'openai':
        return { color: 'bg-green-500', textColor: 'text-green-700', name: 'OpenAI' }
      case 'anthropic':
        return { color: 'bg-orange-500', textColor: 'text-orange-700', name: 'Anthropic' }
      case 'openrouter':
        return { color: 'bg-blue-500', textColor: 'text-blue-700', name: 'OpenRouter' }
      case 'ollama':
        return { color: 'bg-purple-500', textColor: 'text-purple-700', name: 'Ollama' }
      default:
        return { color: 'bg-gray-500', textColor: 'text-gray-700', name: provider || 'Unknown' }
    }
  }

  const getAgentInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const statusConfig = getStatusConfig(agent.status)
  const providerConfig = getProviderConfig(agent.provider)

  return (
    <Card
      className={`glass-card card-hover group border-white/30 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Agent Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-teal rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg animate-float-gentle">
                {agent.avatar ? (
                  <img src={agent.avatar} alt={agent.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  getAgentInitials(agent.name)
                )}
              </div>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusConfig.color} ${
                statusConfig.pulse ? 'animate-pulse' : ''
              }`} />
            </div>
            
            {/* Agent Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-lg">{agent.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Star className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${providerConfig.color}`} />
                <span className="text-sm text-muted-foreground font-medium">
                  {providerConfig.name}
                </span>
                <Badge className={`text-xs ${statusConfig.bgColor} ${statusConfig.textColor} border`}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Favorite Star */}
          <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(agent)}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Agent Details */}
        <div className="space-y-3 mb-4">
          {/* Model Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Model:</span>
            <Badge variant="outline" className="bg-white/50 border-white/30">
              {agent.model || 'Not configured'}
            </Badge>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {agent.description}
            </p>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{agent.messageCount || 0}</div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-brand-teal">{agent.accuracy || '95'}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-brand-orange">{agent.responseTime || '1.2'}s</div>
              <div className="text-xs text-muted-foreground">Response</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onToggleStatus?.(agent)}
            className={`flex-1 transition-all duration-200 ${
              agent.status === 'active'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
            variant="outline"
          >
            {agent.status === 'active' ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest?.(agent)}
            className="bg-white/50 border-white/30 hover:bg-white/70"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Test
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(agent)}
            className="bg-white/50 border-white/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last used: {agent.lastUsed || 'Never'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>{agent.activeConversations || 0} active</span>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-brand-purple/20 transition-colors duration-300" />
    </Card>
  )
}

export default EnhancedAgentCard