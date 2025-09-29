from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.ai_agent import AIAgent
import uuid

conversation_bp = Blueprint('conversation', __name__)

@conversation_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations"""
    try:
        conversations = Conversation.query.all()
        return jsonify({
            'success': True,
            'conversations': [conv.to_dict() for conv in conversations]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """Create a new conversation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'participants']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate participants exist
        participant_ids = data['participants']
        for agent_id in participant_ids:
            agent = AIAgent.query.get(agent_id)
            if not agent:
                return jsonify({
                    'success': False,
                    'error': f'Agent with ID {agent_id} not found'
                }), 400
        
        # Create new conversation
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conversation_id,
            name=data['name'],
            description=data.get('description', ''),
            status='active'
        )
        conversation.set_participants(participant_ids)
        
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'conversation': conversation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get a specific conversation"""
    try:
        conversation = Conversation.query.get_or_404(conversation_id)
        return jsonify({
            'success': True,
            'conversation': conversation.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
def get_conversation_messages(conversation_id):
    """Get all messages in a conversation"""
    try:
        messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.timestamp).all()
        return jsonify({
            'success': True,
            'messages': [msg.to_dict() for msg in messages]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    """Send a message in a conversation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sender_id', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate conversation exists
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Validate sender exists and is part of conversation
        sender_id = data['sender_id']
        if sender_id not in conversation.get_participants():
            return jsonify({
                'success': False,
                'error': 'Sender is not a participant in this conversation'
            }), 400
        
        # Create new message
        message = Message(
            sender_id=sender_id,
            receiver_id=data.get('receiver_id'),
            content=data['content'],
            message_type=data.get('message_type', 'text'),
            conversation_id=conversation_id,
            message_metadata=data.get('metadata')
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/<conversation_id>/status', methods=['PUT'])
def update_conversation_status(conversation_id):
    """Update conversation status"""
    try:
        conversation = Conversation.query.get_or_404(conversation_id)
        data = request.get_json()
        
        if 'status' in data:
            conversation.status = data['status']
            db.session.commit()
        
        return jsonify({
            'success': True,
            'conversation': conversation.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@conversation_bp.route('/conversations/<conversation_id>/start', methods=['POST'])
def start_conversation(conversation_id):
    """Start an AI-to-AI conversation"""
    try:
        from src.services.conversation_orchestrator_hitl import conversation_orchestrator_hitl
        
        if not conversation_orchestrator_hitl:
            return jsonify({
                'success': False,
                'error': 'Conversation orchestrator not available'
            }), 500
        
        # Validate conversation exists
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Check if conversation has enough participants
        participants = conversation.get_participants()
        if len(participants) < 2:
            return jsonify({
                'success': False,
                'error': 'Conversation needs at least 2 participants'
            }), 400
        
        # Start the conversation
        success = conversation_orchestrator_hitl.start_conversation(conversation_id)
        
        if success:
            conversation.status = 'active'
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'AI conversation started',
                'conversation': conversation.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to start conversation. Check that agents are active.'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/<conversation_id>/stop', methods=['POST'])
def stop_conversation(conversation_id):
    """Stop an AI-to-AI conversation"""
    try:
        from src.services.conversation_orchestrator_hitl import conversation_orchestrator_hitl
        
        if not conversation_orchestrator_hitl:
            return jsonify({
                'success': False,
                'error': 'Conversation orchestrator not available'
            }), 500
        
        # Validate conversation exists
        conversation = Conversation.query.get_or_404(conversation_id)
        
        # Stop the conversation
        success = conversation_orchestrator_hitl.stop_conversation(conversation_id)
        
        if success:
            conversation.status = 'paused'
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'AI conversation stopped',
                'conversation': conversation.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to stop conversation'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@conversation_bp.route('/conversations/active', methods=['GET'])
def get_active_conversations():
    """Get list of active conversations"""
    try:
        from src.services.conversation_orchestrator_hitl import conversation_orchestrator_hitl
        
        if not conversation_orchestrator_hitl:
            return jsonify({
                'success': True,
                'active_conversations': []
            })
        
        active_conversation_ids = list(conversation_orchestrator_hitl.active_conversations.keys())
        
        return jsonify({
            'success': True,
            'active_conversations': active_conversation_ids
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conversation_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """Delete a conversation and all its messages"""
    try:
        # Find the conversation
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({
                'success': False,
                'error': 'Conversation not found'
            }), 404
        
        # Stop the conversation if it's active
        from src.services.conversation_orchestrator_hitl import conversation_orchestrator_hitl
        if conversation_orchestrator_hitl and conversation_orchestrator_hitl.is_conversation_active(conversation_id):
            conversation_orchestrator_hitl.stop_conversation(conversation_id)
        
        # Delete all messages associated with this conversation
        Message.query.filter_by(conversation_id=conversation_id).delete()
        
        # Delete the conversation
        db.session.delete(conversation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Conversation deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@conversation_bp.route('/conversations/<conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    """Update a conversation's name and description"""
    try:
        # Find the conversation
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({
                'success': False,
                'error': 'Conversation not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            conversation.name = data['name']
        if 'description' in data:
            conversation.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'conversation': conversation.to_dict(),
            'message': 'Conversation updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

