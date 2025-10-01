import { useState, useEffect } from 'react'
import { 
  Bot, 
  Search, 
  Bell, 
  Settings, 
  User, 
  Command,
  Activity,
  Zap,
  MessageSquare,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const EnhancedHeader = ({ agents = [], activeTab, onTabChange }) => {
  const [notifications, setNotifications] = useState([
    // Remove fake notifications - will be populated with real data
  ])

  const activeAgents = agents.filter(agent => agent.status === 'active').length
  const totalAgents = agents.length
  const busyAgents = agents.filter(agent => agent.status === 'processing').length

  const stats = [
    { label: 'Active', value: activeAgents, color: 'text-green-500', icon: Activity },
    { label: 'Total', value: totalAgents, color: 'text-blue-500', icon: Users },
    { label: 'Busy', value: busyAgents, color: 'text-orange-500', icon: Zap }
  ]

  return (
    <header className="fixed top-0 left-64 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Left: Stats */}
        <div className="flex items-center gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded text-sm" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <stat.icon className="h-4 w-4" style={{ color: index === 0 ? 'var(--success)' : index === 1 ? 'var(--brand)' : 'var(--orange)' }} />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
              <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative transition-all duration-200"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-white text-xs flex items-center justify-center animate-pulse" style={{ background: 'var(--error)' }}>
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass-card border-white/20">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary" className="text-xs">
                    {notifications.length} new
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                      } animate-pulse`} />
                      <span className="text-sm flex-1">{notification.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-brand-purple font-medium">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/20">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* Activity Pulse Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(to right, var(--brand), var(--cyan), var(--purple))', opacity: 0.3 }}>
        <div className="h-full animate-gradient" style={{ background: 'rgba(255, 255, 255, 0.2)' }}></div>
      </div>
    </header>
  )
}

export default EnhancedHeader