from src.models.user import db
from datetime import datetime

class Conversation(db.Model):
    id = db.Column(db.String(100), primary_key=True)  # UUID or custom ID
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    participants = db.Column(db.Text, nullable=False)  # JSON string of agent IDs
    status = db.Column(db.String(20), default='active')  # active, paused, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Conversation {self.name}>'

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'participants': json.loads(self.participants) if self.participants else [],
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def set_participants(self, participant_ids):
        import json
        self.participants = json.dumps(participant_ids)

    def get_participants(self):
        import json
        return json.loads(self.participants) if self.participants else []

