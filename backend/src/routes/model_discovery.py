from flask import Blueprint, request, jsonify
from ..services.ai_provider_enhanced import enhanced_ai_provider_service
import asyncio

model_discovery_bp = Blueprint('model_discovery', __name__)

@model_discovery_bp.route('/api/providers/<provider>/discover-models', methods=['POST'])
def discover_models(provider):
    """Discover available models for a provider using API key"""
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key is required'
            }), 400
        
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                enhanced_ai_provider_service.discover_models(provider, api_key)
            )
        finally:
            loop.close()
        
        if result['success']:
            return jsonify({
                'success': True,
                'models': result['models'],
                'free_models': result.get('free_models', []),
                'total_count': result.get('total_count', len(result['models'])),
                'provider': provider
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@model_discovery_bp.route('/api/providers/<provider>/validate-key', methods=['POST'])
def validate_api_key(provider):
    """Validate API key by discovering models first"""
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        discover = data.get('discover_models', True)
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key is required'
            }), 400
        
        # First discover models to validate the API key
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            discovery_result = loop.run_until_complete(
                enhanced_ai_provider_service.discover_models(provider, api_key)
            )
            
            if discovery_result['success'] and discovery_result.get('models'):
                # API key is valid if we can discover models
                response_data = {
                    'success': True,
                    'valid': True,
                    'provider': provider,
                    'models_discovered': True,
                    'models': discovery_result['models'],
                    'free_models': discovery_result.get('free_models', []),
                    'total_count': discovery_result.get('total_count', len(discovery_result['models']))
                }
                return jsonify(response_data)
            else:
                return jsonify({
                    'success': False,
                    'valid': False,
                    'error': discovery_result.get('error', 'Failed to discover models with provided API key')
                }), 400
                
        finally:
            loop.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@model_discovery_bp.route('/api/providers/local/check-status', methods=['GET'])
def check_local_providers():
    """Check status of local providers (Ollama, LM Studio)"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            ollama_result = loop.run_until_complete(
                enhanced_ai_provider_service._discover_ollama_models()
            )
            lmstudio_result = loop.run_until_complete(
                enhanced_ai_provider_service._discover_lmstudio_models()
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'providers': {
                'ollama': {
                    'available': ollama_result['success'],
                    'models': ollama_result.get('models', []) if ollama_result['success'] else [],
                    'error': ollama_result.get('error') if not ollama_result['success'] else None
                },
                'lmstudio': {
                    'available': lmstudio_result['success'],
                    'models': lmstudio_result.get('models', []) if lmstudio_result['success'] else [],
                    'error': lmstudio_result.get('error') if not lmstudio_result['success'] else None
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@model_discovery_bp.route('/api/providers/<provider>/models/refresh', methods=['POST'])
def refresh_models(provider):
    """Refresh model list for a provider"""
    try:
        data = request.get_json()
        api_key = data.get('api_key', '')
        
        # For local providers, no API key needed
        if provider in ['ollama', 'lmstudio']:
            api_key = ''
        elif not api_key:
            return jsonify({
                'success': False,
                'error': 'API key is required for this provider'
            }), 400
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                enhanced_ai_provider_service.discover_models(provider, api_key)
            )
        finally:
            loop.close()
        
        if result['success']:
            return jsonify({
                'success': True,
                'models': result['models'],
                'free_models': result.get('free_models', []),
                'total_count': result.get('total_count', len(result['models'])),
                'provider': provider,
                'refreshed_at': __import__('datetime').datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

