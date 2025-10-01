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

const EnhancedConversationView = ({ agents = [] }) => {
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

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const createConversation = async () => {
    if (!conversationName.trim() || selectedAgents.length < 2) {
      alert('Please provide a name and select at least 2 agents')
      return
    }

    try {
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
        alert('Error creating conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Error creating conversation')
    }
  }

  const startConversation = async () => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/start`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        setIsActive(true)
        fetchMessages(selectedConversation.id)
      } else {
        alert('Error starting conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Error starting conversation')
    }
  }

  const stopConversation = async () => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/stop`, {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        setIsActive(false)
      } else {
        alert('Error stopping conversation: ' + data.error)
      }
    } catch (error) {
      console.error('Error stopping conversation:', error)
      alert('Error stopping conversation')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: 'human',
          content: newMessage,
          message_type: 'text'
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages([...messages, data.message])
        setNewMessage('')
      } else {
        alert('Error sending message: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
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
          <div className={`p-3 rounded-2xl glass-card border-white/30 ${
            isHuman 
              ? 'bg-brand-purple/10 border-brand-purple/20' 
              : 'bg-white/80 border-white/40'
          }`}>
            <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
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
              <CardTitle className="text-lg">New Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Conversation name"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                className="glass-card border-white/30"
              />
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Agents (min 2)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {agents.filter(a => a.status === 'active').map(agent => (
                    <label key={agent.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgents([...selectedAgents, agent.id])
                          } else {
                            setSelectedAgents(selectedAgents.filter(id => id !== agent.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-foreground">{agent.name}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        {agent.provider}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createConversation}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-white"
                  size="sm"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/30"
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
            {/* Chat Header */}
            <Card className="glass-card border-white/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participants?.length || 0} participants
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      isActive 
                        ? 'bg-green-100 text-green-800 border-green-200 animate-pulse' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    {!isActive ? (
                      <Button
                        onClick={startConversation}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        onClick={stopConversation}
                        size="sm"
                        variant="outline"
                        className="glass-card border-white/30"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-card border-white/30"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="glass-card border-white/30 flex-1 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-brand-purple hover:bg-brand-purple/90 text-white h-auto px-4 py-3"
                  >
                    <Send className="h-4 w-4" />
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