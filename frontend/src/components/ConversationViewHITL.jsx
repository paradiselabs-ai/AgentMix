import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  MessageSquare, 
  Plus, 
  Users, 
  Clock,
  Send,
  Bot,
  Loader2,
  User,
  Settings,
  Pause,
  Play,
  AlertCircle,
  MessageCircle,
  Bell
} from 'lucide-react'
import ConversationControls from './ConversationControls.jsx'
import { useConversation } from '../contexts/ConversationContext.jsx'

const ConversationViewHITL = ({ agents }) => {
  const {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    conversationStatus,
    humanInputRequest,
    humanMessage,
    setHumanMessage,
    isTyping,
    setIsTyping,
    socket,
    pauseConversation,
    resumeConversation,
    sendHumanMessage,
  } = useConversation()
  const [messages, setMessages] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  
  // HITL specific state
  const [sendingMessage, setSendingMessage] = useState(false)
  
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const [newConversation, setNewConversation] = useState({
    name: '',
    description: '',
    participants: []
  })

  useEffect(() => {
    fetchConversations()
  }, [])

  // Subscribe to real-time events via context socket
  useEffect(() => {
    if (!socket || !selectedConversation) return
    const onNewMessage = (data) => {
      if (data.conversation_id === selectedConversation.id) {
        setMessages(prev => [...prev, data.message])
        scrollToBottom()
      }
    }
    const onUserTyping = (data) => {
      if (data.conversation_id === selectedConversation.id) {
        console.log(`${data.user_name} is ${data.typing ? 'typing' : 'not typing'}`)
      }
    }
    socket.on('new_message', onNewMessage)
    socket.on('user_typing', onUserTyping)
    return () => {
      socket.off('new_message', onNewMessage)
      socket.off('user_typing', onUserTyping)
    }
  }, [socket, selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (conversationId) => {
    try {
      // Temporary confirm; replace with styled dialog later
      if (!window.confirm('Delete this conversation? This cannot be undone.')) return
      const res = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId))
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
          setMessages([])
        }
      } else {
        console.error('Delete failed:', data?.error)
      }
    } catch (e) {
      console.error('Error deleting conversation:', e)
    }
  }

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendHumanMessage = async () => {
    if (!humanMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    try {
      sendHumanMessage(selectedConversation.id, humanMessage.trim(), 'User')
      setHumanMessage('')
    } catch (error) {
      console.error('Error sending human message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleTyping = (value) => {
    setHumanMessage(value)
    
    if (!isTyping && socket && selectedConversation) {
      setIsTyping(true)
      socket.emit('typing_start', {
        conversation_id: selectedConversation.id,
        user_name: 'User'
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket && selectedConversation) {
        socket.emit('typing_stop', {
          conversation_id: selectedConversation.id,
          user_name: 'User'
        })
      }
    }, 1000)
  }

  const handlePauseConversation = () => {
    if (selectedConversation) {
      pauseConversation(selectedConversation.id)
    }
  }

  const handleResumeConversation = () => {
    if (selectedConversation) {
      resumeConversation(selectedConversation.id)
    }
  }

  const createConversation = async () => {
    if (!newConversation.name.trim() || newConversation.participants.length < 2) {
      return
    }

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConversation),
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(prev => [...prev, data.conversation])
        setNewConversation({ name: '', description: '', participants: [] })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === parseInt(agentId))
    return agent ? agent.name : `Agent ${agentId}`
  }

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'human':
        return <User className="h-4 w-4" />
      case 'ai':
        return <Bot className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getMessageStyle = (messageType) => {
    switch (messageType) {
      case 'human':
        return 'bg-blue-50 border-blue-200'
      case 'ai':
        return 'bg-green-50 border-green-200'
      case 'system':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="flow-container">
      <div className="breathing-space">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Conversations</h2>
            <p className="text-gray-600">Create and manage AI-to-AI conversations with human oversight and guidance</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="glass-button interactive-hover flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Human Input Request Alert */}
      {humanInputRequest && (
        <Card className="border-orange-200 bg-orange-50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  {humanInputRequest.requesting_agent} needs your input
                </p>
                <p className="text-sm text-orange-700">
                  {humanInputRequest.request_message}
                </p>
              </div>
              <Bell className="h-4 w-4 text-orange-600 animate-bounce" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Conversation Form */}
      {showCreateForm && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Create New Conversation</CardTitle>
            <CardDescription>Set up a new AI collaboration session in AgentMix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conv-name">Conversation Name</Label>
              <Input
                id="conv-name"
                placeholder="Enter conversation name"
                value={newConversation.name}
                onChange={(e) => setNewConversation(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="conv-desc">Description</Label>
              <Textarea
                id="conv-desc"
                placeholder="Describe the conversation topic"
                value={newConversation.description}
                onChange={(e) => setNewConversation(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Participants</Label>
              <div className="space-y-2">
                {agents.filter(agent => agent.status === 'active').map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`agent-${agent.id}`}
                      checked={newConversation.participants.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewConversation(prev => ({
                            ...prev,
                            participants: [...prev.participants, agent.id]
                          }))
                        } else {
                          setNewConversation(prev => ({
                            ...prev,
                            participants: prev.participants.filter(id => id !== agent.id)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`agent-${agent.id}`} className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <span>{agent.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={createConversation} disabled={!newConversation.name.trim() || newConversation.participants.length < 2}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        No conversations yet. Create one to get started.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  conversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors card-hover ${
                        selectedConversation?.id === conversation.id
                          ? 'ring-2 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium truncate">{conversation.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="ml-2">
                              {conversation.status}
                            </Badge>
                            <button
                              className="text-red-600 text-xs hover:underline"
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id) }}
                              title="Delete conversation"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {conversation.description && (
                          <p className="text-sm text-muted-foreground mb-2 truncate">
                            {conversation.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{conversation.participants.length} participants</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>{selectedConversation.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conversationStatus[selectedConversation.id]?.paused ? (
                      <Button size="sm" onClick={handleResumeConversation} className="button-glow">
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={handlePauseConversation}>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {selectedConversation.description || 'No description'}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {selectedConversation.participants.map((agentId) => (
                    <Badge key={agentId} variant="secondary" className="text-xs">
                      <Bot className="h-3 w-3 mr-1" />
                      {getAgentName(agentId)}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <ConversationControls 
                    conversation={selectedConversation}
                    onStatusChange={(status) => {
                      setSelectedConversation(prev => ({ ...prev, status }))
                    }}
                  />
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96 border rounded-lg p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No messages in this conversation yet
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg border ${getMessageStyle(message.message_type || message.sender_type)} animate-fade-in-up`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getMessageIcon(message.message_type || message.sender_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.sender_name || message.sender_id || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Human Input Interface */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Your Input</span>
                    {isTyping && <span className="text-xs text-muted-foreground">Typing...</span>}
                  </div>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message to join the conversation..."
                      value={humanMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendHumanMessage()
                        }
                      }}
                      className="flex-1 min-h-[60px] focus-ring"
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={handleSendHumanMessage}
                      disabled={!humanMessage.trim() || sendingMessage}
                      className="button-glow"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Choose a conversation from the list to view messages and participate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationViewHITL

