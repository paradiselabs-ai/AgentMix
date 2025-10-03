from src.models.user import db
from datetime import datetime
import json

class AIAgent(db.Model):
    __tablename__ = 'ai_agents'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # openai, anthropic, etc.
    model = db.Column(db.String(100), nullable=False)    # gpt-4, claude-3, etc.
    api_key = db.Column(db.String(500), nullable=False)
    config = db.Column(db.Text, nullable=True)           # JSON string for configuration
    tools = db.Column(db.Text, nullable=True)            # JSON string for tools list
    status = db.Column(db.String(20), default='inactive') # active, inactive, error
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<AIAgent {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'model': self.model,
            'config': json.loads(self.config) if self.config else {},
            'tools': json.loads(self.tools) if self.tools else [],
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def set_config(self, config_dict):
        self.config = json.dumps(config_dict)

    def get_config(self):
        return json.loads(self.config) if self.config else {}

    def set_tools(self, tools_list):
        self.tools = json.dumps(tools_list)

    def get_tools(self):
        return json.loads(self.tools) if self.tools else []

