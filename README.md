# AgentMix - AI-to-AI Collaboration Platform

A modern platform that enables multiple AI agents to communicate and collaborate in real-time conversations with human oversight.

## Features

✅ **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter, Ollama, LM Studio
✅ **Dynamic Model Discovery**: Auto-populates available models based on API keys
✅ **Real-time AI-to-AI Communication**: Watch agents collaborate live
✅ **Human-in-the-Loop (HITL)**: Join conversations and guide AI interactions
✅ **Conversation Management**: Create, edit, delete, and manage conversations
✅ **Free Model Support**: Use free models from OpenRouter and local providers
✅ **WebSocket Real-time Updates**: Live message streaming
✅ **Professional UI**: Clean, responsive design with glassmorphic effects

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
agentmix/
├── backend/                 # Flask backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS styles
│   │   └── main.jsx        # Application entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Key Components

### Backend
- **AI Provider Service**: Manages multiple AI providers and model discovery
- **Conversation Orchestrator**: Handles AI-to-AI communication flows
- **WebSocket Handler**: Real-time message broadcasting
- **Model Discovery**: Dynamic model fetching from provider APIs

### Frontend
- **AgentForm**: Create and configure AI agents
- **ConversationView**: Manage and view conversations
- **ConversationControls**: Start/stop conversations and HITL features
- **Real-time Messaging**: Live conversation updates

## API Endpoints

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/{id}/start` - Start AI conversation
- `POST /api/providers/{provider}/validate-key` - Validate API key
- `GET /api/providers` - List available providers

## Environment Variables

```bash
# Optional: Set your API keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENROUTER_API_KEY=your_openrouter_key
```

## Development Notes

- Uses SQLite database (auto-created)
- WebSocket connections for real-time updates
- Proxy configuration for development
- CORS enabled for cross-origin requests

## License

MIT License - Feel free to use and modify for your projects.

