import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
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
  Clock
} from 'lucide-react'
import AgentForm from './AgentForm.jsx'

const AgentList = ({ agents, loading, onAgentUpdated, onAgentSelect }) => {
  const [editingAgent, setEditingAgent] = useState(null)
  const [testingAgent, setTestingAgent] = useState(null)

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
      if (data.success) {
        alert('Connection successful! Response: ' + data.response)
        onAgentUpdated()
      } else {
        alert('Connection failed: ' + data.error)
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Error testing connection')
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

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No AI Agents</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first AI agent
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {editingAgent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit AI Agent</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(agent.status)}
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {agent.provider} • {agent.model}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(agent.created_at).toLocaleDateString()}</p>
                {agent.config?.system_message && (
                  <p className="mt-1 truncate">
                    System: {agent.config.system_message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusToggle(agent)}
                  className="flex items-center space-x-1"
                >
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="h-3 w-3" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Activate</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(agent)}
                  disabled={testingAgent === agent.id}
                  className="flex items-center space-x-1"
                >
                  {testingAgent === agent.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MessageSquare className="h-3 w-3" />
                  )}
                  <span>Test</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingAgent(agent)}
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-3 w-3" />
                  <span>Edit</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteAgent(agent)}
                  className="flex items-center space-x-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AgentList

