// AgentMix Platform JavaScript
class AgentMixApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.agents = [
            {
                id: "quinn-bard",
                name: "Quinn the Quantum Bard",
                status: "active",
                model: "meta-llama/llama-3.1-8b-instruct:free",
                capabilities: ["creative", "metaphors", "quantum-physics"],
                color: "#8B5CF6"
            },
            {
                id: "tech-critic",
                name: "Tech Critic",
                status: "active",
                model: "google/gemma-2-9b-it:free",
                capabilities: ["analysis", "criticism", "logic"],
                color: "#06B6D4"
            },
            {
                id: "creative-writer",
                name: "Creative Writer",
                status: "inactive",
                model: "google/gemma-2-9b-it:free",
                capabilities: ["writing", "storytelling", "creative"],
                color: "#10B981"
            }
        ];
        
        this.conversations = [
            {
                id: "demo-conv",
                title: "Demo Conversation",
                participants: ["Tech Critic", "Quinn the Quantum Bard"],
                status: "completed",
                messages: 20,
                date: "9/17/2025"
            },
            {
                id: "creative-collab",
                title: "Creative Writing Collaboration",
                participants: ["Creative Writer", "Tech Critic"],
                status: "completed",
                messages: 15,
                date: "9/12/2025"
            }
        ];
        
        this.messages = [
            {
                agent: "Tech Critic",
                text: "Let's analyze the efficiency of quantum computing applications in real-world scenarios.",
                avatar: "TC",
                color: "#06B6D4"
            },
            {
                agent: "Quinn the Quantum Bard",
                text: "Ah, the quantum realm dances with possibilities! Like Schrödinger's cat, each qubit exists in superposition until the moment of measurement collapses reality into a single truth.",
                avatar: "QB",
                color: "#8B5CF6"
            },
            {
                agent: "Tech Critic",
                text: "While your metaphor is poetic, we need to focus on practical metrics: error rates, coherence times, and scalability challenges.",
                avatar: "TC",
                color: "#06B6D4"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupButtons();
        this.setupCanvas();
        this.initChart();
        this.simulateRealTimeUpdates();
        this.setupConversations();
        this.setupTools();
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }
    
    switchSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Remove active class from nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Set active nav item
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Initialize section-specific functionality
        if (sectionName === 'dashboard') {
            this.updateDashboardMetrics();
        } else if (sectionName === 'canvas') {
            this.initializeCanvas();
        }
    }
    
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.performSearch(query);
            });
        }
    }
    
    performSearch(query) {
        if (query.length < 2) return;
        
        // Simple search simulation
        console.log(`Searching for: ${query}`);
        
        // You could implement actual search functionality here
        // For now, we'll just highlight matching elements
        this.highlightSearchResults(query);
    }
    
    highlightSearchResults(query) {
        // Remove existing highlights
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            el.classList.remove('search-highlight');
        });
        
        // Add search highlight styles
        const style = document.createElement('style');
        style.textContent = `
            .search-highlight {
                background: rgba(99, 102, 241, 0.2);
                border-radius: 4px;
                animation: highlight-pulse 1s ease-out;
            }
            @keyframes highlight-pulse {
                0% { background: rgba(99, 102, 241, 0.4); }
                100% { background: rgba(99, 102, 241, 0.2); }
            }
        `;
        document.head.appendChild(style);
        
        // Find and highlight matching text
        const textElements = document.querySelectorAll('h1, h2, h3, h4, p, span');
        textElements.forEach(el => {
            if (el.textContent.toLowerCase().includes(query)) {
                el.classList.add('search-highlight');
            }
        });
    }
    
    setupButtons() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.action-buttons .btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.textContent.trim();
                this.handleQuickAction(text);
            });
        });
        
        // Agent configuration buttons
        const agentButtons = document.querySelectorAll('.agent-actions .btn');
        agentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAgentConfig(e.target.closest('.agent-card'));
            });
        });
        
        // Tool configuration buttons
        const toolButtons = document.querySelectorAll('.tool-actions .btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToolConfig(e.target.closest('.tool-card'));
            });
        });
        
        // Canvas tool buttons
        const canvasToolButtons = document.querySelectorAll('.tool-btn');
        canvasToolButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tools
                canvasToolButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                this.setCanvasTool(button.textContent.trim());
            });
        });
    }
    
    handleQuickAction(action) {
        switch(action) {
            case 'Create New Agent':
                this.showCreateAgentModal();
                break;
            case 'Start Conversation':
                this.switchSection('conversations');
                break;
            case 'Open Canvas':
                this.switchSection('canvas');
                break;
            case 'Manage Tools':
                this.switchSection('tools');
                break;
        }
    }
    
    showCreateAgentModal() {
        // Simple alert for demo - in a real app, this would open a modal
        alert('Create New Agent modal would open here. This would include:\n\n• Agent name input\n• Model selection\n• Personality configuration\n• Capabilities selection');
    }
    
    showAgentConfig(agentCard) {
        const agentName = agentCard.querySelector('h3').textContent;
        alert(`Agent Configuration for ${agentName}\n\nThis would open a detailed configuration panel with:\n\n• Model settings\n• Personality traits\n• Capabilities management\n• Performance tuning\n• Integration options`);
    }
    
    showToolConfig(toolCard) {
        const toolName = toolCard.querySelector('h3').textContent;
        alert(`Tool Configuration for ${toolName}\n\nThis would open configuration options:\n\n• Parameters and settings\n• Access permissions\n• Usage limits\n• Integration options\n• Performance monitoring`);
    }
    
    initChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Messages',
                    data: [45, 67, 89, 123, 97, 78, 56],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Tool Uses',
                    data: [23, 34, 45, 67, 54, 43, 32],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    updateDashboardMetrics() {
        // Simulate real-time metric updates
        const metricValues = document.querySelectorAll('.metric-value');
        metricValues.forEach((value, index) => {
            const currentValue = parseInt(value.textContent);
            // Add small random variation
            const variation = Math.floor(Math.random() * 3) - 1;
            const newValue = Math.max(0, currentValue + variation);
            
            if (newValue !== currentValue) {
                value.style.transform = 'scale(1.1)';
                value.style.color = '#6366F1';
                setTimeout(() => {
                    value.textContent = newValue;
                    value.style.transform = 'scale(1)';
                    value.style.color = '';
                }, 150);
            }
        });
    }
    
    setupConversations() {
        const conversationItems = document.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                conversationItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                // Update chat interface (simplified)
                this.loadConversation(item);
            });
        });
    }
    
    loadConversation(conversationItem) {
        const title = conversationItem.querySelector('h4').textContent;
        const chatTitle = document.querySelector('.chat-header h3');
        if (chatTitle) {
            chatTitle.textContent = title;
        }
        
        // In a real app, this would load the actual conversation messages
        console.log(`Loading conversation: ${title}`);
    }
    
    setupTools() {
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            const configBtn = card.querySelector('.btn');
            if (configBtn) {
                configBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const toolName = card.querySelector('h3').textContent;
                    this.demonstrateToolUsage(toolName);
                });
            }
        });
    }
    
    demonstrateToolUsage(toolName) {
        const demos = {
            'Calculator': 'Calculator tool demonstration:\n\nInput: 15 + 27 * 3\nOutput: 96\n\nThe calculator can handle complex mathematical operations, functions, and scientific calculations.',
            'Web Search': 'Web Search tool demonstration:\n\nQuery: "latest AI developments 2025"\nResults: Found 1,247 relevant articles\n\nTop result: "Breakthrough in Quantum AI Processing"\nSource: TechNews.com',
            'File Reader': 'File Reader tool demonstration:\n\nFile: project_data.csv\nSize: 2.3 MB\nRows: 15,847\nColumns: 12\n\nContent successfully parsed and ready for analysis.',
            'Code Executor': 'Code Executor tool demonstration:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))\n```\n\nOutput: 55\nExecution time: 0.023s',
            'Data Analyzer': 'Data Analyzer tool demonstration:\n\nDataset: user_metrics.json\nAnalysis complete:\n\n• Mean engagement: 73.2%\n• Correlation coefficient: 0.847\n• Anomalies detected: 3\n• Trend: Positive (+12.5%)'
        };
        
        const demo = demos[toolName] || 'Tool demonstration not available.';
        alert(demo);
    }
    
    setupCanvas() {
        this.canvasTool = 'pen';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }
    
    initializeCanvas() {
        const canvas = document.getElementById('drawingCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Drawing settings
        ctx.strokeStyle = '#6366F1';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            [this.lastX, this.lastY] = this.getMousePos(canvas, e);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;
            
            const [currentX, currentY] = this.getMousePos(canvas, e);
            
            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            [this.lastX, this.lastY] = [currentX, currentY];
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        canvas.addEventListener('mouseout', () => {
            this.isDrawing = false;
        });
        
        // Grid toggle
        const gridToggle = document.getElementById('gridToggle');
        if (gridToggle) {
            gridToggle.addEventListener('change', (e) => {
                this.toggleGrid(canvas, ctx, e.target.checked);
            });
        }
    }
    
    getMousePos(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }
    
    toggleGrid(canvas, ctx, show) {
        if (show) {
            this.drawGrid(canvas, ctx);
        } else {
            // Redraw canvas without grid
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    drawGrid(canvas, ctx) {
        const gridSize = 20;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    setCanvasTool(tool) {
        this.canvasTool = tool.toLowerCase();
        console.log(`Canvas tool changed to: ${this.canvasTool}`);
    }
    
    simulateRealTimeUpdates() {
        // Simulate real-time status updates
        setInterval(() => {
            this.updateAgentStatuses();
            this.updateSystemStatus();
        }, 5000);
        
        // Simulate new messages
        setInterval(() => {
            this.simulateNewMessage();
        }, 10000);
    }
    
    updateAgentStatuses() {
        const statusDots = document.querySelectorAll('.agent-status');
        statusDots.forEach(dot => {
            // Randomly flicker status to show activity
            if (dot.classList.contains('active')) {
                dot.style.opacity = '0.7';
                setTimeout(() => {
                    dot.style.opacity = '1';
                }, 200);
            }
        });
    }
    
    updateSystemStatus() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            // Simulate occasional status changes
            const statuses = [
                { text: 'All Systems Online', class: 'active' },
                { text: 'Processing...', class: 'active' },
                { text: 'High Activity', class: 'active' }
            ];
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            statusText.textContent = randomStatus.text;
        }
    }
    
    simulateNewMessage() {
        if (this.currentSection !== 'conversations') return;
        
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const newMessages = [
            {
                agent: "Quinn the Quantum Bard",
                text: "The quantum entanglement of ideas creates infinite possibilities in our collaborative space!",
                avatar: "QB",
                color: "#8B5CF6"
            },
            {
                agent: "Tech Critic",
                text: "Let's focus on measurable outcomes and data-driven insights.",
                avatar: "TC",
                color: "#06B6D4"
            }
        ];
        
        const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.innerHTML = `
            <div class="message-avatar" style="background: ${randomMessage.color}">${randomMessage.avatar}</div>
            <div class="message-content">
                <div class="message-author">${randomMessage.agent}</div>
                <div class="message-text">${randomMessage.text}</div>
            </div>
        `;
        
        // Add fade-in animation
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(10px)';
        chatMessages.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transition = 'all 0.3s ease';
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Update message count
        const messageCount = document.querySelector('.conversation-item.active .message-count');
        if (messageCount) {
            const current = parseInt(messageCount.textContent);
            messageCount.textContent = `${current + 1} messages`;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AgentMixApp();
    
    // Make app globally accessible for debugging
    window.AgentMixApp = app;
    
    console.log('AgentMix Platform initialized successfully!');
    console.log('Available features:');
    console.log('• Interactive navigation');
    console.log('• Real-time status updates');
    console.log('• Canvas drawing tools');
    console.log('• Live chat simulation');
    console.log('• Tool demonstrations');
    console.log('• Search functionality');
});