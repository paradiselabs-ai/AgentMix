import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  MessageSquare, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Grid,
  List
} from 'lucide-react'
import AgentForm from './AgentForm.jsx'
import EnhancedAgentCard from './EnhancedAgentCard.jsx'

const AgentList = ({ agents, loading, onAgentUpdated, onAgentSelect }) => {
  const [editingAgent, setEditingAgent] = useState(null)
  const [testingAgent, setTestingAgent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleStatusToggle = async (agent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        onAgentUpdated()
      } else {
        alert('Error updating agent status: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating agent status:', error)
      alert('Error updating agent status')
    }
  }

  const handleTestConnection = async (agent) => {
    setTestingAgent(agent.id)
    
    try {
      const response = await fetch(`/api/agents/${agent.id}/test`, {
        method: 'POST',
      })

      const data = await response.json()
      setTestingAgent(null)
      
      if (data.success) {
        alert(`✅ ${agent.name} Test Successful!\n\nProvider: ${agent.provider}\nModel: ${agent.model}\n\nResponse: ${data.response}\n\nThis agent is ready to use in conversations!`)
        onAgentUpdated()
      } else {
        alert(`❌ ${agent.name} Test Failed!\n\nProvider: ${agent.provider}\nModel: ${agent.model}\n\nError: ${data.error}\n\nPlease check:\n- API key is valid\n- Model name is correct for this provider\n- Provider service is available`)
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setTestingAgent(null)
      alert(`❌ ${agent.name} Test Error!\n\nCould not connect to test endpoint.\n\nError: ${error.message}`)
    } finally {
      setTestingAgent(null)
    }
  }

  const handleDeleteAgent = async (agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        onAgentUpdated()
      } else {
        alert('Error deleting agent: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
      alert('Error deleting agent')
    }
  }

  const handleEditSuccess = () => {
    setEditingAgent(null)
    onAgentUpdated()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading agents...</span>
      </div>
    )
  }

  // Filter and search agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.model?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (agents.length === 0) {
    return (
      <Card className="glass-card border-white/30">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-teal rounded-2xl flex items-center justify-center mb-6 animate-float-gentle">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-display-sm text-foreground mb-2">No AI Agents Yet</h3>
          <p className="text-body text-muted-foreground text-center mb-6 max-w-md">
            Create your first AI agent to start collaborating with artificial intelligence
          </p>
          <Button className="bg-brand-purple hover:bg-brand-purple/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Agent
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {editingAgent && (
        <Card className="glass-card border-white/30 mb-6">
          <CardHeader>
            <CardTitle className="text-display-sm gradient-text">Edit AI Agent</CardTitle>
            <CardDescription>
              Update the configuration for "{editingAgent.name}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentForm
              agent={editingAgent}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingAgent(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/30 focus:border-brand-purple/50"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg glass-card border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/50 rounded-lg p-1 border border-white/30">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAgents.length} of {agents.length} agents
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {agents.filter(a => a.status === 'active').length} Active
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {agents.filter(a => a.status === 'inactive').length} Inactive
          </Badge>
        </div>
      </div>

      {/* Agent Grid/List */}
      {filteredAgents.length === 0 ? (
        <Card className="glass-card border-white/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredAgents.map((agent) => (
            <EnhancedAgentCard
              key={agent.id}
              agent={agent}
              onEdit={setEditingAgent}
              onDelete={handleDeleteAgent}
              onToggleStatus={handleStatusToggle}
              onTest={handleTestConnection}
              isTesting={testingAgent === agent.id}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AgentList