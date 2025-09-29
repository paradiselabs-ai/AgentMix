import openai
import requests
import json
from typing import Dict, Any, List

class EnhancedAIProviderService:
    """Enhanced service for managing multiple AI providers including free options"""
    
    def __init__(self):
        self.providers = {
            'openai': {
                'name': 'OpenAI',
                'models': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
                'base_url': 'https://api.openai.com/v1',
                'requires_key': True,
                'cost': 'paid'
            },
            'anthropic': {
                'name': 'Anthropic',
                'models': ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
                'base_url': 'https://api.anthropic.com/v1',
                'requires_key': True,
                'cost': 'paid'
            },
            'openrouter': {
                'name': 'OpenRouter',
                'models': [
                    'meta-llama/llama-3.1-8b-instruct:free',
                    'meta-llama/llama-3.1-70b-instruct:free',
                    'google/gemma-2-9b-it:free',
                    'mistralai/mistral-7b-instruct:free',
                    'huggingfaceh4/zephyr-7b-beta:free',
                    'openchat/openchat-7b:free',
                    'gryphe/mythomist-7b:free',
                    'undi95/toppy-m-7b:free',
                    'microsoft/wizardlm-2-8x22b',
                    'openai/gpt-3.5-turbo',
                    'anthropic/claude-3-haiku',
                    'google/gemini-pro'
                ],
                'base_url': 'https://openrouter.ai/api/v1',
                'requires_key': True,
                'cost': 'freemium',
                'free_models': [
                    'meta-llama/llama-3.1-8b-instruct:free',
                    'meta-llama/llama-3.1-70b-instruct:free',
                    'google/gemma-2-9b-it:free',
                    'mistralai/mistral-7b-instruct:free',
                    'huggingfaceh4/zephyr-7b-beta:free',
                    'openchat/openchat-7b:free',
                    'gryphe/mythomist-7b:free',
                    'undi95/toppy-m-7b:free'
                ]
            },
            'together': {
                'name': 'Together AI',
                'models': [
                    'meta-llama/Llama-3-8b-chat-hf',
                    'meta-llama/Llama-3-70b-chat-hf',
                    'mistralai/Mistral-7B-Instruct-v0.1',
                    'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
                    'teknium/OpenHermes-2.5-Mistral-7B',
                    'togethercomputer/RedPajama-INCITE-Chat-3B-v1'
                ],
                'base_url': 'https://api.together.xyz/v1',
                'requires_key': True,
                'cost': 'affordable'
            },
            'groq': {
                'name': 'Groq',
                'models': [
                    'llama-3.1-70b-versatile',
                    'llama-3.1-8b-instant',
                    'mixtral-8x7b-32768',
                    'gemma-7b-it',
                    'gemma2-9b-it'
                ],
                'base_url': 'https://api.groq.com/openai/v1',
                'requires_key': True,
                'cost': 'affordable'
            },
            'huggingface': {
                'name': 'Hugging Face',
                'models': [
                    'microsoft/DialoGPT-medium',
                    'facebook/blenderbot-400M-distill',
                    'microsoft/DialoGPT-large',
                    'facebook/blenderbot-1B-distill'
                ],
                'base_url': 'https://api-inference.huggingface.co/models',
                'requires_key': True,
                'cost': 'free'
            },
            'ollama': {
                'name': 'Ollama (Local)',
                'models': [
                    'llama3.1:8b',
                    'llama3.1:70b',
                    'llama3.2:3b',
                    'llama3.2:1b',
                    'mistral:7b',
                    'mixtral:8x7b',
                    'codellama:7b',
                    'codellama:13b',
                    'phi3:mini',
                    'phi3:medium',
                    'gemma2:9b',
                    'gemma2:27b',
                    'qwen2:7b',
                    'deepseek-coder:6.7b',
                    'nomic-embed-text',
                    'all-minilm'
                ],
                'base_url': 'http://localhost:11434/api',
                'requires_key': False,
                'cost': 'free',
                'local': True,
                'description': 'Run large language models locally with Ollama'
            },
            'lmstudio': {
                'name': 'LM Studio (Local)',
                'models': [
                    'local-model',
                    'llama-3.1-8b-instruct',
                    'llama-3.1-70b-instruct',
                    'mistral-7b-instruct',
                    'mixtral-8x7b-instruct',
                    'codellama-7b-instruct',
                    'phi-3-mini-instruct',
                    'gemma-2-9b-instruct',
                    'qwen2-7b-instruct'
                ],
                'base_url': 'http://localhost:1234/v1',
                'requires_key': False,
                'cost': 'free',
                'local': True,
                'description': 'Run models locally with LM Studio'
            },
            'custom': {
                'name': 'Custom API',
                'models': ['custom-model'],
                'base_url': 'https://api.example.com/v1',
                'requires_key': True,
                'cost': 'variable'
            }
        }
    
    def get_providers(self) -> Dict[str, Any]:
        """Get all available providers"""
        return self.providers
    
    def get_provider_models(self, provider: str) -> List[str]:
        """Get models for a specific provider"""
        if provider in self.providers:
            return self.providers[provider]['models']
        return []
    
    def get_free_models(self, provider: str) -> List[str]:
        """Get free models for a provider"""
        if provider in self.providers and 'free_models' in self.providers[provider]:
            return self.providers[provider]['free_models']
        return []
    
    def get_providers_by_cost(self, cost_type: str) -> List[str]:
        """Get providers by cost type (free, affordable, paid, freemium)"""
        return [
            provider for provider, info in self.providers.items()
            if info.get('cost') == cost_type
        ]
    
    async def discover_models(self, provider: str, api_key: str) -> Dict[str, Any]:
        """Dynamically discover available models from provider API"""
        try:
            if provider == 'openrouter':
                return await self._discover_openrouter_models(api_key)
            elif provider == 'openai':
                return await self._discover_openai_models(api_key)
            elif provider == 'together':
                return await self._discover_together_models(api_key)
            elif provider == 'groq':
                return await self._discover_groq_models(api_key)
            elif provider == 'ollama':
                return await self._discover_ollama_models()
            elif provider == 'lmstudio':
                return await self._discover_lmstudio_models()
            else:
                # Return default models for providers without discovery API
                return {
                    'success': True,
                    'models': self.providers.get(provider, {}).get('models', [])
                }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_openrouter_models(self, api_key: str) -> Dict[str, Any]:
        """Discover OpenRouter models"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                'https://openrouter.ai/api/v1/models',
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                models = []
                free_models = []
                
                for model in data.get('data', []):
                    model_id = model.get('id', '')
                    pricing = model.get('pricing', {})
                    
                    models.append(model_id)
                    
                    # Check if model is free
                    prompt_cost = float(pricing.get('prompt', '0'))
                    completion_cost = float(pricing.get('completion', '0'))
                    
                    if prompt_cost == 0 and completion_cost == 0:
                        free_models.append(model_id)
                
                # Update provider info with discovered models
                self.providers['openrouter']['models'] = models
                self.providers['openrouter']['free_models'] = free_models
                
                return {
                    'success': True,
                    'models': models,
                    'free_models': free_models,
                    'total_count': len(models)
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_openai_models(self, api_key: str) -> Dict[str, Any]:
        """Discover OpenAI models"""
        try:
            client = openai.OpenAI(api_key=api_key)
            models_response = client.models.list()
            
            # Filter for chat models
            chat_models = [
                model.id for model in models_response.data
                if 'gpt' in model.id.lower() and 'instruct' not in model.id.lower()
            ]
            
            # Update provider info
            self.providers['openai']['models'] = sorted(chat_models)
            
            return {
                'success': True,
                'models': sorted(chat_models),
                'total_count': len(chat_models)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_together_models(self, api_key: str) -> Dict[str, Any]:
        """Discover Together AI models"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                'https://api.together.xyz/v1/models',
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [model.get('id', '') for model in data if model.get('type') == 'chat']
                
                # Update provider info
                self.providers['together']['models'] = models
                
                return {
                    'success': True,
                    'models': models,
                    'total_count': len(models)
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_groq_models(self, api_key: str) -> Dict[str, Any]:
        """Discover Groq models"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                'https://api.groq.com/openai/v1/models',
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [model.get('id', '') for model in data.get('data', [])]
                
                # Update provider info
                self.providers['groq']['models'] = models
                
                return {
                    'success': True,
                    'models': models,
                    'total_count': len(models)
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_ollama_models(self) -> Dict[str, Any]:
        """Discover locally available Ollama models"""
        try:
            response = requests.get(
                'http://localhost:11434/api/tags',
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [model.get('name', '') for model in data.get('models', [])]
                
                # Update provider info
                self.providers['ollama']['models'] = models
                
                return {
                    'success': True,
                    'models': models,
                    'total_count': len(models)
                }
            else:
                return {'success': False, 'error': f'Ollama API Error: {response.status_code}'}
                
        except requests.exceptions.ConnectionError:
            return {'success': False, 'error': 'Cannot connect to Ollama. Please ensure Ollama is running.'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def _discover_lmstudio_models(self) -> Dict[str, Any]:
        """Discover locally available LM Studio models"""
        try:
            response = requests.get(
                'http://localhost:1234/v1/models',
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [model.get('id', '') for model in data.get('data', [])]
                
                # Update provider info
                self.providers['lmstudio']['models'] = models
                
                return {
                    'success': True,
                    'models': models,
                    'total_count': len(models)
                }
            else:
                return {'success': False, 'error': f'LM Studio API Error: {response.status_code}'}
                
        except requests.exceptions.ConnectionError:
            return {'success': False, 'error': 'Cannot connect to LM Studio. Please ensure LM Studio is running.'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def call_ai(self, provider: str, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call AI provider with unified interface"""
        try:
            if provider == 'openai':
                return self._call_openai(model, api_key, messages, config)
            elif provider == 'anthropic':
                return self._call_anthropic(model, api_key, messages, config)
            elif provider == 'openrouter':
                return self._call_openrouter(model, api_key, messages, config)
            elif provider == 'together':
                return self._call_together(model, api_key, messages, config)
            elif provider == 'groq':
                return self._call_groq(model, api_key, messages, config)
            elif provider == 'huggingface':
                return self._call_huggingface(model, api_key, messages, config)
            elif provider == 'ollama':
                return self._call_ollama(model, api_key, messages, config)
            elif provider == 'lmstudio':
                return self._call_lmstudio(model, api_key, messages, config)
            elif provider == 'custom':
                return self._call_custom(model, api_key, messages, config)
            else:
                return {'success': False, 'error': f'Unknown provider: {provider}'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_openai(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call OpenAI API"""
        try:
            client = openai.OpenAI(api_key=api_key)
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=config.get('max_tokens', 150) if config else 150,
                temperature=config.get('temperature', 0.7) if config else 0.7
            )
            
            return {
                'success': True,
                'response': {
                    'content': response.choices[0].message.content,
                    'model': model,
                    'provider': 'openai'
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_anthropic(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call Anthropic API"""
        try:
            # Convert OpenAI format to Anthropic format
            system_message = ""
            user_messages = []
            
            for msg in messages:
                if msg['role'] == 'system':
                    system_message += msg['content'] + "\n"
                else:
                    user_messages.append(msg)
            
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': model,
                'max_tokens': config.get('max_tokens', 150) if config else 150,
                'messages': user_messages
            }
            
            if system_message:
                data['system'] = system_message.strip()
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result['content'][0]['text'],
                        'model': model,
                        'provider': 'anthropic'
                    }
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code} - {response.text}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_openrouter(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call OpenRouter API"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://agentmix.ai',
                'X-Title': 'AgentMix'
            }
            
            data = {
                'model': model,
                'messages': messages,
                'max_tokens': config.get('max_tokens', 150) if config else 150,
                'temperature': config.get('temperature', 0.7) if config else 0.7
            }
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result['choices'][0]['message']['content'],
                        'model': model,
                        'provider': 'openrouter'
                    }
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code} - {response.text}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_together(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call Together AI API"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': model,
                'messages': messages,
                'max_tokens': config.get('max_tokens', 150) if config else 150,
                'temperature': config.get('temperature', 0.7) if config else 0.7
            }
            
            response = requests.post(
                'https://api.together.xyz/v1/chat/completions',
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result['choices'][0]['message']['content'],
                        'model': model,
                        'provider': 'together'
                    }
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code} - {response.text}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_groq(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call Groq API"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': model,
                'messages': messages,
                'max_tokens': config.get('max_tokens', 150) if config else 150,
                'temperature': config.get('temperature', 0.7) if config else 0.7
            }
            
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result['choices'][0]['message']['content'],
                        'model': model,
                        'provider': 'groq'
                    }
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code} - {response.text}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_huggingface(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call Hugging Face Inference API"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            # Convert messages to text for Hugging Face models
            text_input = ""
            for msg in messages:
                if msg['role'] == 'user':
                    text_input += f"User: {msg['content']}\n"
                elif msg['role'] == 'assistant':
                    text_input += f"Assistant: {msg['content']}\n"
            
            data = {
                'inputs': text_input,
                'parameters': {
                    'max_length': config.get('max_tokens', 150) if config else 150,
                    'temperature': config.get('temperature', 0.7) if config else 0.7
                }
            }
            
            response = requests.post(
                f'https://api-inference.huggingface.co/models/{model}',
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    content = result[0].get('generated_text', '').replace(text_input, '').strip()
                else:
                    content = str(result)
                
                return {
                    'success': True,
                    'response': {
                        'content': content,
                        'model': model,
                        'provider': 'huggingface'
                    }
                }
            else:
                return {'success': False, 'error': f'API Error: {response.status_code} - {response.text}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_ollama(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call Ollama local API"""
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            # Convert messages to Ollama format
            prompt = ""
            for msg in messages:
                if msg['role'] == 'system':
                    prompt += f"System: {msg['content']}\n"
                elif msg['role'] == 'user':
                    prompt += f"User: {msg['content']}\n"
                elif msg['role'] == 'assistant':
                    prompt += f"Assistant: {msg['content']}\n"
            
            prompt += "Assistant: "
            
            data = {
                'model': model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': config.get('temperature', 0.7) if config else 0.7,
                    'num_predict': config.get('max_tokens', 150) if config else 150
                }
            }
            
            response = requests.post(
                'http://localhost:11434/api/generate',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result.get('response', '').strip(),
                        'model': model,
                        'provider': 'ollama'
                    }
                }
            else:
                return {'success': False, 'error': f'Ollama API Error: {response.status_code} - {response.text}'}
                
        except requests.exceptions.ConnectionError:
            return {'success': False, 'error': 'Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_lmstudio(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call LM Studio local API"""
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': model,
                'messages': messages,
                'max_tokens': config.get('max_tokens', 150) if config else 150,
                'temperature': config.get('temperature', 0.7) if config else 0.7,
                'stream': False
            }
            
            response = requests.post(
                'http://localhost:1234/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'response': {
                        'content': result['choices'][0]['message']['content'],
                        'model': model,
                        'provider': 'lmstudio'
                    }
                }
            else:
                return {'success': False, 'error': f'LM Studio API Error: {response.status_code} - {response.text}'}
                
        except requests.exceptions.ConnectionError:
            return {'success': False, 'error': 'Cannot connect to LM Studio. Please ensure LM Studio is running on localhost:1234'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _call_custom(self, model: str, api_key: str, messages: List[Dict], config: Dict = None) -> Dict[str, Any]:
        """Call custom API endpoint"""
        try:
            # This is a placeholder for custom API integration
            # Users can modify this method to integrate with their own APIs
            return {
                'success': True,
                'response': {
                    'content': 'This is a demo response from a custom API endpoint.',
                    'model': model,
                    'provider': 'custom'
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_all_providers(self):
        """Get all providers with their configuration for the frontend"""
        providers_list = []
        
        for provider_id, provider_info in self.providers.items():
            provider_data = {
                'id': provider_id,
                'name': provider_info['name'],
                'models': provider_info['models'],
                'requires_key': provider_info.get('requires_key', True),
                'cost': provider_info.get('cost', 'paid'),
                'config_fields': []
            }
            
            # Add free models if available
            if 'free_models' in provider_info:
                provider_data['free_models'] = provider_info['free_models']
            
            # Generate config fields based on provider
            if provider_id in ['openai', 'openrouter', 'together', 'groq']:
                provider_data['config_fields'] = [
                    {'name': 'temperature', 'type': 'float', 'default': 0.7, 'min': 0, 'max': 2},
                    {'name': 'max_tokens', 'type': 'int', 'default': 1000, 'min': 1, 'max': 4000},
                    {'name': 'top_p', 'type': 'float', 'default': 1.0, 'min': 0, 'max': 1},
                    {'name': 'system_message', 'type': 'text', 'default': ''}
                ]
            elif provider_id == 'anthropic':
                provider_data['config_fields'] = [
                    {'name': 'temperature', 'type': 'float', 'default': 0.7, 'min': 0, 'max': 1},
                    {'name': 'max_tokens', 'type': 'int', 'default': 1000, 'min': 1, 'max': 4000},
                    {'name': 'system_message', 'type': 'text', 'default': ''}
                ]
            elif provider_id in ['ollama', 'lmstudio']:
                provider_data['config_fields'] = [
                    {'name': 'temperature', 'type': 'float', 'default': 0.7, 'min': 0, 'max': 2},
                    {'name': 'max_tokens', 'type': 'int', 'default': 1000, 'min': 1, 'max': 4000},
                    {'name': 'system_message', 'type': 'text', 'default': ''}
                ]
            elif provider_id == 'huggingface':
                provider_data['config_fields'] = [
                    {'name': 'temperature', 'type': 'float', 'default': 0.7, 'min': 0, 'max': 1},
                    {'name': 'max_tokens', 'type': 'int', 'default': 100, 'min': 1, 'max': 1000},
                    {'name': 'system_message', 'type': 'text', 'default': ''}
                ]
            else:
                # Default config for other providers
                provider_data['config_fields'] = [
                    {'name': 'temperature', 'type': 'float', 'default': 0.7, 'min': 0, 'max': 2},
                    {'name': 'max_tokens', 'type': 'int', 'default': 1000, 'min': 1, 'max': 4000},
                    {'name': 'system_message', 'type': 'text', 'default': ''}
                ]
            
            providers_list.append(provider_data)
        
        return providers_list

    def generate_response(self, provider: str, model: str, api_key: str, prompt: str, max_tokens: int = 150) -> str:
        """Generate AI response using the specified provider and model"""
        try:
            if provider == 'openrouter':
                return self._generate_openrouter_response(model, api_key, prompt, max_tokens)
            elif provider == 'openai':
                return self._generate_openai_response(model, api_key, prompt, max_tokens)
            elif provider == 'anthropic':
                return self._generate_anthropic_response(model, api_key, prompt, max_tokens)
            else:
                return f"Provider {provider} not supported"
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Error: {str(e)}"
    
    def _generate_openrouter_response(self, model: str, api_key: str, prompt: str, max_tokens: int) -> str:
        """Generate response using OpenRouter API"""
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'AgentMix'
            }
            
            data = {
                'model': model,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': max_tokens,
                'temperature': 0.7
            }
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content'].strip()
                else:
                    return "No response generated"
            else:
                return f"API Error: {response.status_code} - {response.text}"
                
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _generate_openai_response(self, model: str, api_key: str, prompt: str, max_tokens: int) -> str:
        """Generate response using OpenAI API"""
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'user', 'content': prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _generate_anthropic_response(self, model: str, api_key: str, prompt: str, max_tokens: int) -> str:
        """Generate response using Anthropic API"""
        try:
            headers = {
                'x-api-key': api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': model,
                'max_tokens': max_tokens,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'content' in result and len(result['content']) > 0:
                    return result['content'][0]['text'].strip()
                else:
                    return "No response generated"
            else:
                return f"API Error: {response.status_code} - {response.text}"
                
        except Exception as e:
            return f"Error: {str(e)}"



# Global instance
enhanced_ai_provider_service = EnhancedAIProviderService()

