"""
Analytics and Metrics API for AgentMix Platform
Provides insights into platform usage, performance, and trends
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from src.models.user import db
from src.models.ai_agent import AIAgent
from src.models.conversation import Conversation
from src.models.message import Message
from src.utils.error_handler import handle_database_errors, DatabaseError

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
@handle_database_errors
def get_dashboard_analytics():
    """Get dashboard analytics data"""
    try:
        # Get date range (default to last 7 days)
        days = request.args.get('days', 7, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Basic counts
        total_agents = db.session.query(AIAgent).count()
        active_agents = db.session.query(AIAgent).filter(AIAgent.status == 'active').count()
        total_conversations = db.session.query(Conversation).count()
        total_messages = db.session.query(Message).count()
        
        # Recent activity
        recent_conversations = db.session.query(Conversation).filter(
            Conversation.created_at >= start_date
        ).count()
        
        recent_messages = db.session.query(Message).filter(
            Message.timestamp >= start_date
        ).count()
        
        # Agent performance
        agent_stats = db.session.query(
            AIAgent.name,
            AIAgent.provider,
            AIAgent.status,
            func.count(Message.id).label('message_count')
        ).outerjoin(Message, AIAgent.id == Message.agent_id).group_by(AIAgent.id).all()
        
        # Conversation trends (daily message counts)
        daily_stats = db.session.query(
            func.date(Message.timestamp).label('date'),
            func.count(Message.id).label('message_count'),
            func.count(func.distinct(Message.conversation_id)).label('active_conversations')
        ).filter(
            Message.timestamp >= start_date
        ).group_by(func.date(Message.timestamp)).order_by('date').all()
        
        # Provider distribution
        provider_stats = db.session.query(
            AIAgent.provider,
            func.count(AIAgent.id).label('agent_count'),
            func.count(Message.id).label('message_count')
        ).outerjoin(Message, AIAgent.id == Message.agent_id).group_by(AIAgent.provider).all()
        
        return jsonify({
            'success': True,
            'data': {
                'overview': {
                    'total_agents': total_agents,
                    'active_agents': active_agents,
                    'total_conversations': total_conversations,
                    'total_messages': total_messages,
                    'recent_conversations': recent_conversations,
                    'recent_messages': recent_messages,
                    'agent_utilization': round((active_agents / total_agents * 100) if total_agents > 0 else 0, 1)
                },
                'agent_performance': [
                    {
                        'name': stat.name,
                        'provider': stat.provider,
                        'status': stat.status,
                        'message_count': stat.message_count or 0
                    } for stat in agent_stats
                ],
                'daily_activity': [
                    {
                        'date': stat.date.isoformat() if stat.date else None,
                        'messages': stat.message_count or 0,
                        'conversations': stat.active_conversations or 0
                    } for stat in daily_stats
                ],
                'provider_distribution': [
                    {
                        'provider': stat.provider,
                        'agent_count': stat.agent_count or 0,
                        'message_count': stat.message_count or 0
                    } for stat in provider_stats
                ],
                'period': {
                    'days': days,
                    'start_date': start_date.isoformat(),
                    'end_date': datetime.utcnow().isoformat()
                }
            }
        })
        
    except Exception as e:
        raise DatabaseError(f"Failed to fetch analytics data: {str(e)}")

@analytics_bp.route('/api/analytics/conversations/<int:conversation_id>', methods=['GET'])
@handle_database_errors
def get_conversation_analytics(conversation_id):
    """Get detailed analytics for a specific conversation"""
    try:
        conversation = db.session.query(Conversation).get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Message statistics
        message_stats = db.session.query(
            func.count(Message.id).label('total_messages'),
            func.avg(func.length(Message.content)).label('avg_message_length'),
            func.min(Message.timestamp).label('first_message'),
            func.max(Message.timestamp).label('last_message')
        ).filter(Message.conversation_id == conversation_id).first()
        
        # Agent participation
        agent_participation = db.session.query(
            AIAgent.name,
            AIAgent.provider,
            func.count(Message.id).label('message_count'),
            func.avg(func.length(Message.content)).label('avg_length')
        ).join(Message, AIAgent.id == Message.agent_id).filter(
            Message.conversation_id == conversation_id
        ).group_by(AIAgent.id).all()
        
        # Message timeline (hourly breakdown)
        timeline = db.session.query(
            func.strftime('%Y-%m-%d %H:00:00', Message.timestamp).label('hour'),
            func.count(Message.id).label('message_count')
        ).filter(
            Message.conversation_id == conversation_id
        ).group_by(func.strftime('%Y-%m-%d %H:00:00', Message.timestamp)).order_by('hour').all()
        
        # Calculate conversation duration
        duration_minutes = 0
        if message_stats.first_message and message_stats.last_message:
            duration = message_stats.last_message - message_stats.first_message
            duration_minutes = duration.total_seconds() / 60
        
        return jsonify({
            'success': True,
            'data': {
                'conversation': {
                    'id': conversation.id,
                    'name': conversation.name,
                    'status': conversation.status,
                    'created_at': conversation.created_at.isoformat() if conversation.created_at else None
                },
                'statistics': {
                    'total_messages': message_stats.total_messages or 0,
                    'avg_message_length': round(message_stats.avg_message_length or 0, 1),
                    'duration_minutes': round(duration_minutes, 1),
                    'first_message': message_stats.first_message.isoformat() if message_stats.first_message else None,
                    'last_message': message_stats.last_message.isoformat() if message_stats.last_message else None
                },
                'agent_participation': [
                    {
                        'name': agent.name,
                        'provider': agent.provider,
                        'message_count': agent.message_count or 0,
                        'avg_message_length': round(agent.avg_length or 0, 1),
                        'participation_rate': round((agent.message_count or 0) / (message_stats.total_messages or 1) * 100, 1)
                    } for agent in agent_participation
                ],
                'timeline': [
                    {
                        'hour': timeline_item.hour,
                        'message_count': timeline_item.message_count or 0
                    } for timeline_item in timeline
                ]
            }
        })
        
    except Exception as e:
        raise DatabaseError(f"Failed to fetch conversation analytics: {str(e)}")

@analytics_bp.route('/api/analytics/agents/<int:agent_id>', methods=['GET'])
@handle_database_errors
def get_agent_analytics(agent_id):
    """Get detailed analytics for a specific agent"""
    try:
        agent = db.session.query(AIAgent).get(agent_id)
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Get date range (default to last 30 days)
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Message statistics
        message_stats = db.session.query(
            func.count(Message.id).label('total_messages'),
            func.avg(func.length(Message.content)).label('avg_message_length'),
            func.count(func.distinct(Message.conversation_id)).label('conversations_participated')
        ).filter(
            Message.agent_id == agent_id,
            Message.timestamp >= start_date
        ).first()
        
        # Daily activity
        daily_activity = db.session.query(
            func.date(Message.timestamp).label('date'),
            func.count(Message.id).label('message_count')
        ).filter(
            Message.agent_id == agent_id,
            Message.timestamp >= start_date
        ).group_by(func.date(Message.timestamp)).order_by('date').all()
        
        # Recent conversations
        recent_conversations = db.session.query(
            Conversation.id,
            Conversation.name,
            Conversation.status,
            func.count(Message.id).label('message_count'),
            func.max(Message.timestamp).label('last_activity')
        ).join(Message, Conversation.id == Message.conversation_id).filter(
            Message.agent_id == agent_id,
            Message.timestamp >= start_date
        ).group_by(Conversation.id).order_by(desc('last_activity')).limit(10).all()
        
        return jsonify({
            'success': True,
            'data': {
                'agent': {
                    'id': agent.id,
                    'name': agent.name,
                    'provider': agent.provider,
                    'model': agent.model,
                    'status': agent.status,
                    'created_at': agent.created_at.isoformat() if agent.created_at else None
                },
                'statistics': {
                    'total_messages': message_stats.total_messages or 0,
                    'avg_message_length': round(message_stats.avg_message_length or 0, 1),
                    'conversations_participated': message_stats.conversations_participated or 0,
                    'messages_per_conversation': round(
                        (message_stats.total_messages or 0) / max(message_stats.conversations_participated or 1, 1), 1
                    )
                },
                'daily_activity': [
                    {
                        'date': activity.date.isoformat() if activity.date else None,
                        'message_count': activity.message_count or 0
                    } for activity in daily_activity
                ],
                'recent_conversations': [
                    {
                        'id': conv.id,
                        'name': conv.name,
                        'status': conv.status,
                        'message_count': conv.message_count or 0,
                        'last_activity': conv.last_activity.isoformat() if conv.last_activity else None
                    } for conv in recent_conversations
                ],
                'period': {
                    'days': days,
                    'start_date': start_date.isoformat(),
                    'end_date': datetime.utcnow().isoformat()
                }
            }
        })
        
    except Exception as e:
        raise DatabaseError(f"Failed to fetch agent analytics: {str(e)}")

@analytics_bp.route('/api/analytics/export', methods=['GET'])
@handle_database_errors
def export_analytics():
    """Export analytics data in various formats"""
    try:
        format_type = request.args.get('format', 'json').lower()
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Gather comprehensive data
        agents = db.session.query(AIAgent).all()
        conversations = db.session.query(Conversation).filter(
            Conversation.created_at >= start_date
        ).all()
        
        export_data = {
            'export_info': {
                'generated_at': datetime.utcnow().isoformat(),
                'period_days': days,
                'start_date': start_date.isoformat(),
                'end_date': datetime.utcnow().isoformat()
            },
            'agents': [
                {
                    'id': agent.id,
                    'name': agent.name,
                    'provider': agent.provider,
                    'model': agent.model,
                    'status': agent.status,
                    'created_at': agent.created_at.isoformat() if agent.created_at else None
                } for agent in agents
            ],
            'conversations': [
                {
                    'id': conv.id,
                    'name': conv.name,
                    'status': conv.status,
                    'created_at': conv.created_at.isoformat() if conv.created_at else None,
                    'agent_count': len(conv.name.split(',')) if conv.name else 0  # Simple approximation
                } for conv in conversations
            ]
        }
        
        if format_type == 'csv':
            # For CSV, we'd need to implement CSV conversion
            # For now, return JSON with CSV headers
            response = jsonify(export_data)
            response.headers['Content-Type'] = 'application/json'
            response.headers['Content-Disposition'] = f'attachment; filename=agentmix_analytics_{datetime.utcnow().strftime("%Y%m%d")}.json'
            return response
        else:
            return jsonify({
                'success': True,
                'data': export_data
            })
            
    except Exception as e:
        raise DatabaseError(f"Failed to export analytics: {str(e)}")

# Dashboard Data Endpoints
@analytics_bp.route('/api/dashboard/stats', methods=['GET'])
@handle_database_errors
def get_dashboard_stats():
    """Get enhanced dashboard statistics"""
    try:
        # Get comprehensive stats
        total_agents = db.session.query(AIAgent).count()
        active_agents = db.session.query(AIAgent).filter(AIAgent.status == 'active').count()
        processing_agents = db.session.query(AIAgent).filter(AIAgent.status == 'processing').count()
        
        total_conversations = db.session.query(Conversation).count()
        active_conversations = db.session.query(Conversation).filter(
            Conversation.status == 'active'
        ).count()
        
        total_messages = db.session.query(Message).count()
        recent_messages = db.session.query(Message).filter(
            Message.timestamp >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        # Tool execution stats (mock for now)
        tool_executions = 156
        canvas_projects = 8
        
        return jsonify({
            'success': True,
            'stats': {
                'total_agents': total_agents,
                'active_agents': active_agents,
                'processing_agents': processing_agents,
                'total_conversations': total_conversations,
                'active_conversations': active_conversations,
                'total_messages': total_messages,
                'recent_messages': recent_messages,
                'tool_executions': tool_executions,
                'canvas_projects': canvas_projects
            }
        })
    except Exception as e:
        raise DatabaseError(f"Failed to get dashboard stats: {str(e)}")

@analytics_bp.route('/api/dashboard/activity', methods=['GET'])
@handle_database_errors
def get_dashboard_activity():
    """Get recent activity with more context"""
    try:
        # Get recent conversations
        recent_conversations = db.session.query(Conversation).order_by(
            Conversation.created_at.desc()
        ).limit(10).all()
        
        # Get recent messages with agent info
        recent_messages = db.session.query(Message).options(
            db.joinedload(Message.agent)
        ).order_by(Message.timestamp.desc()).limit(20).all()
        
        # Format activity data
        activity = []
        
        for conv in recent_conversations:
            activity.append({
                'id': f'conv_{conv.id}',
                'type': 'conversation_created',
                'title': f'New conversation: {conv.name or "Untitled"}',
                'description': f'Started with {len(conv.participants or [])} agents',
                'timestamp': conv.created_at.isoformat(),
                'metadata': {
                    'conversation_id': conv.id,
                    'agent_count': len(conv.participants or [])
                }
            })
        
        for msg in recent_messages:
            activity.append({
                'id': f'msg_{msg.id}',
                'type': 'message_sent',
                'title': f'Message from {msg.agent.name if msg.agent else "Unknown Agent"}',
                'description': msg.content[:100] + '...' if len(msg.content) > 100 else msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'metadata': {
                    'message_id': msg.id,
                    'agent_id': msg.agent_id,
                    'conversation_id': msg.conversation_id
                }
            })
        
        # Sort by timestamp and limit
        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        activity = activity[:30]  # Return top 30 items
        
        return jsonify({
            'success': True,
            'activity': activity
        })
    except Exception as e:
        raise DatabaseError(f"Failed to get dashboard activity: {str(e)}")

@analytics_bp.route('/api/dashboard/quick-actions', methods=['GET'])
@handle_database_errors
def get_dashboard_quick_actions():
    """Get context-aware quick actions"""
    try:
        # Get context from query params or determine automatically
        context = request.args.get('context', 'default')
        
        quick_actions = []
        
        if context == 'default':
            quick_actions = [
                {
                    'id': 'create_agent',
                    'title': 'Create New Agent',
                    'description': 'Set up a new AI agent with custom capabilities',
                    'icon': 'Bot',
                    'color': 'brand-purple',
                    'action': {'type': 'navigate', 'target': 'agents'},
                    'priority': 'high'
                },
                {
                    'id': 'start_conversation',
                    'title': 'Start Conversation',
                    'description': 'Begin a new AI-to-AI collaboration session',
                    'icon': 'MessageSquare',
                    'color': 'brand-teal',
                    'action': {'type': 'navigate', 'target': 'conversations'},
                    'priority': 'high'
                },
                {
                    'id': 'open_canvas',
                    'title': 'Open Canvas',
                    'description': 'Launch the visual collaboration workspace',
                    'icon': 'Palette',
                    'color': 'brand-pink',
                    'action': {'type': 'navigate', 'target': 'canvas'},
                    'priority': 'medium'
                },
                {
                    'id': 'view_analytics',
                    'title': 'View Analytics',
                    'description': 'Check detailed platform performance metrics',
                    'icon': 'BarChart3',
                    'color': 'brand-orange',
                    'action': {'type': 'navigate', 'target': 'analytics'},
                    'priority': 'low'
                }
            ]
        
        # Add context-specific actions based on recent activity
        active_conversations = db.session.query(Conversation).filter(
            Conversation.status == 'active'
        ).count()
        
        if active_conversations > 0:
            quick_actions.insert(0, {
                'id': 'resume_conversation',
                'title': 'Resume Active Conversation',
                'description': f'Continue with {active_conversations} active conversation(s)',
                'icon': 'Play',
                'color': 'green',
                'action': {'type': 'navigate', 'target': 'conversations'},
                'priority': 'urgent'
            })
        
        return jsonify({
            'success': True,
            'quick_actions': quick_actions,
            'context': context
        })
    except Exception as e:
        raise DatabaseError(f"Failed to get dashboard quick actions: {str(e)}")
