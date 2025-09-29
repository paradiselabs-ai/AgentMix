from src.models.user import db
from datetime import datetime
import json

class Tool(db.Model):
    """Model for AI tools and integrations"""
    __tablename__ = 'tools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    display_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    tool_type = db.Column(db.String(50), nullable=False)  # 'builtin', 'mcp', 'api', 'custom'
    category = db.Column(db.String(50))  # 'utility', 'search', 'computation', 'communication'
    
    # Configuration
    config_schema = db.Column(db.Text)  # JSON schema for configuration
    default_config = db.Column(db.Text)  # Default configuration JSON
    
    # Tool definition
    function_definition = db.Column(db.Text)  # JSON function definition for AI
    implementation = db.Column(db.Text)  # Implementation details or endpoint
    
    # Status and metadata
    is_active = db.Column(db.Boolean, default=True)
    requires_auth = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_name': self.display_name,
            'description': self.description,
            'tool_type': self.tool_type,
            'category': self.category,
            'config_schema': json.loads(self.config_schema) if self.config_schema else None,
            'default_config': json.loads(self.default_config) if self.default_config else None,
            'function_definition': json.loads(self.function_definition) if self.function_definition else None,
            'implementation': self.implementation,
            'is_active': self.is_active,
            'requires_auth': self.requires_auth,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AgentTool(db.Model):
    """Association table for agents and their available tools"""
    __tablename__ = 'agent_tools'
    
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('ai_agents.id'), nullable=False)
    tool_id = db.Column(db.Integer, db.ForeignKey('tools.id'), nullable=False)
    
    # Tool-specific configuration for this agent
    tool_config = db.Column(db.Text)  # JSON configuration
    is_enabled = db.Column(db.Boolean, default=True)
    
    # Usage tracking
    usage_count = db.Column(db.Integer, default=0)
    last_used = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    agent = db.relationship('AIAgent', backref='agent_tools')
    tool = db.relationship('Tool', backref='agent_tools')
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'tool_id': self.tool_id,
            'tool_config': json.loads(self.tool_config) if self.tool_config else None,
            'is_enabled': self.is_enabled,
            'usage_count': self.usage_count,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tool': self.tool.to_dict() if self.tool else None
        }

class ToolExecution(db.Model):
    """Model for tracking tool executions"""
    __tablename__ = 'tool_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey('ai_agents.id'), nullable=False)
    tool_id = db.Column(db.Integer, db.ForeignKey('tools.id'), nullable=False)
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id'))
    
    # Execution details
    input_data = db.Column(db.Text)  # JSON input parameters
    output_data = db.Column(db.Text)  # JSON output result
    status = db.Column(db.String(20), default='pending')  # 'pending', 'running', 'completed', 'failed'
    error_message = db.Column(db.Text)
    
    # Timing
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    execution_time = db.Column(db.Float)  # seconds
    
    # Relationships
    agent = db.relationship('AIAgent', backref='tool_executions')
    tool = db.relationship('Tool', backref='tool_executions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'tool_id': self.tool_id,
            'conversation_id': self.conversation_id,
            'input_data': json.loads(self.input_data) if self.input_data else None,
            'output_data': json.loads(self.output_data) if self.output_data else None,
            'status': self.status,
            'error_message': self.error_message,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'execution_time': self.execution_time,
            'tool': self.tool.to_dict() if self.tool else None
        }

