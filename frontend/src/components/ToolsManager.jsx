import React, { useState, useEffect } from 'react';

const ToolsManager = () => {
  const [tools, setTools] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentTools, setAgentTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchTools();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentTools(selectedAgent.id);
    }
  }, [selectedAgent]);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const data = await response.json();
      if (data.success) {
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchAgentTools = async (agentId) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/tools`);
      const data = await response.json();
      if (data.success) {
        setAgentTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching agent tools:', error);
    }
  };

  const assignToolToAgent = async (toolId) => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_id: toolId,
          config: {}
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAgentTools(selectedAgent.id);
      } else {
        alert('Failed to assign tool: ' + data.error);
      }
    } catch (error) {
      console.error('Error assigning tool:', error);
      alert('Error assigning tool');
    } finally {
      setLoading(false);
    }
  };

  const removeToolFromAgent = async (toolId) => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/tools/${toolId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchAgentTools(selectedAgent.id);
      } else {
        alert('Failed to remove tool: ' + data.error);
      }
    } catch (error) {
      console.error('Error removing tool:', error);
      alert('Error removing tool');
    } finally {
      setLoading(false);
    }
  };

  const testTool = async (toolName) => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      let parameters = {};
      
      // Set default parameters based on tool type
      switch (toolName) {
        case 'calculator':
          parameters = { expression: '2 + 2 * 3' };
          break;
        case 'web_search':
          parameters = { query: 'AI collaboration platforms', num_results: 3 };
          break;
        case 'file_operations':
          parameters = { operation: 'list', path: '.' };
          break;
        case 'code_executor':
          parameters = { code: 'print("Hello from AI tool!")' };
          break;
        default:
          parameters = {};
      }

      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_name: toolName,
          parameters: parameters,
          agent_id: selectedAgent.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Tool test successful!\\n\\nResult: ${JSON.stringify(data.result || data, null, 2)}`);
      } else {
        alert('Tool test failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error testing tool:', error);
      alert('Error testing tool');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'computation': return '🧮';
      case 'search': return '🔍';
      case 'utility': return '🛠️';
      case 'communication': return '💬';
      default: return '⚙️';
    }
  };

  const getToolTypeColor = (toolType) => {
    switch (toolType) {
      case 'builtin': return 'bg-green-100 text-green-800';
      case 'mcp': return 'bg-blue-100 text-blue-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools Manager</h1>
        <p className="text-gray-600">Manage AI tools and assign them to agents</p>
      </div>

      {/* Agent Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Agent
        </label>
        <select
          value={selectedAgent?.id || ''}
          onChange={(e) => {
            const agent = agents.find(a => a.id === parseInt(e.target.value));
            setSelectedAgent(agent);
          }}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose an agent...</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.provider})
            </option>
          ))}
        </select>
      </div>

      {selectedAgent && (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'available'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Available Tools ({tools.length})
                </button>
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'assigned'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Assigned Tools ({agentTools.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Available Tools Tab */}
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => {
                const isAssigned = agentTools.some(at => at.tool_id === tool.id);
                return (
                  <div key={tool.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getCategoryIcon(tool.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tool.display_name}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getToolTypeColor(tool.tool_type)}`}>
                            {tool.tool_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    
                    <div className="flex space-x-2">
                      {!isAssigned ? (
                        <button
                          onClick={() => assignToolToAgent(tool.id)}
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Assigning...' : 'Assign'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-gray-100 text-gray-500 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                        >
                          Already Assigned
                        </button>
                      )}
                      
                      {isAssigned && (
                        <button
                          onClick={() => testTool(tool.name)}
                          disabled={loading}
                          className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assigned Tools Tab */}
          {activeTab === 'assigned' && (
            <div className="space-y-4">
              {agentTools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tools assigned to this agent yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Switch to "Available Tools" tab to assign some tools.</p>
                </div>
              ) : (
                agentTools.map(agentTool => (
                  <div key={agentTool.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getCategoryIcon(agentTool.tool.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agentTool.tool.display_name}</h3>
                          <p className="text-gray-600 text-sm">{agentTool.tool.description}</p>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <span>Used {agentTool.usage_count} times</span>
                            {agentTool.last_used && (
                              <span>Last used: {new Date(agentTool.last_used).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testTool(agentTool.tool.name)}
                          disabled={loading}
                          className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => removeToolFromAgent(agentTool.tool_id)}
                          disabled={loading}
                          className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {!selectedAgent && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Please select an agent to manage tools</p>
        </div>
      )}
    </div>
  );
};

export default ToolsManager;

