"""
AgentMix + ACT Integration Service
Connects AgentMix conversation orchestrator to ACT coordination system
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional
import sys
import os

# Add ACT SDK to path (act project lives alongside AgentMix)
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../act/sdk/python'))

try:
    from act_client import ACTClient
except ImportError:
    logging.error("ACT client not found. Make sure ACT SDK is properly installed.")
    ACTClient = None

logger = logging.getLogger(__name__)

class AgentMixACTIntegration:
    """Integration service connecting AgentMix to ACT coordination."""

    def __init__(self, socketio, app=None):
        self.socketio = socketio
        self.app = app
        self.act_client = None
        self.active_projects: Dict[str, Dict] = {}
        self.agent_capabilities = {
            "agentmix_orchestrator": ["conversation", "coordination", "ui", "project_management"],
            "claude_code": ["python", "backend", "debugging", "architecture", "typescript"],
            "windsurf": ["react", "frontend", "ui", "visualization", "javascript"],
        }

        if ACTClient:
            self.act_client = ACTClient(
                agent_id="agentmix_orchestrator",
                agent_name="AgentMix Conversation Orchestrator",
                capabilities=self.agent_capabilities["agentmix_orchestrator"],
                server_url="ws://localhost:8080"
            )

            # Register ACT event handlers
            self._setup_act_handlers()

    def _setup_act_handlers(self):
        """Setup ACT event handlers for AgentMix integration."""
        if not self.act_client:
            return

        @self.act_client.on('task_assigned')
        async def handle_task_assigned(data):
            """Handle task assignment from ACT coordinator."""
            task = data.get('task', {})
            agent_id = data.get('agentId')

            logger.info(f"ACT task assigned to {agent_id}: {task.get('description')}")

            # Notify AgentMix frontend
            self.socketio.emit('act_task_assigned', {
                'taskId': task.get('id'),
                'agentId': agent_id,
                'description': task.get('description'),
                'requiredCapabilities': task.get('requiredCapabilities', []),
                'timestamp': data.get('timestamp')
            })

        @self.act_client.on('conflict_detected')
        async def handle_conflict(data):
            """Handle conflict detection from ACT."""
            conflicts = data.get('conflicts', [])

            logger.warning(f"ACT conflicts detected: {len(conflicts)} conflicts")

            # Notify AgentMix frontend
            self.socketio.emit('act_conflict_detected', {
                'conflicts': conflicts,
                'timestamp': data.get('timestamp')
            })

        @self.act_client.on('agent_registered')
        async def handle_agent_registered(data):
            """Handle new agent registration."""
            agent = data.get('agent', {})

            logger.info(f"New agent registered: {agent.get('name')} with capabilities: {agent.get('capabilities')}")

            # Notify AgentMix frontend
            self.socketio.emit('act_agent_joined', {
                'agent': agent,
                'timestamp': data.get('timestamp')
            })

    async def start_act_connection(self) -> bool:
        """Start connection to ACT coordination server."""
        if not self.act_client:
            logger.error("ACT client not available")
            return False

        try:
            success = await self.act_client.connect()
            if success:
                logger.info("AgentMix successfully connected to ACT coordination server")

                # Notify frontend
                self.socketio.emit('act_connected', {
                    'status': 'connected',
                    'agentId': self.act_client.agent_id,
                    'capabilities': self.act_client.capabilities
                })

                return True
            else:
                logger.error("Failed to connect to ACT server")
                return False

        except Exception as e:
            logger.error(f"ACT connection error: {e}")
            return False

    async def create_coordinated_project(self, project_description: str, required_agents: List[Dict] = None) -> str:
        """Create a new coordinated project in ACT."""
        if not self.act_client or not self.act_client.connected:
            raise ConnectionError("Not connected to ACT server")

        project_id = f"project_{int(asyncio.get_event_loop().time())}"

        # Store project info
        self.active_projects[project_id] = {
            'description': project_description,
            'required_agents': required_agents or [],
            'created_at': asyncio.get_event_loop().time(),
            'status': 'active',
            'tasks': []
        }

        logger.info(f"Created coordinated project: {project_id}")

        # Notify frontend
        self.socketio.emit('act_project_created', {
            'projectId': project_id,
            'description': project_description,
            'requiredAgents': required_agents
        })

        return project_id

    async def add_coordinated_task(
        self,
        project_id: str,
        description: str,
        required_capabilities: List[str],
        priority: str = 'medium',
        dependencies: List[str] = None
    ) -> Optional[str]:
        """Add a task to coordinated project."""
        if not self.act_client or not self.act_client.connected:
            raise ConnectionError("Not connected to ACT server")

        if project_id not in self.active_projects:
            raise ValueError(f"Project {project_id} not found")

        try:
            task_id = await self.act_client.create_task(
                description=description,
                required_capabilities=required_capabilities,
                priority=priority,
                dependencies=dependencies or []
            )

            if task_id:
                # Add to project tracking
                self.active_projects[project_id]['tasks'].append(task_id)

                logger.info(f"Added coordinated task to project {project_id}: {description}")

                # Notify frontend
                self.socketio.emit('act_task_created', {
                    'projectId': project_id,
                    'taskId': task_id,
                    'description': description,
                    'requiredCapabilities': required_capabilities
                })

                return task_id

            return None

        except Exception as e:
            logger.error(f"Failed to add coordinated task: {e}")
            return None

    def get_project_status(self, project_id: str) -> Optional[Dict]:
        """Get status of coordinated project."""
        return self.active_projects.get(project_id)

    def get_all_projects(self) -> Dict[str, Dict]:
        """Get all active coordinated projects."""
        return self.active_projects

    async def disconnect_from_act(self):
        """Disconnect from ACT server."""
        if self.act_client and self.act_client.connected:
            await self.act_client.disconnect()

            # Notify frontend
            self.socketio.emit('act_disconnected', {
                'status': 'disconnected',
                'message': 'Disconnected from ACT coordination server'
            })

            logger.info("AgentMix disconnected from ACT server")

# Global integration instance
act_integration = None

def init_act_integration(socketio, app=None):
    """Initialize ACT integration service."""
    global act_integration
    act_integration = AgentMixACTIntegration(socketio, app)
    return act_integration

def get_act_integration():
    """Get current ACT integration instance."""
    return act_integration

# AgentMix conversation enhancement
class ACTEnhancedOrchestrator:
    """Enhanced conversation orchestrator with ACT coordination."""

    def __init__(self, base_orchestrator, act_integration):
        self.base_orchestrator = base_orchestrator
        self.act_integration = act_integration

    async def start_coordinated_conversation(self, conversation_data: Dict) -> str:
        """Start a conversation with ACT coordination."""

        # Extract agents and their capabilities
        agents = conversation_data.get('agents', [])
        project_description = conversation_data.get('description', 'Coordinated Agent Conversation')

        # Create coordinated project
        project_id = await self.act_integration.create_coordinated_project(
            project_description,
            required_agents=[{
                'role': agent.get('name', 'Agent'),
                'capabilities': agent.get('capabilities', ['conversation'])
            } for agent in agents]
        )

        # Start base conversation
        conversation_id = await self.base_orchestrator.start_conversation(conversation_data)

        logger.info(f"Started coordinated conversation: {conversation_id} with ACT project: {project_id}")

        return conversation_id