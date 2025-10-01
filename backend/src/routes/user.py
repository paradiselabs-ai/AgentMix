from flask import Blueprint, jsonify, request
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

# Mock user preferences storage (in production, this would be a database table)
user_preferences = {}

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

# User Preferences Endpoints
@user_bp.route('/user/preferences', methods=['GET'])
def get_user_preferences():
    """Get user UI preferences"""
    # Mock implementation - return default preferences
    return jsonify({
        'success': True,
        'preferences': {
            'theme': 'light',
            'layout': 'default',
            'animations': True,
            'sidebar_collapsed': False,
            'quick_actions': [
                {'id': 'create_agent', 'label': 'Create Agent', 'action': 'navigate_agents'},
                {'id': 'start_chat', 'label': 'Start Chat', 'action': 'navigate_conversations'},
                {'id': 'open_canvas', 'label': 'Open Canvas', 'action': 'navigate_canvas'}
            ],
            'favorite_agents': [],
            'shortcuts': {
                'cmd+k': 'command_palette',
                'cmd+n': 'new_agent',
                'cmd+shift+c': 'new_conversation'
            }
        }
    })

@user_bp.route('/user/preferences', methods=['PUT'])
def update_user_preferences():
    """Update user UI preferences"""
    data = request.json
    # Mock implementation - just return success
    return jsonify({
        'success': True,
        'message': 'Preferences updated successfully'
    })

# Quick Actions Endpoints
@user_bp.route('/user/quick-actions', methods=['GET'])
def get_user_quick_actions():
    """Get user's configured quick actions"""
    return jsonify({
        'success': True,
        'quick_actions': [
            {
                'id': 'create_agent',
                'title': 'Create New Agent',
                'description': 'Set up a new AI agent',
                'icon': 'Bot',
                'action': {'type': 'navigate', 'target': 'agents'}
            },
            {
                'id': 'start_conversation',
                'title': 'Start Conversation',
                'description': 'Begin AI-to-AI collaboration',
                'icon': 'MessageSquare',
                'action': {'type': 'navigate', 'target': 'conversations'}
            },
            {
                'id': 'open_canvas',
                'title': 'Open Canvas',
                'description': 'Visual collaboration workspace',
                'icon': 'Palette',
                'action': {'type': 'navigate', 'target': 'canvas'}
            }
        ]
    })

@user_bp.route('/user/quick-actions', methods=['PUT'])
def update_user_quick_actions():
    """Update quick actions"""
    data = request.json
    # Mock implementation
    return jsonify({
        'success': True,
        'message': 'Quick actions updated successfully'
    })

# Workflow Templates Endpoints
@user_bp.route('/workflows/templates', methods=['GET'])
def get_workflow_templates():
    """Get workflow templates"""
    return jsonify({
        'success': True,
        'templates': [
            {
                'id': 'research_workflow',
                'name': 'Research & Analysis',
                'description': 'Multi-agent research and analysis workflow',
                'agents': ['research_agent', 'data_analyzer'],
                'steps': ['research', 'analyze', 'summarize']
            },
            {
                'id': 'creative_workflow',
                'name': 'Creative Collaboration',
                'description': 'Brainstorming and content creation',
                'agents': ['creative_writer', 'editor'],
                'steps': ['brainstorm', 'draft', 'review', 'finalize']
            }
        ]
    })

@user_bp.route('/workflows/execute', methods=['POST'])
def execute_workflow():
    """Execute a workflow template"""
    data = request.json
    template_id = data.get('template_id')
    
    # Mock implementation
    return jsonify({
        'success': True,
        'workflow_id': f'workflow_{template_id}',
        'status': 'started',
        'message': f'Workflow {template_id} started successfully'
    })
