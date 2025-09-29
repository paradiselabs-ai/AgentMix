from flask_socketio import emit, join_room, leave_room
from src.services.conversation_orchestrator import conversation_orchestrator

def register_socketio_events(socketio):
    """Register WebSocket event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('connected', {'status': 'Connected to AI Collaboration Platform'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
    
    @socketio.on('join_conversation')
    def handle_join_conversation(data):
        """Join a conversation room for real-time updates"""
        conversation_id = data.get('conversation_id')
        if conversation_id:
            join_room(f'conversation_{conversation_id}')
            emit('joined_conversation', {
                'conversation_id': conversation_id,
                'status': 'Joined conversation room'
            })
    
    @socketio.on('leave_conversation')
    def handle_leave_conversation(data):
        """Leave a conversation room"""
        conversation_id = data.get('conversation_id')
        if conversation_id:
            leave_room(f'conversation_{conversation_id}')
            emit('left_conversation', {
                'conversation_id': conversation_id,
                'status': 'Left conversation room'
            })
    
    @socketio.on('start_ai_conversation')
    def handle_start_ai_conversation(data):
        """Start an AI-to-AI conversation"""
        conversation_id = data.get('conversation_id')
        if conversation_id and conversation_orchestrator:
            success = conversation_orchestrator.start_conversation(conversation_id)
            emit('conversation_started', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'AI conversation started' if success else 'Failed to start conversation'
            })
        else:
            emit('error', {'message': 'Invalid conversation ID or orchestrator not available'})
    
    @socketio.on('stop_ai_conversation')
    def handle_stop_ai_conversation(data):
        """Stop an AI-to-AI conversation"""
        conversation_id = data.get('conversation_id')
        if conversation_id and conversation_orchestrator:
            success = conversation_orchestrator.stop_conversation(conversation_id)
            emit('conversation_stopped', {
                'conversation_id': conversation_id,
                'success': success,
                'message': 'AI conversation stopped' if success else 'Failed to stop conversation'
            })
        else:
            emit('error', {'message': 'Invalid conversation ID or orchestrator not available'})
    
    @socketio.on('get_active_conversations')
    def handle_get_active_conversations():
        """Get list of active conversations"""
        if conversation_orchestrator:
            active_conversations = conversation_orchestrator.get_active_conversations()
            emit('active_conversations', {
                'conversations': active_conversations
            })
        else:
            emit('active_conversations', {'conversations': []})

