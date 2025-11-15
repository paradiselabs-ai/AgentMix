import { useContext } from 'react'
import ConversationContext from './ConversationContext'

export const useConversation = () => {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider')
  }
  return context
}
