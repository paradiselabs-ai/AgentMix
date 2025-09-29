import json
import requests
import subprocess
import math
from datetime import datetime
from typing import Dict, Any, List, Optional
from src.models.tool import Tool, AgentTool, ToolExecution
from src.models.user import db

class ToolRegistry:
    """Registry for managing AI tools and their execution"""
    
    def __init__(self):
        self.builtin_tools = {}
        self._register_builtin_tools()
    
    def _register_builtin_tools(self):
        """Register built-in tools"""
        
        # Calculator tool
        self.builtin_tools['calculator'] = {
            'name': 'calculator',
            'display_name': 'Calculator',
            'description': 'Perform mathematical calculations and computations',
            'category': 'computation',
            'function_definition': {
                'name': 'calculator',
                'description': 'Evaluate mathematical expressions',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'expression': {
                            'type': 'string',
                            'description': 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(pi/2)")'
                        }
                    },
                    'required': ['expression']
                }
            },
            'implementation': self._execute_calculator
        }
        
        # Web search tool
        self.builtin_tools['web_search'] = {
            'name': 'web_search',
            'display_name': 'Web Search',
            'description': 'Search the web for information',
            'category': 'search',
            'function_definition': {
                'name': 'web_search',
                'description': 'Search the web for information on a given topic',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'query': {
                            'type': 'string',
                            'description': 'Search query'
                        },
                        'num_results': {
                            'type': 'integer',
                            'description': 'Number of results to return (default: 5)',
                            'default': 5
                        }
                    },
                    'required': ['query']
                }
            },
            'implementation': self._execute_web_search
        }
        
        # File operations tool
        self.builtin_tools['file_operations'] = {
            'name': 'file_operations',
            'display_name': 'File Operations',
            'description': 'Read, write, and manage files',
            'category': 'utility',
            'function_definition': {
                'name': 'file_operations',
                'description': 'Perform file operations like read, write, list',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'operation': {
                            'type': 'string',
                            'enum': ['read', 'write', 'list', 'exists'],
                            'description': 'File operation to perform'
                        },
                        'path': {
                            'type': 'string',
                            'description': 'File or directory path'
                        },
                        'content': {
                            'type': 'string',
                            'description': 'Content to write (for write operation)'
                        }
                    },
                    'required': ['operation', 'path']
                }
            },
            'implementation': self._execute_file_operations
        }
        
        # Code execution tool
        self.builtin_tools['code_executor'] = {
            'name': 'code_executor',
            'display_name': 'Code Executor',
            'description': 'Execute Python code safely',
            'category': 'computation',
            'function_definition': {
                'name': 'code_executor',
                'description': 'Execute Python code and return the result',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'code': {
                            'type': 'string',
                            'description': 'Python code to execute'
                        },
                        'timeout': {
                            'type': 'integer',
                            'description': 'Execution timeout in seconds (default: 10)',
                            'default': 10
                        }
                    },
                    'required': ['code']
                }
            },
            'implementation': self._execute_code
        }
    
    def initialize_database_tools(self):
        """Initialize built-in tools in the database"""
        for tool_name, tool_data in self.builtin_tools.items():
            existing_tool = Tool.query.filter_by(name=tool_name).first()
            
            if not existing_tool:
                tool = Tool(
                    name=tool_data['name'],
                    display_name=tool_data['display_name'],
                    description=tool_data['description'],
                    tool_type='builtin',
                    category=tool_data['category'],
                    function_definition=json.dumps(tool_data['function_definition']),
                    implementation='builtin',
                    is_active=True,
                    requires_auth=False
                )
                db.session.add(tool)
        
        db.session.commit()
    
    def execute_tool(self, tool_name: str, parameters: Dict[str, Any], agent_id: int, conversation_id: str = None) -> Dict[str, Any]:
        """Execute a tool with given parameters"""
        
        # Create execution record
        tool = Tool.query.filter_by(name=tool_name).first()
        if not tool:
            return {'success': False, 'error': f'Tool {tool_name} not found'}
        
        execution = ToolExecution(
            agent_id=agent_id,
            tool_id=tool.id,
            conversation_id=conversation_id,
            input_data=json.dumps(parameters),
            status='running'
        )
        db.session.add(execution)
        db.session.commit()
        
        try:
            start_time = datetime.utcnow()
            
            # Execute the tool
            if tool.tool_type == 'builtin' and tool_name in self.builtin_tools:
                result = self.builtin_tools[tool_name]['implementation'](parameters)
            else:
                result = {'success': False, 'error': f'Tool type {tool.tool_type} not supported yet'}
            
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()
            
            # Update execution record
            execution.output_data = json.dumps(result)
            execution.status = 'completed' if result.get('success') else 'failed'
            execution.completed_at = end_time
            execution.execution_time = execution_time
            
            if not result.get('success'):
                execution.error_message = result.get('error', 'Unknown error')
            
            db.session.commit()
            
            # Update usage count
            agent_tool = AgentTool.query.filter_by(agent_id=agent_id, tool_id=tool.id).first()
            if agent_tool:
                agent_tool.usage_count += 1
                agent_tool.last_used = datetime.utcnow()
                db.session.commit()
            
            return result
            
        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
            db.session.commit()
            
            return {'success': False, 'error': str(e)}
    
    def _execute_calculator(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute calculator tool"""
        try:
            expression = parameters.get('expression', '')
            
            # Safe evaluation using math functions
            allowed_names = {
                k: v for k, v in math.__dict__.items() if not k.startswith("__")
            }
            allowed_names.update({"abs": abs, "round": round, "min": min, "max": max})
            
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            
            return {
                'success': True,
                'result': result,
                'expression': expression,
                'formatted_result': f"{expression} = {result}"
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Calculation error: {str(e)}'}
    
    def _execute_web_search(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute web search tool (simulated for demo)"""
        query = parameters.get('query', '')
        num_results = parameters.get('num_results', 5)
        
        # Simulated search results for demo
        results = [
            {
                'title': f'Search result {i+1} for "{query}"',
                'url': f'https://example.com/result{i+1}',
                'snippet': f'This is a simulated search result snippet for query "{query}". Result number {i+1}.'
            }
            for i in range(min(num_results, 5))
        ]
        
        return {
            'success': True,
            'query': query,
            'results': results,
            'total_results': len(results)
        }
    
    def _execute_file_operations(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute file operations tool"""
        try:
            operation = parameters.get('operation')
            path = parameters.get('path', '')
            content = parameters.get('content', '')
            
            if operation == 'read':
                with open(path, 'r') as f:
                    file_content = f.read()
                return {'success': True, 'content': file_content, 'path': path}
            
            elif operation == 'write':
                with open(path, 'w') as f:
                    f.write(content)
                return {'success': True, 'message': f'File written to {path}', 'bytes_written': len(content)}
            
            elif operation == 'list':
                import os
                if os.path.isdir(path):
                    files = os.listdir(path)
                    return {'success': True, 'files': files, 'path': path}
                else:
                    return {'success': False, 'error': f'Path {path} is not a directory'}
            
            elif operation == 'exists':
                import os
                exists = os.path.exists(path)
                return {'success': True, 'exists': exists, 'path': path}
            
            else:
                return {'success': False, 'error': f'Unknown operation: {operation}'}
                
        except Exception as e:
            return {'success': False, 'error': f'File operation error: {str(e)}'}
    
    def _execute_code(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Python code safely"""
        try:
            code = parameters.get('code', '')
            timeout = parameters.get('timeout', 10)
            
            # For demo purposes, we'll simulate code execution
            # In production, this would use a proper sandboxed environment
            
            if 'print(' in code:
                # Simulate print output
                import re
                prints = re.findall(r'print\((.*?)\)', code)
                output = '\n'.join([f'Output: {p}' for p in prints])
            else:
                output = 'Code executed successfully (simulated)'
            
            return {
                'success': True,
                'code': code,
                'output': output,
                'execution_time': 0.1
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Code execution error: {str(e)}'}
    
    def get_available_tools(self, agent_id: int = None) -> List[Dict[str, Any]]:
        """Get list of available tools for an agent"""
        if agent_id:
            # Get tools specifically assigned to this agent
            agent_tools = AgentTool.query.filter_by(agent_id=agent_id, is_enabled=True).all()
            return [at.to_dict() for at in agent_tools]
        else:
            # Get all active tools
            tools = Tool.query.filter_by(is_active=True).all()
            return [tool.to_dict() for tool in tools]
    
    def assign_tool_to_agent(self, agent_id: int, tool_id: int, config: Dict[str, Any] = None) -> bool:
        """Assign a tool to an agent"""
        try:
            existing = AgentTool.query.filter_by(agent_id=agent_id, tool_id=tool_id).first()
            
            if existing:
                existing.is_enabled = True
                existing.tool_config = json.dumps(config) if config else None
            else:
                agent_tool = AgentTool(
                    agent_id=agent_id,
                    tool_id=tool_id,
                    tool_config=json.dumps(config) if config else None,
                    is_enabled=True
                )
                db.session.add(agent_tool)
            
            db.session.commit()
            return True
            
        except Exception as e:
            print(f"Error assigning tool to agent: {e}")
            return False

# Global tool registry instance
tool_registry = ToolRegistry()

