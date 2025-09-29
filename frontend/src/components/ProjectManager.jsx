import React, { useState, useEffect } from 'react';
import { Plus, Folder, Users, Calendar, CheckCircle, Clock, AlertCircle, FileText, MessageSquare, Trash2 } from 'lucide-react';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    assignedAgents: [],
    deadline: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchAgents();
  }, []);

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


  const createProject = () => {
    if (!newProject.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    const project = {
      id: Date.now(),
      ...newProject,
      status: 'planning',
      createdAt: new Date().toISOString().split('T')[0],
      tasks: [],
      files: [],
      messages: []
    };

    setProjects([...projects, project]);
    setNewProject({
      name: '',
      description: '',
      assignedAgents: [],
      deadline: '',
      priority: 'medium'
    });
    setShowCreateForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'planning': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : `Agent ${agentId}`;
  };

  const addTaskToProject = (projectId) => {
    const taskTitle = prompt('Enter task title:');
    if (taskTitle) {
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          const newTask = {
            id: Date.now(),
            title: taskTitle,
            status: 'pending',
            assignedTo: p.assignedAgents[0] || null
          };
          return { ...p, tasks: [...p.tasks, newTask] };
        }
        return p;
      }));
    }
  };

  const toggleTaskStatus = (projectId, taskId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              const newStatus = t.status === 'completed' ? 'pending' :
                t.status === 'pending' ? 'in_progress' : 'completed';
              return { ...t, status: newStatus };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const deleteProject = (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  // Removed simulation helpers for MVP release

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Manager</h1>
        <p className="text-gray-600">Manage collaborative projects with AI agents</p>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <span className="text-sm text-gray-600">
            {projects.length} projects • {projects.filter(p => p.status === 'in_progress').length} active
          </span>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe the project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newProject.priority}
                onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agents</label>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {agents.map(agent => (
                  <label key={agent.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProject.assignedAgents.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProject({
                            ...newProject,
                            assignedAgents: [...newProject.assignedAgents, agent.id]
                          });
                        } else {
                          setNewProject({
                            ...newProject,
                            assignedAgents: newProject.assignedAgents.filter(id => id !== agent.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{agent.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={createProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Create Project
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Folder className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              
              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{project.tasks.length}</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{project.assignedAgents.length}</div>
                  <div className="text-xs text-gray-500">Agents</div>
                </div>
              </div>
              
              {/* Assigned Agents */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Assigned Agents</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.assignedAgents.map(agentId => (
                    <span key={agentId} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {getAgentName(agentId)}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Deadline */}
              {project.deadline && (
                <div className="flex items-center space-x-1 mb-4">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Due: {project.deadline}</span>
                </div>
              )}
              
              {/* Recent Tasks */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tasks</span>
                  <button
                    onClick={() => addTaskToProject(project.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    + Add Task
                  </button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {project.tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTaskStatus(project.id, task.id)}
                        className={`flex-shrink-0 ${getStatusColor(task.status)} p-1 rounded`}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <span className="text-sm text-gray-700 truncate">{task.title}</span>
                    </div>
                  ))}
                  {project.tasks.length > 3 && (
                    <div className="text-xs text-gray-500">+{project.tasks.length - 3} more tasks</div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tasks</h3>
                  <div className="space-y-2">
                    {selectedProject.tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                        <button
                          onClick={() => toggleTaskStatus(selectedProject.id, task.id)}
                          className={`flex-shrink-0 ${getStatusColor(task.status)} p-1 rounded`}
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500">
                            Assigned to: {getAgentName(task.assignedTo)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Messages */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Messages</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedProject.messages.map(message => (
                      <div key={message.id} className="p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center space-x-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">{message.from}</span>
                          <span className="text-xs text-blue-600">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-blue-800">{message.message}</p>
                      </div>
                    ))}
                    {selectedProject.messages.length === 0 && (
                      <p className="text-sm text-gray-500">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;

