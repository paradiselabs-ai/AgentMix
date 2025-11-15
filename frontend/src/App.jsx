import React, { useState, useEffect } from 'react';
import './App.css';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AgentForm from './components/AgentForm';
import AgentList from './components/AgentList';
import ConversationView from './components/ConversationView';
import ToolsManager from './components/ToolsManager';
import Canvas from './components/Canvas';
import Dashboard from './components/Dashboard';
import CommandPalette from './components/CommandPalette';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { ConversationProvider } from './contexts/ConversationContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchConversations();

    // Command palette keyboard shortcut
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      if (!response.ok) {
        console.warn('Agents endpoint returned error:', response.status);
        setAgents([]);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents || []);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        console.warn('Conversations endpoint returned error:', response.status);
        setConversations([]);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const handleAgentSuccess = () => {
    setShowAgentForm(false);
    setEditingAgent(null);
    fetchAgents();
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard agents={agents} conversations={conversations} />;

      case 'agents':
        if (showAgentForm) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                </h2>
                <button
                  onClick={() => {
                    setShowAgentForm(false);
                    setEditingAgent(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back to Agents
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <AgentForm
                  agent={editingAgent}
                  onSuccess={handleAgentSuccess}
                  onCancel={() => {
                    setShowAgentForm(false);
                    setEditingAgent(null);
                  }}
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI Agents</h2>
                <p className="text-gray-600">Manage and configure your AI collaboration agents</p>
              </div>
              <button
                onClick={() => setShowAgentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                Add Agent
              </button>
            </div>
            <AgentList
              agents={agents}
              loading={loading}
              onAgentUpdated={fetchAgents}
              onEditAgent={handleEditAgent}
            />
          </div>
        );

      case 'conversations':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-display-md gradient-text">AI Conversations</h2>
              <p className="text-body text-muted-foreground">Create and manage AI-to-AI conversations with human oversight</p>
            </div>
            <ConversationView 
              agents={agents} 
              onNavigateToAgents={() => setActiveTab('agents')} 
            />
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-6">
            <ToolsManager agents={agents} />
          </div>
        );

      case 'canvas':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-display-md gradient-text">Collaborative Canvas</h2>
              <p className="text-body text-muted-foreground">Create and collaborate with AI agents on visual content</p>
            </div>
            <Canvas />
          </div>
        );

      default:
        return <Dashboard agents={agents} conversations={conversations} />;
    }
  };

  return (
    <ConversationProvider>
      <div className="min-h-screen dark">
        {/* Logo Header - Above Sidebar */}
        <div className="fixed top-0 left-0 z-50 w-64 h-16 flex items-center px-6 bg-card border-b border-r border-border">
          <div className="flex items-center gap-1.5">
            <img src="/favicon2.png" alt="AgentMix" className="h-6 w-6" />
            <span className="text-xl font-bold" style={{ color: '#8717E1' }}>
              AgentMix
            </span>
          </div>
        </div>

        {/* Main Header - Right of Logo */}
        <Header
          agents={agents}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agents={agents}
          conversations={conversations}
        />

        <main className="ml-64 pt-16 transition-all duration-300 min-h-screen">
          <div className="p-6 lg:p-8">
            <div className="animate-slide-in-up">
              {renderContent()}
            </div>
          </div>
        </main>

        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setShowCommandPalette(false);
          }}
        />

        <PWAInstallPrompt />
        <OfflineIndicator />
      </div>
    </ConversationProvider>
  );
}

export default App;

