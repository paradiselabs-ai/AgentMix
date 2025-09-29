import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, MessageSquare, Zap, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ agents }) => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    totalMessages: 0,
    toolExecutions: 0,
    projectsActive: 0
  });

  const [activityData, setActivityData] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [conversationTrends, setConversationTrends] = useState([]);

  useEffect(() => {
    generateDashboardData();
  }, [agents]);

  const generateDashboardData = () => {
    // Generate demo statistics
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    
    setStats({
      totalAgents,
      activeAgents,
      totalConversations: 15,
      totalMessages: 247,
      toolExecutions: 89,
      projectsActive: 3
    });

    // Generate activity data for the last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      activityData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: Math.floor(Math.random() * 50) + 10,
        conversations: Math.floor(Math.random() * 8) + 2,
        toolUses: Math.floor(Math.random() * 15) + 5
      });
    }
    setActivityData(activityData);

    // Generate agent performance data
    const performance = agents.map(agent => ({
      name: agent.name,
      messages: Math.floor(Math.random() * 100) + 20,
      accuracy: Math.floor(Math.random() * 20) + 80,
      responseTime: Math.floor(Math.random() * 500) + 200
    }));
    setAgentPerformance(performance);

    // Generate conversation trends
    const trends = [
      { time: '00:00', conversations: 2 },
      { time: '04:00', conversations: 1 },
      { time: '08:00', conversations: 8 },
      { time: '12:00', conversations: 12 },
      { time: '16:00', conversations: 15 },
      { time: '20:00', conversations: 9 },
      { time: '24:00', conversations: 4 }
    ];
    setConversationTrends(trends);
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'blue-topaz' }) => {
    const colorClasses = {
      'blue-topaz': 'text-blue-topaz',
      'turquoise': 'status-active',
      'purple': 'text-purple',
      'hotpink': 'status-processing',
    };

    return (
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-turquoise mr-1" />
                <span className={`text-sm font-medium ${colorClasses[color]}`}>{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg glass ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const agentStatusData = [
    { name: 'Active', value: stats.activeAgents, color: '#10B981' },
    { name: 'Inactive', value: stats.totalAgents - stats.activeAgents, color: '#EF4444' }
  ];

  return (
         <div className="breathing-space">
        {/* Header */}
        <div className="text-center compact-elegant">
          <h1 className="text-4xl font-bold gradient-text mb-2">AgentMix Dashboard</h1>
          <p className="text-text-secondary">Monitor your AI collaboration platform performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 compact-elegant">
          <StatCard
            title="Total Agents"
            value={stats.totalAgents}
            icon={Users}
            change="+12%"
            color="blue-topaz"
          />
          <StatCard
            title="Active Agents"
            value={stats.activeAgents}
            icon={Activity}
            change="+8%"
            color="turquoise"
          />
          <StatCard
            title="Conversations"
            value={stats.totalConversations}
            icon={MessageSquare}
            change="+23%"
            color="purple"
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon={CheckCircle}
            change="+15%"
            color="hotpink"
          />
          <StatCard
            title="Tool Uses"
            value={stats.toolExecutions}
            icon={Zap}
            change="+31%"
            color="turquoise"
          />
          <StatCard
            title="Active Projects"
            value={stats.projectsActive}
            icon={Clock}
            change="+5%"
            color="purple"
          />
        </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar dataKey="messages" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversations" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="toolUses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversation Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar dataKey="messages" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {agentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {agentStatusData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { icon: MessageSquare, text: 'New conversation started between Test Agent and Claude Assistant', time: '2 minutes ago', color: 'text-blue-600' },
            { icon: Zap, text: 'Calculator tool executed successfully by Test Agent', time: '5 minutes ago', color: 'text-green-600' },
            { icon: Users, text: 'New agent "Research Assistant" added to the platform', time: '10 minutes ago', color: 'text-purple-600' },
            { icon: CheckCircle, text: 'Project "Market Research Analysis" task completed', time: '15 minutes ago', color: 'text-orange-600' },
            { icon: Activity, text: 'Canvas collaboration session started', time: '20 minutes ago', color: 'text-indigo-600' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all duration-200 hover:scale-105">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Agent</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all duration-200 hover:scale-105">
            <MessageSquare className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">New Conversation</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all duration-200 hover:scale-105">
            <Zap className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Tools</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all duration-200 hover:scale-105">
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

