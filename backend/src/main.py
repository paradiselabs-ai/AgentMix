import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from src.models.user import db
# Import all models to ensure tables are created
from src.models.ai_agent import AIAgent
from src.models.message import Message
from src.models.conversation import Conversation
# Import tool models after AIAgent to ensure proper foreign key resolution
from src.models.tool import Tool, AgentTool, ToolExecution
from src.routes.user import user_bp
from src.routes.ai_agent import ai_agent_bp
from src.routes.conversation import conversation_bp
from src.routes.ai_chat import ai_chat_bp
from src.routes.model_discovery import model_discovery_bp
from src.routes.analytics import analytics_bp
from src.routes.tools import tools_bp

# Import error handling
from src.utils.error_handler import handle_flask_errors, HealthChecker

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Initialize error handling
handle_flask_errors(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize conversation orchestrator with HITL support
from src.services.conversation_orchestrator_hitl import init_orchestrator_hitl
from src.routes.websocket_hitl import init_websocket_events_hitl

orchestrator = init_orchestrator_hitl(socketio, app)
init_websocket_events_hitl(socketio)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(ai_agent_bp, url_prefix='/api')
app.register_blueprint(conversation_bp, url_prefix='/api')
app.register_blueprint(ai_chat_bp, url_prefix='/api')
app.register_blueprint(model_discovery_bp)
app.register_blueprint(analytics_bp)
# app.register_blueprint(tools_bp)  # TEMPORARILY DISABLED - causing startup issues

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Initialize built-in tools
    # from src.services.tool_registry import tool_registry
    # tool_registry.initialize_database_tools()

# Health check endpoint
@app.route('/api/health')
def health_check():
    """System health check endpoint"""
    health_status = HealthChecker.get_system_health()
    status_code = 200 if all(health_status.values()) else 503
    return jsonify(health_status), status_code

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
