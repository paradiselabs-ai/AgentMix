from flask import Blueprint, request, jsonify
from src.models.tool import Tool, AgentTool, ToolExecution
from src.models.ai_agent import AIAgent
from src.services.tool_registry import tool_registry
from src.models.user import db
import json

tools_bp = Blueprint('tools', __name__)

@tools_bp.route('/api/tools', methods=['GET'])
def get_tools():
    """Get all available tools"""
    try:
        tools = Tool.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'tools': [tool.to_dict() for tool in tools]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/tools/<int:tool_id>', methods=['GET'])
def get_tool(tool_id):
    """Get a specific tool"""
    try:
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        return jsonify({
            'success': True,
            'tool': tool.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/agents/<int:agent_id>/tools', methods=['GET'])
def get_agent_tools(agent_id):
    """Get tools assigned to a specific agent"""
    try:
        agent = AIAgent.query.get(agent_id)
        if not agent:
            return jsonify({'success': False, 'error': 'Agent not found'}), 404
        
        agent_tools = AgentTool.query.filter_by(agent_id=agent_id, is_enabled=True).all()
        
        return jsonify({
            'success': True,
            'agent_id': agent_id,
            'tools': [at.to_dict() for at in agent_tools]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/agents/<int:agent_id>/tools', methods=['POST'])
def assign_tool_to_agent(agent_id):
    """Assign a tool to an agent"""
    try:
        data = request.get_json()
        tool_id = data.get('tool_id')
        config = data.get('config', {})
        
        if not tool_id:
            return jsonify({'success': False, 'error': 'tool_id is required'}), 400
        
        # Check if agent exists
        agent = AIAgent.query.get(agent_id)
        if not agent:
            return jsonify({'success': False, 'error': 'Agent not found'}), 404
        
        # Check if tool exists
        tool = Tool.query.get(tool_id)
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        # Assign tool to agent
        success = tool_registry.assign_tool_to_agent(agent_id, tool_id, config)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Tool {tool.name} assigned to agent {agent.name}'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to assign tool'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/agents/<int:agent_id>/tools/<int:tool_id>', methods=['DELETE'])
def remove_tool_from_agent(agent_id, tool_id):
    """Remove a tool from an agent"""
    try:
        agent_tool = AgentTool.query.filter_by(agent_id=agent_id, tool_id=tool_id).first()
        
        if not agent_tool:
            return jsonify({'success': False, 'error': 'Tool assignment not found'}), 404
        
        agent_tool.is_enabled = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tool removed from agent'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/tools/execute', methods=['POST'])
def execute_tool():
    """Execute a tool"""
    try:
        data = request.get_json()
        tool_name = data.get('tool_name')
        parameters = data.get('parameters', {})
        agent_id = data.get('agent_id')
        conversation_id = data.get('conversation_id')
        
        if not tool_name or not agent_id:
            return jsonify({'success': False, 'error': 'tool_name and agent_id are required'}), 400
        
        # Check if agent has access to this tool
        tool = Tool.query.filter_by(name=tool_name).first()
        if not tool:
            return jsonify({'success': False, 'error': 'Tool not found'}), 404
        
        agent_tool = AgentTool.query.filter_by(agent_id=agent_id, tool_id=tool.id, is_enabled=True).first()
        if not agent_tool:
            return jsonify({'success': False, 'error': 'Agent does not have access to this tool'}), 403
        
        # Execute the tool
        result = tool_registry.execute_tool(tool_name, parameters, agent_id, conversation_id)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/tools/executions', methods=['GET'])
def get_tool_executions():
    """Get tool execution history"""
    try:
        agent_id = request.args.get('agent_id')
        conversation_id = request.args.get('conversation_id')
        limit = int(request.args.get('limit', 50))
        
        query = ToolExecution.query
        
        if agent_id:
            query = query.filter_by(agent_id=agent_id)
        if conversation_id:
            query = query.filter_by(conversation_id=conversation_id)
        
        executions = query.order_by(ToolExecution.started_at.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'executions': [execution.to_dict() for execution in executions]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/tools/categories', methods=['GET'])
def get_tool_categories():
    """Get available tool categories"""
    try:
        categories = db.session.query(Tool.category).filter(Tool.category.isnot(None)).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({
            'success': True,
            'categories': category_list
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tools_bp.route('/api/tools/initialize', methods=['POST'])
def initialize_tools():
    """Initialize built-in tools in the database"""
    try:
        tool_registry.initialize_database_tools()
        
        return jsonify({
            'success': True,
            'message': 'Built-in tools initialized successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

