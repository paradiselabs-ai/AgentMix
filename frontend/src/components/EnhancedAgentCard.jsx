import React, { useState } from 'react'
import { Bot, Settings, Play, Pause, Trash2, Edit3, Activity, Clock } from 'lucide-react'

const EnhancedAgentCard = ({ 
  agent, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onConfigure,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProviderColor = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'openai':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'anthropic':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'openrouter':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'ollama':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
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

  return (
    <div
      className={`
        relative group bg-white/80 backdrop-blur-md border border-white/30 
        rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300
        hover:-translate-y-1 ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Agent Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {agent.avatar ? (
                  <img src={agent.avatar} alt={agent.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  getAgentInitials(agent.name)
                )}
              </div>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                agent.status === 'active' ? 'bg-green-500' : 
                agent.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
            </div>
            
            {/* Agent Info */}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProviderColor(agent.provider)}`}>
                  {agent.provider}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className={`flex items-center space-x-1 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={() => onEdit?.(agent)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Agent"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onConfigure?.(agent)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Configure Agent"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(agent)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Agent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Agent Details */}
        <div className="space-y-3">
          {/* Model Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Model:</span>
            <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
              {agent.model || 'Not configured'}
            </span>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {agent.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Active conversations: {agent.activeConversations || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Last used: {agent.lastUsed || 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onToggleStatus?.(agent)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              agent.status === 'active'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {agent.status === 'active' ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Activate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300" />
    </div>
  )
}

export default EnhancedAgentCard

