import asyncio
import threading
import time
from typing import List, Dict, Any
from src.models.user import db
from src.models.ai_agent import AIAgent
from src.models.message import Message
from src.models.conversation import Conversation
from src.services.ai_provider import ai_provider_service
from flask_socketio import emit
import uuid

class ConversationOrchestrator:
    """Service for orchestrating AI-to-AI conversations"""

    def __init__(self, socketio, app=None):
        self.socketio = socketio
        self.app = app
        self.active_conversations = {}
        self.conversation_threads = {}
    
    def start_conversation(self, conversation_id: str) -> bool:
        """Start an AI-to-AI conversation"""
        try:
            # Get conversation from database
            conversation = Conversation.query.get(conversation_id)
            if not conversation:
                return False
            
            # Get participating agents
            participant_ids = conversation.get_participants()
            agents = []
            for agent_id in participant_ids:
                agent = AIAgent.query.get(agent_id)
                if agent and agent.status == 'active':
                    agents.append(agent)
            
            if len(agents) < 2:
                return False
            
            # Mark conversation as active
            self.active_conversations[conversation_id] = {
                'conversation': conversation,
                'agents': agents,
                'message_count': 0,
                'last_speaker': None,
                'running': True
            }
            
            # Start conversation thread
            thread = threading.Thread(
                target=self._run_conversation,
                args=(conversation_id,),
                daemon=True
            )
            thread.start()
            self.conversation_threads[conversation_id] = thread
            
            return True
            
        except Exception as e:
            print(f"Error starting conversation: {e}")
            return False
    
    def stop_conversation(self, conversation_id: str) -> bool:
        """Stop an AI-to-AI conversation"""
        try:
            if conversation_id in self.active_conversations:
                self.active_conversations[conversation_id]['running'] = False
                
                # Update conversation status in database
                conversation = Conversation.query.get(conversation_id)
                if conversation:
                    conversation.status = 'paused'
                    db.session.commit()
                
                return True
            return False
        except Exception as e:
            print(f"Error stopping conversation: {e}")
            return False
    
    def _run_conversation(self, conversation_id: str):
        """Run the conversation loop in a separate thread"""
        if not self.app:
            print(f"Error: Flask app not provided to orchestrator for conversation {conversation_id}")
            return

        with self.app.app_context():  # Add application context
            try:
                conv_data = self.active_conversations[conversation_id]
                conversation = conv_data['conversation']
                agents = conv_data['agents']
                
                # Initial conversation starter
                starter_message = f"Hello everyone! Let's start our collaboration on: {conversation.description or conversation.name}"
                
                # Send initial message from first agent
                first_agent = agents[0]
                self._send_message(
                    conversation_id,
                    first_agent.id,
                    None,  # broadcast to all
                    starter_message,
                    'system'
                )
                
                conv_data['last_speaker'] = first_agent.id
                conv_data['message_count'] += 1
                
                # Conversation loop
                while conv_data['running'] and conv_data['message_count'] < 20:  # Limit to 20 messages
                    time.sleep(2)  # Wait between messages
                    
                    if not conv_data['running']:
                        break
                    
                    # Get next speaker (rotate through agents)
                    current_speaker_idx = next(
                        (i for i, agent in enumerate(agents) if agent.id == conv_data['last_speaker']),
                        0
                    )
                    next_speaker_idx = (current_speaker_idx + 1) % len(agents)
                    next_speaker = agents[next_speaker_idx]
                    
                    # Generate response from next speaker
                    response = self._generate_agent_response(
                        conversation_id,
                        next_speaker,
                        conv_data['message_count']
                    )
                    
                    if response:
                        self._send_message(
                            conversation_id,
                            next_speaker.id,
                            None,  # broadcast to all
                            response,
                            'text'
                        )
                        
                        conv_data['last_speaker'] = next_speaker.id
                        conv_data['message_count'] += 1
                
                # Mark conversation as completed
                conversation.status = 'completed'
                db.session.commit()
                
                # Clean up
                if conversation_id in self.active_conversations:
                    del self.active_conversations[conversation_id]
                if conversation_id in self.conversation_threads:
                    del self.conversation_threads[conversation_id]
                    
            except Exception as e:
                print(f"Error in conversation loop: {e}")
    
    def _generate_agent_response(self, conversation_id: str, agent: AIAgent, turn_number: int) -> str:
        """Generate a response from an AI agent"""
        try:
            # Get recent conversation history
            recent_messages = Message.query.filter_by(
                conversation_id=conversation_id
            ).order_by(Message.timestamp.desc()).limit(5).all()
            
            # Build conversation context
            messages = []
            
            # Add system message
            system_msg = agent.get_config().get('system_message', '')
            if system_msg:
                messages.append({
                    'role': 'system',
                    'content': system_msg
                })
            
            # Add conversation context
            context_msg = f"You are participating in a multi-AI collaboration. This is turn {turn_number}. "
            context_msg += "Please provide a thoughtful response that builds on the previous messages. "
            context_msg += "Keep your response concise (1-2 sentences) and collaborative."
            
            messages.append({
                'role': 'system',
                'content': context_msg
            })
            
            # Add recent message history (in reverse order)
            for msg in reversed(recent_messages):
                if msg.sender_id != agent.id:  # Don't include own messages
                    sender_name = msg.sender.name if msg.sender else f"Agent {msg.sender_id}"
                    messages.append({
                        'role': 'user',
                        'content': f"{sender_name}: {msg.content}"
                    })
            
            # Call AI provider
            result = ai_provider_service.call_ai(
                provider=agent.provider,
                model=agent.model,
                api_key=agent.api_key,
                messages=messages,
                config={
                    **agent.get_config(),
                    'max_tokens': 150,  # Keep responses short
                    'temperature': 0.8  # Make it more creative
                }
            )
            
            if result['success']:
                return result['response']['content']
            else:
                return f"[Error generating response: {result['error']}]"
                
        except Exception as e:
            print(f"Error generating agent response: {e}")
            return f"[Error: {str(e)}]"
    
    def _send_message(self, conversation_id: str, sender_id: int, receiver_id: int, content: str, message_type: str = 'text'):
        """Send a message and broadcast it via WebSocket"""
        if not self.app:
            print("Error: Flask app not provided to orchestrator")
            return

        with self.app.app_context():  # Add application context
            try:
                # Save message to database
                message = Message(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=content,
                    message_type=message_type,
                    conversation_id=conversation_id
                )
                
                db.session.add(message)
                db.session.commit()
                
                # Broadcast via WebSocket
                self.socketio.emit('new_message', {
                    'conversation_id': conversation_id,
                    'message': message.to_dict()
                }, room=f'conversation_{conversation_id}')
                
                print(f"Message sent in conversation {conversation_id}: {content[:50]}...")
                
            except Exception as e:
                print(f"Error sending message: {e}")
    
    def get_active_conversations(self) -> List[str]:
        """Get list of active conversation IDs"""
        return list(self.active_conversations.keys())
    
    def is_conversation_active(self, conversation_id: str) -> bool:
        """Check if a conversation is currently active"""
        return conversation_id in self.active_conversations

# Global instance
conversation_orchestrator = None

def init_orchestrator(socketio, app=None):
    """Initialize the global orchestrator instance"""
    global conversation_orchestrator
    conversation_orchestrator = ConversationOrchestrator(socketio, app)
    return conversation_orchestrator

