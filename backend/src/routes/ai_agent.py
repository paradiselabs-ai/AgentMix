from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.ai_agent import AIAgent
import uuid

ai_agent_bp = Blueprint('ai_agent', __name__)

@ai_agent_bp.route('/agents', methods=['GET'])
def get_agents():
    """Get all AI agents"""
    try:
        agents = AIAgent.query.all()
        return jsonify({
            'success': True,
            'agents': [agent.to_dict() for agent in agents]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents', methods=['POST'])
def create_agent():
    """Create a new AI agent"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'provider', 'model', 'api_key']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create new agent
        agent = AIAgent(
            name=data['name'],
            provider=data['provider'],
            model=data['model'],
            api_key=data['api_key'],
            status='inactive'
        )
        
        # Set optional fields
        if 'config' in data:
            agent.set_config(data['config'])
        if 'tools' in data:
            agent.set_tools(data['tools'])
        
        db.session.add(agent)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'agent': agent.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        return jsonify({
            'success': True,
            'agent': agent.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>', methods=['PUT'])
def update_agent(agent_id):
    """Update an AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            agent.name = data['name']
        if 'provider' in data:
            agent.provider = data['provider']
        if 'model' in data:
            agent.model = data['model']
        if 'api_key' in data:
            agent.api_key = data['api_key']
        if 'config' in data:
            agent.set_config(data['config'])
        if 'tools' in data:
            agent.set_tools(data['tools'])
        if 'status' in data:
            agent.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'agent': agent.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        db.session.delete(agent)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Agent deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>/activate', methods=['POST'])
def activate_agent(agent_id):
    """Activate an AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        agent.status = 'active'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'agent': agent.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>/deactivate', methods=['POST'])
def deactivate_agent(agent_id):
    """Deactivate an AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        agent.status = 'inactive'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'agent': agent.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Enhanced Agent Management Endpoints
@ai_agent_bp.route('/agents/favorites', methods=['GET'])
def get_favorite_agents():
    """Get user's favorite agents"""
    try:
        # Mock implementation - in production would filter by user favorites
        agents = AIAgent.query.filter(AIAgent.status == 'active').limit(5).all()
        return jsonify({
            'success': True,
            'favorites': [agent.to_dict() for agent in agents]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/<int:agent_id>/favorite', methods=['PUT'])
def toggle_agent_favorite(agent_id):
    """Toggle agent favorite status"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        # Mock implementation - in production would update user preferences
        return jsonify({
            'success': True,
            'agent_id': agent_id,
            'is_favorite': True,  # Would be toggled in real implementation
            'message': f'Agent {agent.name} favorite status updated'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/recent', methods=['GET'])
def get_recent_agents():
    """Get recently used agents"""
    try:
        # Mock implementation - return recently active agents
        agents = AIAgent.query.filter(AIAgent.status.in_(['active', 'processing'])).limit(8).all()
        return jsonify({
            'success': True,
            'recent': [agent.to_dict() for agent in agents]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/analytics', methods=['GET'])
def get_agent_analytics():
    """Get agent usage analytics"""
    try:
        agents = AIAgent.query.all()
        analytics = []
        
        for agent in agents:
            # Mock analytics data
            analytics.append({
                'agent_id': agent.id,
                'name': agent.name,
                'usage_count': 42,  # Mock data
                'last_used': '2025-09-29T18:30:00Z',
                'performance_metrics': {
                    'response_time_avg': 1.2,
                    'success_rate': 0.95,
                    'total_conversations': 15,
                    'total_messages': 127
                },
                'status': agent.status
            })
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Search and Filtering Endpoints
@ai_agent_bp.route('/search', methods=['GET'])
def search():
    """Global search across agents, conversations, and tools"""
    try:
        query = request.args.get('q', '')
        search_type = request.args.get('type', 'all')
        
        results = {
            'agents': [],
            'conversations': [],
            'tools': []
        }
        
        if search_type in ['all', 'agents']:
            # Search agents
            agents = AIAgent.query.filter(
                AIAgent.name.ilike(f'%{query}%') |
                AIAgent.provider.ilike(f'%{query}%') |
                AIAgent.model.ilike(f'%{query}%')
            ).limit(10).all()
            results['agents'] = [agent.to_dict() for agent in agents]
        
        # Mock conversation and tool results
        if search_type in ['all', 'conversations']:
            results['conversations'] = [
                {'id': 1, 'name': f'Conversation about {query}', 'participants': 2}
            ]
        
        if search_type in ['all', 'tools']:
            results['tools'] = [
                {'id': 1, 'name': f'Calculator tool for {query}', 'description': 'Math operations'}
            ]
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_agent_bp.route('/agents/filter', methods=['GET'])
def filter_agents():
    """Advanced agent filtering"""
    try:
        status = request.args.get('status')
        provider = request.args.get('provider')
        tags = request.args.get('tags')
        
        query = AIAgent.query
        
        if status:
            query = query.filter(AIAgent.status == status)
        if provider:
            query = query.filter(AIAgent.provider.ilike(f'%{provider}%'))
        
        agents = query.limit(50).all()
        
        return jsonify({
            'success': True,
            'agents': [agent.to_dict() for agent in agents],
            'filters': {
                'status': status,
                'provider': provider,
                'tags': tags
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

