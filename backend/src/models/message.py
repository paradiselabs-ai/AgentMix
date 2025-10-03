from src.models.user import db
from datetime import datetime

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('ai_agents.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('ai_agents.id'), nullable=True)  # None for broadcast
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='text')  # text, system, tool_call, etc.
    conversation_id = db.Column(db.String(100), nullable=True)  # Group messages by conversation
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    message_metadata = db.Column(db.Text, nullable=True)  # JSON string for additional data

    # Relationships
    sender = db.relationship('AIAgent', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('AIAgent', foreign_keys=[receiver_id], backref='received_messages')

    def __repr__(self):
        return f'<Message {self.id} from {self.sender_id} to {self.receiver_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'message_type': self.message_type,
            'conversation_id': self.conversation_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'message_metadata': self.message_metadata,
            'sender_name': getattr(self.sender, 'name', None) if self.sender else None,
            'receiver_name': getattr(self.receiver, 'name', None) if self.receiver else None
        }
