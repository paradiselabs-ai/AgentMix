# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Commands

Frontend (Vite + React, pnpm preferred)
- Install deps: pnpm install (in frontend)
- Start dev server: pnpm dev (in frontend)
- Build: pnpm build (in frontend)
- Lint: pnpm lint (in frontend)
- Preview production build: pnpm preview (in frontend)

Backend (Flask + Flask-SocketIO)
- Create venv (optional): python -m venv .venv && source .venv/bin/activate
- Install deps: pip install -r backend/requirements.txt
- Run dev server: python backend/src/main.py
  - Port defaults to 5000; override with PORT=XXXX python backend/src/main.py

Development URLs and ports
- Frontend (dev): http://localhost:5174 (strict port)
- Backend API (dev): http://localhost:5000
- WebSocket endpoint: ws(s)://localhost:5000/socket.io
- Vite proxy (dev):
  - /api -> http://localhost:5000
  - /socket.io -> http://localhost:5000 (ws enabled)

Environment variables
- AI provider keys (optional, used by backend):
  - OPENAI_API_KEY
  - ANTHROPIC_API_KEY
  - OPENROUTER_API_KEY
- Backend port:
  - PORT (defaults to 5000; honored by backend/src/main.py)

Architecture overview

Backend
- App setup: backend/src/main.py initializes Flask, enables CORS, configures Flask-SocketIO, registers blueprints, configures SQLite, and creates tables on startup.
- Persistence: SQLite via SQLAlchemy; DB file lives under backend/src/database/app.db. Models include AIAgent, Conversation, Message, Tool, User.
- HTTP APIs (selected):
  - Agents: GET/POST /api/agents
  - Conversations: GET/POST /api/conversations, POST /api/conversations/{id}/start
  - Providers: GET /api/providers, POST /api/providers/{provider}/discover-models, POST /api/providers/{provider}/validate-key, GET /api/providers/local/check-status
  - Health: GET /api/health
- AI providers: src/services/ai_provider.py and src/services/ai_provider_enhanced.py provide a unified interface to OpenAI, Anthropic, OpenRouter, Together, Groq, plus local providers (Ollama, LM Studio). Enhanced service can dynamically discover models from provider APIs and tag free models when available.
- Orchestration: src/services/conversation_orchestrator.py coordinates multi-agent turns, persists messages, and emits real-time updates over Socket.IO. The app uses the HITL-capable variant (conversation_orchestrator_hitl) for pause/resume and human message injection.
- Realtime events: Socket.IO handlers in src/routes/websocket_hitl.py (and websocket.py) implement connect/disconnect, joining/leaving conversation rooms, start/stop/pause/resume conversation, send_human_message, request_human_input, typing indicators, and status updates. Messages are broadcast to room conversation_{id}.

Frontend
- Tooling: Vite + React (ES modules), ESLint, Tailwind via @tailwindcss/vite.
- Realtime: socket.io-client is used in contexts/ConversationContext.jsx to subscribe to backend events.
- Dev server: vite.config.js sets port 5174 (strict) and proxies /api and /socket.io to the backend.

Tests
- No frontend test script is defined in package.json, and no backend pytest configuration or tests were found. Tests are not configured in this repository.

Repo configs and notes
- ESLint: frontend/eslint.config.js configures JS/JSX linting, react-hooks, and react-refresh rules; run via pnpm lint.
- Vite proxy: configured in frontend/vite.config.js; ensure backend is listening on 5000 for dev to avoid CORS issues.
- Assistant rules: No CLAUDE, Cursor, or Copilot rule files were found in this repository.
