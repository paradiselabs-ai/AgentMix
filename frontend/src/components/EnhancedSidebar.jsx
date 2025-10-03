import { useState } from 'react'
import { 
  Bot, 
  Activity, 
  MessageSquare, 
  Wrench, 
  Palette,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Zap,
  Plus,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const EnhancedSidebar = ({ activeTab, onTabChange, agents = [], conversations = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      emoji: '📊',
      badge: null
    },
    {
      id: 'agents',
      label: 'AI Agents',
      emoji: '🤖',
      badge: agents.filter(a => a.status === 'active').length
    },
    {
      id: 'conversations',
      label: 'Conversations',
      emoji: '💬',
      badge: conversations.filter(c => c.status === 'active').length
    },
    {
      id: 'canvas',
      label: 'Canvas',
      emoji: '🎨',
      badge: null
    },
    {
      id: 'tools',
      label: 'Tools',
      emoji: '🛠️',
      badge: null
    }
  ]

  const quickActions = [
    { label: 'New Agent', emoji: '🤖', action: () => onTabChange('agents') },
    { label: 'Start Chat', emoji: '💬', action: () => onTabChange('conversations') },
    { label: 'Open Canvas', emoji: '🎨', action: () => onTabChange('canvas') }
  ]

  const recentItems = [
    // Remove fake recent items - will be populated with real data
  ]

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] transition-all duration-300 z-40 bg-card border-r border-border">
      <div className="flex flex-col h-full">

        {/* Search - More Spacious */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="w-full flex items-center justify-start px-4 py-3 transition-all duration-200"
                style={{
                  background: isActive ? 'var(--active-bg)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--hover-bg)')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-xl mr-3">{item.emoji}</span>
                <span className="flex-1 text-left text-sm font-medium" style={{ color: isActive ? 'var(--brand)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={`ml-2 text-xs ${
                      isActive ? 'bg-white/20 text-white border-white/30' : ''
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center px-3 py-2 text-sm transition-all duration-200"
                  style={{
                    background: 'var(--btn-secondary-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--btn-secondary-bg)'}
                >
                  <span className="text-base mr-2">{action.emoji}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {!isCollapsed && recentItems.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Recent
              </h3>
              <Star className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {recentItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          {!isCollapsed ? (
            <div className="text-center">
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>AgentMix v1.0</div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}></div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>System Online</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default EnhancedSidebar