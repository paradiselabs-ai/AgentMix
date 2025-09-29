import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'

// Conversation Context
const ConversationContext = createContext()

// Conversation Provider Component
export const ConversationProvider = ({ children }) => {
  // Core conversation state
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationStatus, setConversationStatus] = useState({})

  // HITL state
  const [humanInputRequest, setHumanInputRequest] = useState(null)
  const [humanMessage, setHumanMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [waitingForHuman, setWaitingForHuman] = useState(false)

  // WebSocket connection
  const [socket, setSocket] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('/')
    setSocket(newSocket)

    // Connection status
    newSocket.on('connect', () => {
      console.log('WebSocket connected')
      setSocketConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setSocketConnected(false)
    })

    // Conversation events
    newSocket.on('conversation_status', (data) => {
      setConversationStatus(prev => ({
        ...prev,
        [data.conversation_id]: {
          active: data.status === 'active',
          paused: data.status === 'paused'
        }
      }))
    })

    newSocket.on('human_input_requested', (data) => {
      if (data.conversation_id === selectedConversation?.id) {
        setHumanInputRequest(data)
        setWaitingForHuman(true)
        setConversationStatus(prev => ({
          ...prev,
          [data.conversation_id]: { active: false, paused: true }
        }))
      }
    })

    newSocket.on('conversation_resumed', (data) => {
      if (data.conversation_id === selectedConversation?.id) {
        setWaitingForHuman(false)
        setHumanInputRequest(null)
        setConversationStatus(prev => ({
          ...prev,
          [data.conversation_id]: { active: true, paused: false }
        }))
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [selectedConversation])

  // Join/leave conversation rooms
  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('join_conversation', { conversation_id: selectedConversation.id })

      return () => {
        socket.emit('leave_conversation', { conversation_id: selectedConversation.id })
      }
    }
  }, [socket, selectedConversation])

  // Conversation actions
  const startConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('start_conversation', { conversation_id: conversationId })
    }
  }, [socket])

  const stopConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('stop_conversation', { conversation_id: conversationId })
    }
  }, [socket])

  const pauseConversation = useCallback((conversationId, reason = 'User requested pause') => {
    if (socket) {
      socket.emit('pause_conversation', { conversation_id: conversationId, reason })
    }
  }, [socket])

  const resumeConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('resume_conversation', { conversation_id: conversationId })
    }
  }, [socket])

  const sendHumanMessage = useCallback((conversationId, message, userName = 'User') => {
    if (socket) {
      socket.emit('send_human_message', {
        conversation_id: conversationId,
        message: message,
        user_name: userName
      })
      setHumanMessage('')
      setWaitingForHuman(false)
    }
  }, [socket])

  const requestHumanInput = useCallback((conversationId) => {
    if (socket) {
      socket.emit('request_human_input', { conversation_id: conversationId })
    }
  }, [socket])

  // Context value
  const contextValue = {
    // State
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
    waitingForHuman,
    socketConnected,
    socket,

    // Actions
    startConversation,
    stopConversation,
    pauseConversation,
    resumeConversation,
    sendHumanMessage,
    requestHumanInput,

    // Utilities
    isConversationActive: (conversationId) => conversationStatus[conversationId]?.active || false,
    isConversationPaused: (conversationId) => conversationStatus[conversationId]?.paused || false
  }

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  )
}

// Custom hook to use conversation context
export const useConversation = () => {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider')
  }
  return context
}

export default ConversationContext
