import React, { useState, useEffect } from 'react';
import { Bot, Activity, MessageSquare, Wrench, Palette } from 'lucide-react';
import './App.css';

// Import basic components
import AgentForm from './components/AgentForm';
import AgentList from './components/AgentList';
import ConversationViewHITL from './components/ConversationViewHITL';
import ToolsManager from './components/ToolsManager';
import CollaborativeCanvas from './components/CollaborativeCanvas';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchConversations();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'canvas', label: 'Canvas', icon: Palette }
  ];

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
                <Bot className="h-4 w-4" />
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
              <h2 className="text-2xl font-bold">Conversations</h2>
              <p className="text-gray-600">Create and manage AI-to-AI conversations with human oversight</p>
            </div>
            <ConversationViewHITL
              agents={agents}
            />
          </div>
        );
      
      case 'tools':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Tools Manager</h2>
              <p className="text-gray-600">Manage AI tools and assign them to agents</p>
            </div>
            <ToolsManager />
          </div>
        );
      
      case 'canvas':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Collaborative Canvas</h2>
              <p className="text-gray-600">Create and collaborate with AI agents on visual content</p>
            </div>
            <CollaborativeCanvas />
          </div>
        );
      
      // projects tab temporarily removed for MVP
      
      default:
        return <Dashboard agents={agents} conversations={conversations} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AgentMix</h1>
                <p className="text-xs text-gray-500">AI Collaboration Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {agents.filter(a => a.status === 'active').length} Active Agents
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

