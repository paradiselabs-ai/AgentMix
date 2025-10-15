import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Send, 
  Play, 
  Pause, 
  Square, 
  Users, 
  Settings, 
  Download,
  Copy,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConversation } from '../contexts/ConversationContext'

const EnhancedConversationView = ({ agents = [], onNavigateToAgents }) => {
  const { socket } = useConversation()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedAgents, setSelectedAgents] = useState([])
  const [conversationName, setConversationName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState(false)
  const [startingConversation, setStartingConversation] = useState(false)
  const [stoppingConversation, setStoppingConversation] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  // WebSocket real-time message updates
  useEffect(() => {
    if (!socket || !selectedConversation) return

    const handleNewMessage = (data) => {
      console.log('New message received:', data)
      if (data.conversation_id === selectedConversation.id) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.find(msg => msg.id === data.message?.id)
          if (exists) return prev
          return [...prev, data.message]
        })
      }
    }

    const handleConversationStatus = (data) => {
      console.log('Conversation status:', data)
      if (data.conversation_id === selectedConversation.id) {
        setIsActive(data.status === 'active')
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('conversation_status', handleConversationStatus)
    socket.on('conversation_started', handleConversationStatus)
    socket.on('conversation_stopped', handleConversationStatus)

    // Join conversation room
    socket.emit('join_conversation', { conversation_id: selectedConversation.id })

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('conversation_status', handleConversationStatus)
      socket.off('conversation_started', handleConversationStatus)
      socket.off('conversation_stopped', handleConversationStatus)
      socket.emit('leave_conversation', { conversation_id: selectedConversation.id })
    }
  }, [socket, selectedConversation])

  const [autoScroll, setAutoScroll] = useState(true)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Detect if user is scrolling up (disable auto-scroll)
  const handleScroll = (e) => {
    const element = e.target
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100
    setAutoScroll(isAtBottom)
  }

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true)
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const createConversation = async () => {
    if (!conversationName.trim() || selectedAgents.length < 2) {
      alert('Please provide a name and select at least 2 agents')
      return
    }

    try {
      setCreatingConversation(true)
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: conversationName,
          participants: selectedAgents,
          description: `Conversation between ${selectedAgents.length} agents`
        }),
      })

      const data = await response.json()
      if (data.success) {
        setConversations([...conversations, data.conversation])
        setSelectedConversation(data.conversation)
        setIsCreating(false)
        setConversationName('')
        setSelectedAgents([])
      } else {
        alert('❌ Failed to create conversation\n\n🔧 Troubleshooting:\n• Ensure conversation name is provided\n• Select at least 2 active agents\n• Check backend server is running\n• Verify agents have valid configurations\n\n💡 Tip: Test agents individually before creating conversations')
        setCreatingConversation(false)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error creating conversation')
    } finally {
      setCreatingConversation(false)
    }
  }

  const startConversation = async () => {
    if (!selectedConversation) return

    try {
      setStartingConversation(true)
      const response = await fetch(`/api/conversations/${selectedConversation.id}/start`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        setIsActive(true)
        fetchMessages(selectedConversation.id)
      } else {
        alert('❌ Failed to start conversation\n\n🔧 Troubleshooting:\n• Ensure all selected agents are active\n• Check agents have valid API keys\n• Verify backend server is running\n• Try refreshing the page\n\n💡 Tip: Test each agent individually first using the "Test" button')
        setStartingConversation(false)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Error starting conversation')
    } finally {
      setStartingConversation(false)
    }
  }

  const stopConversation = async () => {
    if (!selectedConversation) return

    try {
      setStoppingConversation(true)
      const response = await fetch(`/api/conversations/${selectedConversation.id}/stop`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        setIsActive(false)
      } else {
        alert('❌ Failed to stop conversation\n\n🔧 Troubleshooting:\n• Check backend server connection\n• Conversation may have already stopped\n• Try refreshing the page\n• Contact support if issue persists')
        setStoppingConversation(false)
      }
    } catch (error) {
      console.error('Error stopping conversation:', error)
      alert('Error stopping conversation')
    } finally {
      setStoppingConversation(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageToSend = newMessage.trim()
    setNewMessage('')
    setSendingMessage(true)

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: 'human',
          content: messageToSend,
          message_type: 'text'
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages([...messages, data.message])
      } else {
        alert('❌ Failed to send message\n\n🔧 Troubleshooting:\n• Check conversation is still active\n• Verify backend server connection\n• Ensure message is not empty\n• Try refreshing the page\n\n💡 Tip: If conversation stopped unexpectedly, check agent API keys')
        setNewMessage(messageToSend) // Restore message on error
        setSendingMessage(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
      setNewMessage(messageToSend) // Restore message on error
    } finally {
      setSendingMessage(false)
    }
  }

  const MessageBubble = ({ message }) => {
    const isHuman = message.sender_id === 'human'
    const agent = agents.find(a => a.id === message.sender_id)
    const senderName = isHuman ? 'You' : (agent?.name || 'Unknown Agent')

    return (
      <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in-up`}>
        <div className={`max-w-[70%] ${isHuman ? 'order-2' : 'order-1'}`}>
          <div className="flex items-center gap-2 mb-1">
            {!isHuman && (
              <div className="w-6 h-6 bg-gradient-to-br from-brand-purple to-brand-teal rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-xs text-muted-foreground font-medium">{senderName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {isHuman && (
              <div className="w-6 h-6 bg-gradient-to-br from-brand-pink to-brand-orange rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${
            isHuman 
              ? 'bg-brand-purple/20 border border-brand-purple/30' 
              : 'bg-gray-800/90 border border-gray-700/50'
          }`}>
            <p className={`text-sm leading-relaxed ${
              isHuman ? 'text-white' : 'text-gray-100'
            }`}>{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  const ConversationCard = ({ conversation }) => (
    <Card 
      className={`glass-card card-hover cursor-pointer border-white/30 ${
        selectedConversation?.id === conversation.id ? 'ring-2 ring-brand-purple/50' : ''
      }`}
      onClick={() => setSelectedConversation(conversation)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground truncate">{conversation.name}</h3>
          <Badge className={`ml-2 ${
            conversation.status === 'active' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {conversation.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {conversation.description || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {conversation.participants?.length || 0} agents
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {conversation.message_count || 0} messages
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-display-sm text-foreground">Conversations</h2>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card border-white/30"
          />
        </div>

        {/* Create New Conversation */}
        {isCreating && (
          <Card className="glass-card border-white/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Conversation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select at least 2 AI agents to start a collaborative conversation
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Conversation Name *
                </label>
                <Input
                  placeholder="e.g., Product Strategy Discussion"
                  value={conversationName}
                  onChange={(e) => setConversationName(e.target.value)}
                  className="glass-card border-white/30 text-foreground"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Select Agents ({selectedAgents.length} selected, minimum 2 required)
                </label>
                
                {agents.length === 0 ? (
                  <Card className="glass-card border-dashed border-white/30 bg-white/5">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Agents Available</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        You need to create AI agents before you can start conversations
                      </p>
                      <Button 
                        variant="outline" 
                        className="glass-card border-white/30"
                        onClick={onNavigateToAgents}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Agent
                      </Button>
                    </CardContent>
                  </Card>
                ) : agents.filter(a => a.status === 'active').length === 0 ? (
                  <Card className="glass-card border-dashed border-white/30 bg-white/5">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Active Agents</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        You have {agents.length} agent{agents.length !== 1 ? 's' : ''}, but none are active. 
                        Configure your agents with valid API keys to make them active.
                      </p>
                      <Button 
                        variant="outline" 
                        className="glass-card border-white/30"
                        onClick={onNavigateToAgents}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Agents
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {agents.filter(a => a.status === 'active').map(agent => (
                      <Card 
                        key={agent.id}
                        className={`glass-card border-white/30 cursor-pointer transition-all duration-200 ${
                          selectedAgents.includes(agent.id) 
                            ? 'ring-2 ring-brand-purple/50 bg-brand-purple/5' 
                            : 'hover:bg-white/5'
                        }`}
                        onClick={() => {
                          if (selectedAgents.includes(agent.id)) {
                            setSelectedAgents(selectedAgents.filter(id => id !== agent.id))
                          } else {
                            setSelectedAgents([...selectedAgents, agent.id])
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                              selectedAgents.includes(agent.id)
                                ? 'bg-brand-purple border-brand-purple'
                                : 'border-gray-300 hover:border-brand-purple/50'
                            }`}>
                              {selectedAgents.includes(agent.id) && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <h4 className="font-medium text-foreground mb-1.5 break-words">{agent.name}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs whitespace-nowrap">
                                    {agent.provider}
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs truncate max-w-[200px]" title={agent.model}>
                                    {agent.model}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Active agent ready for conversation
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {selectedAgents.length > 0 && selectedAgents.length < 2 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please select at least 2 agents for a conversation</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={createConversation}
                  disabled={!conversationName.trim() || selectedAgents.length < 2 || creatingConversation}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-white"
                >
                  {creatingConversation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Create Conversation
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setConversationName('')
                    setSelectedAgents([])
                  }}
                  variant="outline"
                  className="glass-card border-white/30"
                  disabled={creatingConversation}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversations List */}
        <div className="space-y-3 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <Card className="glass-card border-white/30">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Conversations</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create your first AI-to-AI conversation
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map(conversation => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header - FIXED POSITION */}
            <Card className="glass-card border-white/30 mb-4 sticky top-0 z-10 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participants?.length || 0} participants • {messages.length} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      isActive 
                        ? 'bg-green-100 text-green-800 border-green-200 animate-pulse' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {isActive ? '🟢 Active' : '⚫ Inactive'}
                    </Badge>
                  </div>
                </div>
                
                {/* HITL Controls */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  {!isActive ? (
                    <Button
                      onClick={startConversation}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={startingConversation}
                    >
                      {startingConversation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Conversation
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={stopConversation}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={stoppingConversation}
                      >
                        {stoppingConversation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Stopping...
                          </>
                        ) : (
                          <>
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={stopConversation}
                        size="sm"
                        variant="outline"
                        className="glass-card border-white/30"
                        disabled={stoppingConversation}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => setAutoScroll(!autoScroll)}
                    size="sm"
                    variant="outline"
                    className={`glass-card border-white/30 ${
                      autoScroll ? 'bg-brand-purple/10' : ''
                    }`}
                    title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
                  >
                    {autoScroll ? '📍' : '🔓'} {autoScroll ? 'Auto-scroll' : 'Manual'}
                  </Button>
                  
                  <Button
                    onClick={scrollToBottom}
                    size="sm"
                    variant="outline"
                    className="glass-card border-white/30"
                  >
                    ⬇️ Jump to Bottom
                  </Button>
                  
                  <div className="flex-1" />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card border-white/30"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="glass-card border-white/30 flex-1 flex flex-col overflow-hidden">
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto space-y-4 mb-4"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-teal rounded-2xl flex items-center justify-center mb-4 animate-float-gentle">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Ready to Start</h3>
                      <p className="text-sm text-muted-foreground">
                        {isActive 
                          ? 'AI agents are ready to collaborate. Send a message to begin!'
                          : 'Click "Start" to begin the AI conversation'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="glass-card border-white/30 resize-none"
                      rows={2}
                      disabled={sendingMessage}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-brand-purple hover:bg-brand-purple/90 text-white h-auto px-4 py-3"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="glass-card border-white/30 flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-teal rounded-2xl flex items-center justify-center mb-6 animate-float-gentle mx-auto">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-display-sm text-foreground mb-2">Select a Conversation</h3>
              <p className="text-body text-muted-foreground">
                Choose a conversation from the sidebar or create a new one to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default EnhancedConversationView