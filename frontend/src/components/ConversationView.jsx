import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  MessageSquare, 
  Plus, 
  Users, 
  Clock,
  Send,
  Bot,
  Loader2,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react'
import ConversationControls from './ConversationControls.jsx'
import { useConversation } from '../contexts/ConversationContext.jsx'

const ConversationView = ({ agents }) => {
  const {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    socket,
  } = useConversation()
  const [messages, setMessages] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [newConversation, setNewConversation] = useState({
    name: '',
    description: '',
    participants: []
  })

  useEffect(() => {
    fetchConversations()
  }, [])

  // Subscribe to WebSocket events via context socket
  useEffect(() => {
    if (!socket) return
    const onNewMessage = (data) => {
      if (selectedConversation && data.conversation_id === selectedConversation.id) {
        setMessages(prev => {
          const exists = prev.find(msg => msg.id === data.message.id)
          if (exists) return prev
          return [...prev, data.message]
        })
      }
    }
    const onConversationStatus = (data) => {
      if (selectedConversation && data.conversation_id === selectedConversation.id) {
        setSelectedConversation(prev => ({
          ...prev,
          status: data.status
        }))
      }
    }
    socket.on('new_message', onNewMessage)
    socket.on('conversation_status', onConversationStatus)
    return () => {
      socket.off('new_message', onNewMessage)
      socket.off('conversation_status', onConversationStatus)
    }
  }, [socket, selectedConversation, setSelectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.success) {
        console.log('Fetched conversations:', data.conversations)
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return
    
    try {
      setMessagesLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      if (data.success) {
        console.log('Fetched messages:', data.messages)
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleCreateConversation = async (e) => {
    e.preventDefault()
    if (!newConversation.name || newConversation.participants.length === 0) {
      alert('Please provide a name and select at least one participant')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConversation),
      })

      const data = await response.json()
      if (data.success) {
        setNewConversation({ name: '', description: '', participants: [] })
        setShowCreateForm(false)
        await fetchConversations() // Refresh the list
        setSelectedConversation(data.conversation) // Auto-select the new conversation
      } else {
        alert('Failed to create conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error creating conversation')
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantToggle = (agentId) => {
    setNewConversation(prev => ({
      ...prev,
      participants: prev.participants.includes(agentId)
        ? prev.participants.filter(id => id !== agentId)
        : [...prev.participants, agentId]
    }))
  }

  const [editingConversation, setEditingConversation] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  const handleEditConversation = (conversation, e) => {
    e.stopPropagation() // Prevent selecting the conversation
    setEditingConversation(conversation.id)
    setEditForm({
      name: conversation.name,
      description: conversation.description || ''
    })
  }

  const handleSaveEdit = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()
      if (data.success) {
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, name: editForm.name, description: editForm.description }
            : conv
        ))
        
        // Update selected conversation if it's the one being edited
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => ({
            ...prev,
            name: editForm.name,
            description: editForm.description
          }))
        }
        
        setEditingConversation(null)
        setEditForm({ name: '', description: '' })
      } else {
        alert('Failed to update conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating conversation:', error)
      alert('Error updating conversation')
    }
  }

  const handleCancelEdit = () => {
    setEditingConversation(null)
    setEditForm({ name: '', description: '' })
  }

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation() // Prevent selecting the conversation
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        
        // Clear selection if deleted conversation was selected
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
          setMessages([])
        }
      } else {
        alert('Failed to delete conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      alert('Error deleting conversation')
    }
  }

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent ? agent.name : `Agent ${agentId}`
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Conversation</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateForm(false)}
          >
            Back to Conversations
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateConversation} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Conversation name"
                  value={newConversation.name}
                  onChange={(e) => setNewConversation(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={newConversation.description}
                  onChange={(e) => setNewConversation(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Participants</Label>
                <div className="space-y-2 mt-2">
                  {agents.filter(agent => agent.status === 'active').map(agent => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`agent-${agent.id}`}
                        checked={newConversation.participants.includes(agent.id)}
                        onChange={() => handleParticipantToggle(agent.id)}
                      />
                      <Label htmlFor={`agent-${agent.id}`}>{agent.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Conversations</h3>
            <Button 
              size="sm" 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </Button>
          </div>

          <div className="space-y-2">
            {conversations.map(conversation => (
              <Card 
                key={conversation.id} 
                className={`cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  {editingConversation === conversation.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Conversation name"
                        className="font-medium"
                      />
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(conversation.id)}
                          className="h-6 px-2"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-6 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{conversation.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                            {conversation.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEditConversation(conversation, e)}
                            className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {conversation.description && (
                        <p className="text-sm text-gray-600 mb-2">{conversation.description}</p>
                      )}
                    </>
                  )}
                  {editingConversation !== conversation.id && (
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{conversation.participants?.length || 0} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="space-y-4">
              {/* Conversation Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedConversation.name}</CardTitle>
                      <CardDescription>
                        {selectedConversation.participants?.map(id => getAgentName(id)).join(', ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}>
                        {selectedConversation.status}
                      </Badge>
                      <Badge variant="outline">
                        {selectedConversation.participants?.length || 0} agents
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Conversation Controls */}
              <ConversationControls 
                conversation={selectedConversation}
              />

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Live Messages ({messages.length})</span>
                    {messagesLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the AI conversation to begin!</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div key={message.id} className="flex space-x-3 animate-fade-in">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.sender_name}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-500 text-center">
                  Choose a conversation from the list to view messages
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationView

