from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.ai_agent import AIAgent
from src.services.ai_provider import ai_provider_service
from src.services.ai_provider_enhanced import enhanced_ai_provider_service

ai_chat_bp = Blueprint('ai_chat', __name__)

@ai_chat_bp.route('/agents/<int:agent_id>/chat', methods=['POST'])
def chat_with_agent(agent_id):
    """Send a message to an AI agent and get a response"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        # Prepare messages for AI provider
        messages = [
            {
                'role': 'user',
                'content': data['message']
            }
        ]
        
        # Add system message if configured
        config = agent.get_config()
        if 'system_message' in config:
            messages.insert(0, {
                'role': 'system',
                'content': config['system_message']
            })
        
        # Call AI provider
        result = ai_provider_service.call_ai(
            provider=agent.provider,
            model=agent.model,
            api_key=agent.api_key,
            messages=messages,
            config=config
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'response': result['response']['content'],
                'usage': result.get('usage', {}),
                'model': result.get('model', agent.model)
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_chat_bp.route('/agents/<int:agent_id>/test', methods=['POST'])
def test_agent_connection(agent_id):
    """Test if an AI agent can connect to its provider"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        
        # Simple test message
        test_messages = [
            {
                'role': 'user',
                'content': 'Hello, please respond with "Connection successful"'
            }
        ]
        
        # Call AI provider with minimal config
        result = ai_provider_service.call_ai(
            provider=agent.provider,
            model=agent.model,
            api_key=agent.api_key,
            messages=test_messages,
            config={'max_tokens': 50}
        )
        
        if result['success']:
            # Update agent status
            agent.status = 'active'
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Agent connection successful',
                'response': result['response']['content']
            })
        else:
            # Update agent status
            agent.status = 'error'
            db.session.commit()
            
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_chat_bp.route('/providers', methods=['GET'])
def get_supported_providers():
    """Get list of supported AI providers"""
    try:
        providers_data = enhanced_ai_provider_service.get_all_providers()
        return jsonify({
            'success': True,
            'providers': providers_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

