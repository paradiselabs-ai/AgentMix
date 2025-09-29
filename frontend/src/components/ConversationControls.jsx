import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Play, 
  Pause, 
  Loader2,
  Users,
  MessageSquare,
  Activity,
  Send,
  User
} from 'lucide-react'
import { useConversation } from '../contexts/ConversationContext.jsx'

const ConversationControls = ({ conversation, onStatusChange }) => {
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const {
    socket,
    startConversation,
    stopConversation,
    requestHumanInput,
    sendHumanMessage,
    isConversationActive,
    waitingForHuman,
    humanMessage,
    setHumanMessage,
  } = useConversation()

  // Optionally, subscribe to start/stop results if needed in future
  useEffect(() => {
    if (!socket) return
    const onStart = (data) => {
      if (data.conversation_id === conversation.id) {
        setIsStarting(false)
        if (data.success && onStatusChange) onStatusChange('active')
      }
    }
    const onStop = (data) => {
      if (data.conversation_id === conversation.id) {
        setIsStopping(false)
        if (data.success && onStatusChange) onStatusChange('paused')
      }
    }
    socket.on('conversation_start_result', onStart)
    socket.on('conversation_stop_result', onStop)
    return () => {
      socket.off('conversation_start_result', onStart)
      socket.off('conversation_stop_result', onStop)
    }
  }, [socket, conversation.id, onStatusChange])

  useEffect(() => {
    // Check if conversation is currently active
    checkActiveStatus()
  }, [conversation.id])

  const checkActiveStatus = async () => {
    try {
      const response = await fetch('/api/conversations/active')
      const data = await response.json()
      if (data.success) {
        // Prefer backend truth; UI will also reflect via context events
        // No local isActive state; rely on isConversationActive utility for rendering
      }
    } catch (error) {
      console.error('Error checking active status:', error)
    }
  }

  const handleStartConversation = async () => {
    setIsStarting(true)
    try {
      // Trigger backend via WebSocket through context
      startConversation(conversation.id)
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Error starting conversation')
      setIsStarting(false)
    }
  }

  const handleStopConversation = async () => {
    setIsStopping(true)
    try {
      stopConversation(conversation.id)
    } catch (error) {
      console.error('Error stopping conversation:', error)
      alert('Error stopping conversation')
      setIsStopping(false)
    }
  }

  const handleSendHumanMessage = async () => {
    if (!humanMessage.trim()) return
    
    setIsSendingMessage(true)
    try {
      sendHumanMessage(conversation.id, humanMessage.trim(), 'Human User')
      setHumanMessage('')
    } catch (error) {
      console.error('Error sending human message:', error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handlePauseForInput = () => {
    requestHumanInput(conversation.id)
  }

  const getStatusBadge = () => {
    if (waitingForHuman) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <User className="h-3 w-3 mr-1" />
          Waiting for Human
        </Badge>
      )
    } else if (isConversationActive(conversation.id)) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <Activity className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    } else if (conversation.status === 'completed') {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <MessageSquare className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <Pause className="h-3 w-3 mr-1" />
          Paused
        </Badge>
      )
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {getStatusBadge()}
      
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {conversation.participants?.length || 0} agents
        </span>
      </div>

      <div className="flex space-x-2">
        {!isActive && !waitingForHuman ? (
          <Button
            size="sm"
            onClick={handleStartConversation}
            disabled={isStarting || !conversation.participants?.length || conversation.participants.length < 2}
            className="flex items-center space-x-1"
          >
            {isStarting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span>{isStarting ? 'Starting...' : 'Start AI Chat'}</span>
          </Button>
        ) : isActive ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopConversation}
              disabled={isStopping}
              className="flex items-center space-x-1"
            >
              {isStopping ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
              <span>{isStopping ? 'Stopping...' : 'Stop AI Chat'}</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePauseForInput}
              className="flex items-center space-x-1"
            >
              <User className="h-3 w-3" />
              <span>Join Conversation</span>
            </Button>
          </>
        ) : null}
      </div>

      {/* Human Input Section */}
      {waitingForHuman && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <User className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Your turn to respond</span>
          </div>
          <div className="flex space-x-2">
            <Input
              value={humanMessage}
              onChange={(e) => setHumanMessage(e.target.value)}
              placeholder="Type your message to join the conversation..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendHumanMessage()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSendHumanMessage}
              disabled={isSendingMessage || !humanMessage.trim()}
              className="flex items-center space-x-1"
            >
              {isSendingMessage ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              <span>Send</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationControls

