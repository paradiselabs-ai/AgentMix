---
trigger: always_on
---

# WINDSURF AGENTMIX2 GUIDANCE

**MISSION**: Clean up AgentMix, remove all placeholder data, verify full functionality, and prepare production-ready MVP for demo video.

## 🎯 PROJECT OVERVIEW

### What is AgentMix?
AgentMix is an AI collaboration platform that enables multiple AI agents to communicate and collaborate in real-time conversations with human oversight (HITL - Human-in-the-Loop).

**Core Features:**
- **AI Agent Management**: Create, configure, and manage AI agents with different models and capabilities
- **Real-time Conversations**: Agent-to-agent communication via WebSocket
- **Human-in-the-Loop Controls**: Pause, resume, and intervene in AI conversations
- **Collaborative Canvas**: Visual workspace for agent collaboration
- **Tool Integration**: Agents can use tools and MCP servers
- **Dashboard**: Monitor platform performance and agent activity

### Previous Session (agentmix-coordination.json)
The first coordination session between Claude Code and Windsurf completed:
- ✅ **Phase 1-4 COMPLETED**: WebSocket/CORS fixes, backend handlers, circular imports resolved, database relationships secured
- ✅ **Phase 5 COMPLETED**: HITL state synchronization with ConversationProvider
- ✅ **Frontend Styling**: Updated to Perplexity dark theme with proper layout
- ✅ **Infrastructure**: All core WebSocket, API, and database functionality working

### Current Session (agentmix2-coordination.json)
**NEW GOALS:**
1. Remove ALL fake/placeholder data from frontend and backend
2. Verify all functionality still works after cleanup
3. Polish UX for production (loading states, error handling, empty states)
4. Prepare working MVP for demo video recording

### What is ACT?
**ACT (Agent Coordination Toolkit)** is a separate standalone WebSocket-based coordination server that enables autonomous multi-agent collaboration. ACT integration is **DEFERRED** for now - we need AgentMix working perfectly first, THEN we'll integrate ACT later.

## 📁 PROJECT STRUCTURE

```
AgentMix/
├── backend/                          # Flask/Python backend
│   ├── src/
│   │   ├── routes/                  # API endpoints
│   │   ├── services/                # Business logic
│   │   ├── models/                  # Database models
│   │   └── main.py                  # Flask app entry
│   └── requirements.txt
├── frontend/                         # React/Vite frontend (YOUR PRIMARY FOCUS)
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── contexts/                # React contexts (ConversationProvider)
│   │   ├── styles/                  # CSS files (Perplexity dark theme)
│   │   └── App.jsx                  # Main app component
│   └── package.json
├── agentmix-coordination.json       # Previous session (REFERENCE ONLY)
├── agentmix2-coordination.json      # Current session (ACTIVE)
└── WINDSURF_AGENTMIX2_GUIDANCE.md  # This file
```

## 🚀 COORDINATION PROTOCOL

**CRITICAL**: Use `agentmix2-coordination.json` for all coordination with Claude Code.

### Coordination Workflow
1. **Read agentmix2-coordination.json** to see current phase and your assigned tasks
2. **Claim your task** by updating status to "in_progress"
3. **Complete your task** and update status to "completed" with completion timestamp
4. **Add communication log entry** for important updates or blockers
5. **Coordinate with Claude Code** through the JSON file updates

### Your Typical Task Flow
```json
{
  "tasks": {
    "remove_frontend_placeholders": {
      "status": "in_progress",
      "assigned_to": "windsurf_cascade",
      "started_at": "2025-10-01T10:30:00-05:00"
    }
  }
}
```

After completion:
```json
{
  "tasks": {
    "remove_frontend_placeholders": {
      "status": "completed",
      "assigned_to": "windsurf_cascade",
      "started_at": "2025-10-01T10:30:00-05:00",
      "completed_at": "2025-10-01T11:45:00-05:00",
      "note": "Removed all placeholder data from 15 components"
    }
  },
  "communication_log": [
    {
      "timestamp": "2025-10-01T11:45:00-05:00",
      "agent": "windsurf_cascade",
      "message": "Frontend placeholders removed. Ready for Claude Code to verify backend cleanup before testing.",
      "type": "task_completion"
    }
  ]
}
```

## 🎯 YOUR CURRENT PRIORITIES

### Phase 1: Remove Frontend Placeholder Data (ACTIVE)
**Your Task:** Remove all placeholder, fake, mock, and dummy data from React components

**Files to Clean:**
- `EnhancedDashboard.jsx` - Remove fake metrics, placeholder stats
- `EnhancedSidebar.jsx` - Remove placeholder navigation items
- `EnhancedHeader.jsx` - Remove placeholder user data
- `AgentList.jsx` - Remove fake agent cards
- `ConversationView.jsx` - Remove placeholder messages
- `ConversationViewHITL.jsx` - Remove test conversation data
- `ToolsManager.jsx` - Remove placeholder tools
- `EnhancedCanvas.jsx` - Remove fake canvas content
- All other components with "placeholder", "fake", "dummy", "mock", "TODO", "FIXME"

**Goal:** Clean empty state - no agents, no conversations, no data on fresh start

### Phase 2: Verify Frontend Functionality (NEXT)
**Your Tasks:**
- Test conversation UI updates in real-time via WebSocket
- Test HITL controls (pause/resume/intervention)
- Verify canvas functionality
- Test all CRUD operations from UI perspective

### Phase 3: Production Polish (AFTER VERIFICATION)
**Your Tasks:**
- Add helpful empty states with clear CTAs (e.g., "Create your first agent")
- Add loading indicators for async operations
- Improve error messages (user-friendly, actionable)
- Optimize component rendering performance

## 🔧 TECHNICAL FOCUS AREAS

### Core Frontend Components (Your Domain)

#### Main Layout Components
```jsx
- App.jsx                    // Main app with routing
- EnhancedHeader.jsx         // Top navigation bar
- EnhancedSidebar.jsx        // Left sidebar navigation
- EnhancedDashboard.jsx      // Main dashboard view
```

#### Feature Components
```jsx
- AgentForm.jsx              // Create/edit agents
- AgentList.jsx              // List all agents
- ConversationView.jsx       // Base conversation component
- ConversationViewHITL.jsx   // HITL conversation with controls
- ConversationControls.jsx   // Pause/resume/intervention buttons
- EnhancedToolsManager.jsx   // Tool management
- EnhancedCanvas.jsx         // Collaborative canvas
- CommandPalette.jsx         // Quick actions (Cmd+K)
```

#### Context Providers (IMPORTANT - Already Implemented)
```jsx
- ConversationContext.jsx    // Centralized conversation state
  - Manages WebSocket connection
  - Handles conversation state (paused, messages, etc.)
  - Provides shared state to all conversation components
```

### WebSocket Integration (Already Working)
```javascript
// ConversationContext provides shared socket
const { socket, conversationState, actions } = useConversation();

// Socket events (already implemented):
socket.on('new_message', handleNewMessage);
socket.on('conversation_paused', handlePaused);
socket.on('conversation_resumed', handleResumed);
socket.on('human_input_requested', handleInputRequest);
```

### Styling (Already Implemented - Perplexity Dark Theme)
- `src/styles/perplexity-base.css` - Design system variables
- `src/mobile-responsive.css` - Responsive overrides
- Dark theme with colors: `--bg: #0F0F0F`, `--surface: #1A1A1A`

## 🔍 DEVELOPMENT COMMANDS

### Frontend Development (Your Focus)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development server on :5174
```

### Backend (Claude Code handles, but you should know)
```bash
cd backend
python src/main.py   # Flask server on :5000
```

### Full Stack (Both running)
```bash
# Terminal 1 - Backend
cd backend && python src/main.py

# Terminal 2 - Frontend
cd frontend && npm run dev

# Access at http://localhost:5174
```

## 🚨 CRITICAL SUCCESS FACTORS

### Must-Have Features (Production MVP)
- ✅ **Clean Start**: No fake data, empty state with helpful CTAs
- ✅ **Agent CRUD**: Create, edit, delete agents works perfectly
- ✅ **Real-time Conversations**: Agent-to-agent messaging via WebSocket
- ✅ **HITL Controls**: Pause/resume/intervention works seamlessly
- ✅ **Tools**: Add/remove tools from agents
- ✅ **Canvas**: Collaborative workspace functional
- ✅ **Error Handling**: User-friendly errors with recovery options
- ✅ **Loading States**: Clear feedback for async operations

### What's Already Done (Don't Break!)
- ✅ WebSocket connections and proxy working
- ✅ ConversationProvider context for state management
- ✅ Perplexity dark theme styling
- ✅ Responsive layout (no horizontal scroll, scrolling works)
- ✅ Service worker disabled in development

## 🔄 COORDINATION WITH CLAUDE CODE

### Division of Responsibilities
- **You (Windsurf)**: Frontend cleanup, UI verification, production polish
- **Claude Code**: Backend cleanup, API verification, database cleanup

### Communication Pattern
1. **You remove frontend placeholders** → Update coordination.json
2. **Claude removes backend placeholders** → Update coordination.json
3. **Together verify functionality** → Update coordination.json with test results
4. **You polish UI** → Update coordination.json
5. **Together prepare demo** → Update coordination.json

### Example Communication Log Entry
```json
{
  "timestamp": "2025-10-01T12:00:00-05:00",
  "agent": "windsurf_cascade",
  "message": "Frontend cleanup complete. Found and removed placeholder data from 15 components. Empty state now shows 'Create your first agent' CTA. Ready for Phase 2 verification testing.",
  "type": "phase_complete"
}
```

## 🌟 PRODUCTION MVP VISION

### What Makes AgentMix Special
- **Real-time AI Collaboration**: Multiple AI agents working together
- **Human Oversight**: HITL controls for safe AI collaboration
- **Flexible Architecture**: Support for multiple AI models and platforms
- **Modern UX**: Clean, dark theme inspired by Perplexity
- **Production Ready**: Error handling, loading states, empty states

### Your Frontend Demonstrates
- **Intuitive Interface**: Easy to create agents and start conversations
- **Real-time Updates**: WebSocket-powered live messaging
- **Professional Polish**: Loading states, errors, empty states
- **Smooth UX**: No errors, no broken features, production-quality

## 🚀 IMMEDIATE NEXT STEPS

**Right Now**:
1. Read `agentmix2-coordination.json`
2. Claim "remove_frontend_placeholders" task
3. Search frontend for placeholder/fake/mock/dummy data
4. Remove all placeholder content
5. Add empty states with helpful CTAs
6. Update coordination.json with completion

**After Frontend Cleanup**:
1. Wait for Claude Code to complete backend cleanup
2. Begin Phase 2 verification testing
3. Report any issues in coordination.json

**Demo Preparation**:
Your frontend will be the face of AgentMix in the demo video - make it shine! Clean, fast, error-free, and easy to understand.

---

Let's make AgentMix production-ready! 🚀
