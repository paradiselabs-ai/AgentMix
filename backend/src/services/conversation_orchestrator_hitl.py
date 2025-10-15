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

class ConversationOrchestratorHITL:
    """Enhanced service for orchestrating AI-to-AI conversations with Human-in-the-Loop support"""

    def __init__(self, socketio, app=None):
        self.socketio = socketio
        self.app = app
        self.active_conversations = {}
        self.conversation_threads = {}
    
    def start_conversation(self, conversation_id: str) -> bool:
        """Start an AI-to-AI conversation with HITL support"""
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
                'running': True,
                'paused': False,
                'waiting_for_human': False,
                'human_input_request': None
            }
            
            # Update conversation status
            conversation.status = 'active'
            db.session.commit()
            
            # Emit status update
            self.socketio.emit('conversation_status', {
                'conversation_id': conversation_id,
                'status': 'active'
            })
            
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
    
    def pause_conversation(self, conversation_id: str, reason: str = "Human intervention requested") -> bool:
        """Pause conversation for human input"""
        try:
            if conversation_id in self.active_conversations:
                conv_data = self.active_conversations[conversation_id]
                conv_data['paused'] = True
                conv_data['waiting_for_human'] = True
                
                # Send system message
                self._send_system_message(conversation_id, f"🔄 Conversation paused: {reason}")
                
                # Emit pause notification
                self.socketio.emit('conversation_paused', {
                    'conversation_id': conversation_id,
                    'reason': reason
                })
                
                return True
            return False
        except Exception as e:
            print(f"Error pausing conversation: {e}")
            return False
    
    def resume_conversation(self, conversation_id: str) -> bool:
        """Resume paused conversation"""
        try:
            if conversation_id in self.active_conversations:
                conv_data = self.active_conversations[conversation_id]
                conv_data['paused'] = False
                conv_data['waiting_for_human'] = False
                conv_data['human_input_request'] = None
                
                # Send system message
                self._send_system_message(conversation_id, "▶️ Conversation resumed")
                
                # Emit resume notification
                self.socketio.emit('conversation_resumed', {
                    'conversation_id': conversation_id
                })
                
                return True
            return False
        except Exception as e:
            print(f"Error resuming conversation: {e}")
            return False
    
    def send_human_message(self, conversation_id: str, user_message: str, user_name: str = "User") -> bool:
        """Send a message from human participant"""
        try:
            if not self.app:
                print("Error: Flask app not provided to orchestrator")
                return False

            with self.app.app_context():
                # Create and save human message
                message = Message(
                    sender_id=None,  # Human sender
                    receiver_id=None,  # Broadcast to all
                    content=user_message,
                    message_type='human',
                    conversation_id=conversation_id
                )
                db.session.add(message)
                db.session.commit()
                
                # Broadcast message
                self.socketio.emit('new_message', {
                    'conversation_id': conversation_id,
                    'message': {
                        'id': message.id,
                        'sender_type': 'human',
                        'sender_name': user_name,
                        'content': user_message,
                        'timestamp': message.timestamp.isoformat(),
                        'message_type': 'human'
                    }
                })
                
                # If conversation was waiting for human input, resume it
                if (conversation_id in self.active_conversations and 
                    self.active_conversations[conversation_id].get('waiting_for_human')):
                    self.resume_conversation(conversation_id)
                
                return True
        except Exception as e:
            print(f"Error sending human message: {e}")
            return False
    
    def request_human_input(self, conversation_id: str, requesting_agent: str, request_message: str) -> bool:
        """AI agent requests human input"""
        try:
            # Store the request
            if conversation_id in self.active_conversations:
                self.active_conversations[conversation_id]['human_input_request'] = {
                    'agent': requesting_agent,
                    'message': request_message
                }
            
            # Pause conversation
            self.pause_conversation(conversation_id, f"{requesting_agent} requested human input")
            
            # Send request message
            self._send_system_message(
                conversation_id, 
                f"🤖 {requesting_agent} is requesting human input: {request_message}"
            )
            
            # Emit specific human input request
            self.socketio.emit('human_input_requested', {
                'conversation_id': conversation_id,
                'requesting_agent': requesting_agent,
                'request_message': request_message
            })
            
            return True
        except Exception as e:
            print(f"Error requesting human input: {e}")
            return False
    
    def stop_conversation(self, conversation_id: str) -> bool:
        """Stop an AI-to-AI conversation"""
        try:
            # Mark as stopped even if not in active_conversations (handles error cases)
            if conversation_id in self.active_conversations:
                self.active_conversations[conversation_id]['running'] = False
                del self.active_conversations[conversation_id]
            
            # Always update database status
            conversation = Conversation.query.get(conversation_id)
            if conversation:
                conversation.status = 'completed'
                db.session.commit()
            
            # Emit status update
            self.socketio.emit('conversation_status', {
                'conversation_id': conversation_id,
                'status': 'completed'
            })
            
            return True
        except Exception as e:
            print(f"Error stopping conversation: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _run_conversation(self, conversation_id: str):
        """Run the conversation loop in a separate thread with HITL support"""
        if not self.app:
            print(f"Error: Flask app not provided to orchestrator for conversation {conversation_id}")
            return

        with self.app.app_context():
            try:
                # Refresh objects in this thread's session
                conversation = Conversation.query.get(conversation_id)
                if not conversation:
                    print(f"Conversation {conversation_id} not found")
                    return
                
                # Get fresh agent objects
                agent_ids = conversation.participants
                agents = [AIAgent.query.get(agent_id) for agent_id in agent_ids]
                agents = [agent for agent in agents if agent]  # Filter out None
                
                if len(agents) < 2:
                    print(f"Not enough agents for conversation {conversation_id}")
                    return
                
                conv_data = self.active_conversations[conversation_id]
                conv_data['conversation'] = conversation
                conv_data['agents'] = agents
                
                # Initial conversation starter
                starter_message = f"Hello everyone! Let's start our collaboration on: {conversation.description or conversation.name}"
                
                # Send initial message from first agent
                first_agent = agents[0]
                self._send_ai_message(
                    conversation_id,
                    first_agent,
                    starter_message
                )
                
                conv_data['last_speaker'] = first_agent.id
                conv_data['message_count'] += 1
                
                # Conversation loop
                while conv_data['running'] and conv_data['message_count'] < 100:
                    time.sleep(1)  # Reduced wait time for faster conversation
                    
                    # Check if conversation should continue
                    if not conv_data['running'] or conv_data['paused'] or conv_data['waiting_for_human']:
                        continue
                    
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
                    
                    # Check if response generation failed (returns None on error)
                    if response is None:
                        print(f"Response generation failed for {next_speaker.name}, stopping conversation")
                        break
                    
                    if response:
                        # Check if AI is requesting human input
                        if self._should_request_human_input(response):
                            clean_request = response.replace('[HUMAN_INPUT_NEEDED]', '').strip()
                            self.request_human_input(conversation_id, next_speaker.name, clean_request)
                            continue
                        
                        self._send_ai_message(
                            conversation_id,
                            next_speaker,
                            response
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
                import traceback
                traceback.print_exc()
    
    def _generate_agent_response(self, conversation_id: str, agent: AIAgent, turn_number: int) -> str:
        """Generate a response from an AI agent with HITL awareness"""
        try:
            # Get recent conversation history
            recent_messages = Message.query.filter_by(
                conversation_id=conversation_id
            ).order_by(Message.timestamp.desc()).limit(5).all()
            
            # Build conversation context
            messages = []
            
            # Add system message with HITL instructions
            system_msg = agent.get_config().get('system_message', '')
            if system_msg:
                messages.append({
                    'role': 'system',
                    'content': system_msg
                })
            
            # Add HITL context
            hitl_context = f"You are participating in a multi-AI collaboration with human oversight. This is turn {turn_number}. "
            hitl_context += "If you need human input, guidance, or clarification, start your response with '[HUMAN_INPUT_NEEDED]' followed by your specific request. "
            hitl_context += "Otherwise, provide a thoughtful response that builds on the previous messages. "
            hitl_context += "Keep your response concise (1-2 sentences) and collaborative."
            
            messages.append({
                'role': 'system',
                'content': hitl_context
            })
            
            # Add recent message history
            for msg in reversed(recent_messages):
                if msg.message_type == 'human':
                    messages.append({
                        'role': 'user',
                        'content': f"Human: {msg.content}"
                    })
                elif msg.sender_id != agent.id:  # Don't include own messages
                    sender_name = msg.sender.name if msg.sender else f"Agent {msg.sender_id}"
                    messages.append({
                        'role': 'user',
                        'content': f"{sender_name}: {msg.content}"
                    })
            
            # Use real AI provider to generate response
            try:
                from src.services.ai_provider_enhanced import EnhancedAIProviderService
                import random
                ai_service = EnhancedAIProviderService()
                
                # Build the prompt for the AI
                prompt = ""
                for msg in messages:
                    if msg['role'] == 'system':
                        prompt += f"System: {msg['content']}\n"
                    elif msg['role'] == 'user':
                        prompt += f"{msg['content']}\n"
                
                prompt += f"\n{agent.name}, please respond:"
                
                # Generate response using the agent's provider and model
                response = ai_service.generate_response(
                    provider=agent.provider,
                    model=agent.model,
                    api_key=agent.api_key,
                    prompt=prompt,
                    max_tokens=150
                )
                
                # Check if response is an error message
                if response and not response.startswith('Error:') and not response.startswith('API Error:'):
                    return response.strip()
                else:
                    # Log the error and stop the conversation
                    error_msg = response if response else "No response from AI provider"
                    print(f"AI API error for {agent.name}: {error_msg}")
                    
                    # Send system message about the error
                    self._send_system_message(
                        conversation_id,
                        f"⚠️ Conversation paused: {agent.name} encountered an API error. Please check the agent's configuration and API key."
                    )
                    
                    # Pause the conversation
                    conv_data = self.active_conversations.get(conversation_id)
                    if conv_data:
                        conv_data['paused'] = True
                        conv_data['running'] = False
                    
                    # Emit pause event
                    self.socketio.emit('conversation_paused', {
                        'conversation_id': conversation_id,
                        'reason': f'API error for {agent.name}',
                        'status': 'paused'
                    })
                    
                    return None  # Return None to signal error
                    
            except Exception as e:
                print(f"Error generating AI response: {e}")
                import traceback
                traceback.print_exc()
                
                # Send system message about the error
                self._send_system_message(
                    conversation_id,
                    f"⚠️ Conversation paused: {agent.name} encountered an unexpected error. Please check the logs."
                )
                
                # Pause the conversation
                conv_data = self.active_conversations.get(conversation_id)
                if conv_data:
                    conv_data['paused'] = True
                    conv_data['running'] = False
                
                # Emit pause event
                self.socketio.emit('conversation_paused', {
                    'conversation_id': conversation_id,
                    'reason': f'Unexpected error for {agent.name}',
                    'status': 'paused'
                })
                
                return None  # Return None to signal error
                
        except Exception as e:
            print(f"Error generating agent response: {e}")
            return f"[Error: {str(e)}]"
    
    def _should_request_human_input(self, response: str) -> bool:
        """Check if AI response is requesting human input"""
        return response.startswith('[HUMAN_INPUT_NEEDED]')
    
    def _send_ai_message(self, conversation_id: str, agent: AIAgent, content: str):
        """Send an AI message"""
        if not self.app:
            print("Error: Flask app not provided to orchestrator")
            return

        with self.app.app_context():
            try:
                message = Message(
                    sender_id=agent.id,
                    receiver_id=None,  # Broadcast to all
                    content=content,
                    message_type='ai',
                    conversation_id=conversation_id
                )
                
                db.session.add(message)
                db.session.commit()
                
                # Broadcast message
                self.socketio.emit('new_message', {
                    'conversation_id': conversation_id,
                    'message': {
                        'id': message.id,
                        'sender_type': 'ai',
                        'sender_name': agent.name,
                        'content': content,
                        'timestamp': message.timestamp.isoformat(),
                        'message_type': 'ai'
                    }
                })
                
            except Exception as e:
                print(f"Error sending AI message: {e}")
    
    def _send_system_message(self, conversation_id: str, content: str):
        """Send a system message"""
        if not self.app:
            print("Error: Flask app not provided to orchestrator")
            return

        with self.app.app_context():
            try:
                message = Message(
                    sender_id=None,
                    receiver_id=None,
                    content=content,
                    message_type='system',
                    conversation_id=conversation_id
                )
                
                db.session.add(message)
                db.session.commit()
                
                # Broadcast message
                self.socketio.emit('new_message', {
                    'conversation_id': conversation_id,
                    'message': {
                        'id': message.id,
                        'sender_type': 'system',
                        'sender_name': 'System',
                        'content': content,
                        'timestamp': message.timestamp.isoformat(),
                        'message_type': 'system'
                    }
                })
                
            except Exception as e:
                print(f"Error sending system message: {e}")
    
    def get_active_conversations(self) -> List[str]:
        """Get list of active conversation IDs"""
        return list(self.active_conversations.keys())
    
    def is_conversation_active(self, conversation_id: str) -> bool:
        """Check if a conversation is currently active"""
        return conversation_id in self.active_conversations
    
    def get_conversation_status(self, conversation_id: str) -> Dict[str, Any]:
        """Get detailed status of a conversation"""
        if conversation_id in self.active_conversations:
            conv_data = self.active_conversations[conversation_id]
            return {
                'active': True,
                'paused': conv_data.get('paused', False),
                'waiting_for_human': conv_data.get('waiting_for_human', False),
                'message_count': conv_data.get('message_count', 0),
                'human_input_request': conv_data.get('human_input_request')
            }
        return {'active': False}

# Global instance
conversation_orchestrator_hitl = None

def init_orchestrator_hitl(socketio, app=None):
    """Initialize the global HITL orchestrator instance"""
    global conversation_orchestrator_hitl
    conversation_orchestrator_hitl = ConversationOrchestratorHITL(socketio, app)
    return conversation_orchestrator_hitl

