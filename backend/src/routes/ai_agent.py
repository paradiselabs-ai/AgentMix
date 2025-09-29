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

