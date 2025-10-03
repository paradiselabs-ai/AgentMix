import openai
import anthropic
import requests
from typing import Dict, Any, List
import json

class AIProviderService:
    """Service for interacting with different AI providers"""
    
    def __init__(self):
        self.providers = {
            'openai': self._call_openai,
            'anthropic': self._call_anthropic,
            'custom': self._call_custom_api
        }
    
    def call_ai(self, provider: str, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """
        Call an AI provider with the given parameters
        
        Args:
            provider: The AI provider name (openai, anthropic, custom)
            model: The model to use
            api_key: API key for authentication
            messages: List of messages in OpenAI format
            config: Additional configuration parameters
        
        Returns:
            Dict containing the response and metadata
        """
        if provider not in self.providers:
            raise ValueError(f"Unsupported provider: {provider}")
        
        config = config or {}
        
        try:
            return self.providers[provider](model, api_key, messages, config)
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': None
            }
    
    def _call_openai(self, model: str, api_key: str, messages: List[Dict], config: Dict) -> Dict[str, Any]:
        """Call OpenAI API"""
        client = openai.OpenAI(api_key=api_key)
        
        # Default config
        default_config = {
            'temperature': 0.7,
            'max_tokens': 1000,
            'top_p': 1.0,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        }
        default_config.update(config)
        
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                **default_config
            )
            
            return {
                'success': True,
                'response': {
                    'content': response.choices[0].message.content,
                    'role': response.choices[0].message.role,
                    'finish_reason': response.choices[0].finish_reason
                },
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                },
                'model': response.model
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': None
            }
    
    def _call_anthropic(self, model: str, api_key: str, messages: List[Dict], config: Dict) -> Dict[str, Any]:
        """Call Anthropic API"""
        client = anthropic.Anthropic(api_key=api_key)
        
        # Default config
        default_config = {
            'temperature': 0.7,
            'max_tokens': 1000
        }
        default_config.update(config)
        
        # Convert OpenAI format to Anthropic format
        system_message = ""
        anthropic_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                anthropic_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        try:
            response = client.messages.create(
                model=model,
                system=system_message,
                messages=anthropic_messages,
                **default_config
            )
            
            return {
                'success': True,
                'response': {
                    'content': response.content[0].text,
                    'role': 'assistant',
                    'finish_reason': response.stop_reason
                },
                'usage': {
                    'prompt_tokens': response.usage.input_tokens,
                    'completion_tokens': response.usage.output_tokens,
                    'total_tokens': response.usage.input_tokens + response.usage.output_tokens
                },
                'model': response.model
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': None
            }
    
    def _call_custom_api(self, model: str, api_key: str, messages: List[Dict], config: Dict) -> Dict[str, Any]:
        """Call custom API endpoint - extend this to support other providers"""
        api_url = config.get('api_url')
        if not api_url:
            return {
                'success': False,
                'error': 'api_url is required for custom provider',
                'response': None
            }
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': model,
            'messages': messages,
            **{k: v for k, v in config.items() if k != 'api_url'}
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'success': True,
                'response': data.get('response', data),
                'usage': data.get('usage', {}),
                'model': model
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': None
            }

# Global instance
ai_provider_service = AIProviderService()

