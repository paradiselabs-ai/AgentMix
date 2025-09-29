from flask_socketio import emit, join_room, leave_room
from flask import request
from ..services.conversation_orchestrator_hitl import conversation_orchestrator_hitl

def init_websocket_events_hitl(socketio):
    """Initialize WebSocket events for HITL support"""
    
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        print(f"Client connected: {request.sid}")
        emit('connected', {'status': 'Connected to AgentMix Platform'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        print(f"Client disconnected: {request.sid}")
    
    @socketio.on('join_conversation')
    def handle_join_conversation(data):
        """Join a conversation room"""
        conversation_id = data.get('conversation_id')
        if conversation_id:
            join_room(f'conversation_{conversation_id}')
            emit('joined_conversation', {
                'conversation_id': conversation_id,
                'status': 'Joined conversation'
            })
    
    @socketio.on('leave_conversation')
    def handle_leave_conversation(data):
        """Leave a conversation room"""
        conversation_id = data.get('conversation_id')
        if conversation_id:
            leave_room(f'conversation_{conversation_id}')
            emit('left_conversation', {
                'conversation_id': conversation_id,
                'status': 'Left conversation'
            })
    
    @socketio.on('start_conversation')
    def handle_start_conversation(data):
        """Start an AI-to-AI conversation"""
        conversation_id = data.get('conversation_id')
        if conversation_id and conversation_orchestrator_hitl:
            success = conversation_orchestrator_hitl.start_conversation(conversation_id)
            emit('conversation_start_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Conversation started successfully' if success else 'Failed to start conversation'
            })
    
    @socketio.on('stop_conversation')
    def handle_stop_conversation(data):
        """Stop an AI-to-AI conversation"""
        conversation_id = data.get('conversation_id')
        if conversation_id and conversation_orchestrator_hitl:
            success = conversation_orchestrator_hitl.stop_conversation(conversation_id)
            emit('conversation_stop_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Conversation stopped successfully' if success else 'Failed to stop conversation'
            })
    
    @socketio.on('pause_conversation')
    def handle_pause_conversation(data):
        """Pause a conversation for human input"""
        conversation_id = data.get('conversation_id')
        reason = data.get('reason', 'User requested pause')
        
        if conversation_id and conversation_orchestrator_hitl:
            success = conversation_orchestrator_hitl.pause_conversation(conversation_id, reason)
            emit('conversation_pause_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Conversation paused successfully' if success else 'Failed to pause conversation'
            })
    
    @socketio.on('resume_conversation')
    def handle_resume_conversation(data):
        """Resume a paused conversation"""
        conversation_id = data.get('conversation_id')
        
        if conversation_id and conversation_orchestrator_hitl:
            success = conversation_orchestrator_hitl.resume_conversation(conversation_id)
            emit('conversation_resume_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Conversation resumed successfully' if success else 'Failed to resume conversation'
            })
    
    @socketio.on('send_human_message')
    def handle_send_human_message(data):
        """Send a message from human participant"""
        try:
            conversation_id = data.get('conversation_id')
            message = data.get('message')
            user_name = data.get('user_name', 'User')

            print(f"[HITL] Human message received: conv_id={conversation_id}, user={user_name}, msg_len={len(message) if message else 0}")

            if not conversation_id:
                print(f"[HITL] ERROR: Missing conversation_id in send_human_message")
                emit('human_message_result', {
                    'conversation_id': None,
                    'success': False,
                    'message': 'Missing conversation ID'
                })
                return

            if not message:
                print(f"[HITL] ERROR: Empty message in send_human_message for conv {conversation_id}")
                emit('human_message_result', {
                    'conversation_id': conversation_id,
                    'success': False,
                    'message': 'Message cannot be empty'
                })
                return

            if not conversation_orchestrator_hitl:
                print(f"[HITL] ERROR: Orchestrator not initialized")
                emit('human_message_result', {
                    'conversation_id': conversation_id,
                    'success': False,
                    'message': 'Backend orchestrator not available'
                })
                return

            success = conversation_orchestrator_hitl.send_human_message(
                conversation_id,
                message,
                user_name
            )

            print(f"[HITL] Human message result: conv_id={conversation_id}, success={success}")
            emit('human_message_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Message sent successfully' if success else 'Failed to send message'
            })
        except Exception as e:
            print(f"[HITL] EXCEPTION in send_human_message: {e}")
            emit('human_message_result', {
                'conversation_id': data.get('conversation_id'),
                'success': False,
                'message': f'Error: {str(e)}'
            })
    
    @socketio.on('request_human_input')
    def handle_request_human_input(data):
        """Handle AI request for human input"""
        conversation_id = data.get('conversation_id')
        requesting_agent = data.get('requesting_agent')
        request_message = data.get('request_message')
        
        if conversation_id and requesting_agent and request_message and conversation_orchestrator_hitl:
            success = conversation_orchestrator_hitl.request_human_input(
                conversation_id,
                requesting_agent,
                request_message
            )
            emit('human_input_request_result', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'Human input requested successfully' if success else 'Failed to request human input'
            })
    
    @socketio.on('get_conversation_status')
    def handle_get_conversation_status(data):
        """Get detailed conversation status"""
        conversation_id = data.get('conversation_id')
        
        if conversation_id and conversation_orchestrator_hitl:
            status = conversation_orchestrator_hitl.get_conversation_status(conversation_id)
            emit('conversation_status_update', {
                'conversation_id': conversation_id,
                'status': status
            })
    
    @socketio.on('typing_start')
    def handle_typing_start(data):
        """Handle user typing indicator"""
        conversation_id = data.get('conversation_id')
        user_name = data.get('user_name', 'User')
        
        if conversation_id:
            emit('user_typing', {
                'conversation_id': conversation_id,
                'user_name': user_name,
                'typing': True
            }, room=f'conversation_{conversation_id}', include_self=False)
    
    @socketio.on('typing_stop')
    def handle_typing_stop(data):
        """Handle user stop typing indicator"""
        conversation_id = data.get('conversation_id')
        user_name = data.get('user_name', 'User')
        
        if conversation_id:
            emit('user_typing', {
                'conversation_id': conversation_id,
                'user_name': user_name,
                'typing': False
            }, room=f'conversation_{conversation_id}', include_self=False)
    
    return socketio

