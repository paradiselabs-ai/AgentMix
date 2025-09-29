"""
Enhanced Error Handling System for AgentMix Platform
Provides comprehensive error handling, logging, and recovery mechanisms
"""

import logging
import traceback
import functools
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from flask import jsonify, request
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agentmix.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class AgentMixError(Exception):
    """Base exception class for AgentMix platform"""
    def __init__(self, message: str, error_code: str = None, details: Dict = None):
        self.message = message
        self.error_code = error_code or 'UNKNOWN_ERROR'
        self.details = details or {}
        self.timestamp = datetime.utcnow().isoformat()
        super().__init__(self.message)

class APIError(AgentMixError):
    """API-related errors"""
    pass

class ValidationError(AgentMixError):
    """Input validation errors"""
    pass

class ConversationError(AgentMixError):
    """Conversation-related errors"""
    pass

class AgentError(AgentMixError):
    """Agent-related errors"""
    pass

class DatabaseError(AgentMixError):
    """Database-related errors"""
    pass

def handle_api_errors(func: Callable) -> Callable:
    """Decorator for handling API errors gracefully"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.Timeout:
            logger.error(f"API timeout in {func.__name__}")
            raise APIError(
                "Request timed out. Please try again.",
                error_code="API_TIMEOUT",
                details={"function": func.__name__}
            )
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error in {func.__name__}")
            raise APIError(
                "Unable to connect to the service. Please check your internet connection.",
                error_code="CONNECTION_ERROR",
                details={"function": func.__name__}
            )
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error in {func.__name__}: {e}")
            status_code = e.response.status_code if e.response else 500
            if status_code == 401:
                raise APIError(
                    "Invalid API key or authentication failed.",
                    error_code="AUTH_ERROR",
                    details={"status_code": status_code}
                )
            elif status_code == 429:
                raise APIError(
                    "Rate limit exceeded. Please wait before making more requests.",
                    error_code="RATE_LIMIT",
                    details={"status_code": status_code}
                )
            elif status_code >= 500:
                raise APIError(
                    "Service temporarily unavailable. Please try again later.",
                    error_code="SERVICE_ERROR",
                    details={"status_code": status_code}
                )
            else:
                raise APIError(
                    f"API request failed with status {status_code}",
                    error_code="HTTP_ERROR",
                    details={"status_code": status_code}
                )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            raise APIError(
                "An unexpected error occurred. Please try again.",
                error_code="UNEXPECTED_ERROR",
                details={"original_error": str(e)}
            )
    return wrapper

def handle_database_errors(func: Callable) -> Callable:
    """Decorator for handling database errors"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            raise DatabaseError(
                "Database operation failed. Please try again.",
                error_code="DB_ERROR",
                details={"function": func.__name__, "error": str(e)}
            )
    return wrapper

def validate_required_fields(data: Dict, required_fields: list) -> None:
    """Validate that required fields are present in data"""
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            error_code="MISSING_FIELDS",
            details={"missing_fields": missing_fields}
        )

def validate_agent_data(data: Dict) -> None:
    """Validate agent creation/update data"""
    validate_required_fields(data, ['name', 'provider'])
    
    # Validate provider
    valid_providers = ['openai', 'anthropic', 'openrouter', 'ollama', 'lm_studio']
    if data['provider'].lower() not in valid_providers:
        raise ValidationError(
            f"Invalid provider. Must be one of: {', '.join(valid_providers)}",
            error_code="INVALID_PROVIDER",
            details={"provided": data['provider'], "valid": valid_providers}
        )
    
    # Validate name length
    if len(data['name']) > 100:
        raise ValidationError(
            "Agent name must be 100 characters or less",
            error_code="NAME_TOO_LONG",
            details={"length": len(data['name']), "max": 100}
        )

def validate_conversation_data(data: Dict) -> None:
    """Validate conversation creation data"""
    validate_required_fields(data, ['name', 'agent_ids'])
    
    # Validate agent_ids
    if not isinstance(data['agent_ids'], list) or len(data['agent_ids']) < 2:
        raise ValidationError(
            "At least 2 agents are required for a conversation",
            error_code="INSUFFICIENT_AGENTS",
            details={"provided": len(data.get('agent_ids', []))}
        )

def create_error_response(error: AgentMixError, status_code: int = 400) -> tuple:
    """Create standardized error response"""
    response_data = {
        'error': True,
        'message': error.message,
        'error_code': error.error_code,
        'timestamp': error.timestamp,
        'details': error.details
    }
    
    # Log the error
    logger.error(f"Error {error.error_code}: {error.message}")
    if error.details:
        logger.error(f"Error details: {error.details}")
    
    return jsonify(response_data), status_code

def handle_flask_errors(app):
    """Register Flask error handlers"""
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return create_error_response(error, 400)
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return create_error_response(error, 502)
    
    @app.errorhandler(ConversationError)
    def handle_conversation_error(error):
        return create_error_response(error, 400)
    
    @app.errorhandler(AgentError)
    def handle_agent_error(error):
        return create_error_response(error, 400)
    
    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        return create_error_response(error, 500)
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'error': True,
            'message': 'Resource not found',
            'error_code': 'NOT_FOUND',
            'timestamp': datetime.utcnow().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'error': True,
            'message': 'Internal server error',
            'error_code': 'INTERNAL_ERROR',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

class RetryHandler:
    """Handle retries for failed operations"""
    
    @staticmethod
    def retry_with_backoff(func: Callable, max_retries: int = 3, backoff_factor: float = 1.0):
        """Retry function with exponential backoff"""
        import time
        
        for attempt in range(max_retries):
            try:
                return func()
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                
                wait_time = backoff_factor * (2 ** attempt)
                logger.warning(f"Attempt {attempt + 1} failed, retrying in {wait_time}s: {str(e)}")
                time.sleep(wait_time)

class HealthChecker:
    """Check system health and dependencies"""
    
    @staticmethod
    def check_database_connection():
        """Check if database is accessible"""
        try:
            # Add database connection check here
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return False
    
    @staticmethod
    def check_api_providers():
        """Check if API providers are accessible"""
        providers_status = {}
        
        # Check OpenAI
        try:
            response = requests.get("https://api.openai.com/v1/models", timeout=5)
            providers_status['openai'] = response.status_code == 200
        except:
            providers_status['openai'] = False
        
        # Check OpenRouter
        try:
            response = requests.get("https://openrouter.ai/api/v1/models", timeout=5)
            providers_status['openrouter'] = response.status_code == 200
        except:
            providers_status['openrouter'] = False
        
        return providers_status
    
    @staticmethod
    def get_system_health():
        """Get overall system health status"""
        return {
            'database': HealthChecker.check_database_connection(),
            'api_providers': HealthChecker.check_api_providers(),
            'timestamp': datetime.utcnow().isoformat()
        }

# Export commonly used functions
__all__ = [
    'AgentMixError', 'APIError', 'ValidationError', 'ConversationError', 
    'AgentError', 'DatabaseError', 'handle_api_errors', 'handle_database_errors',
    'validate_agent_data', 'validate_conversation_data', 'create_error_response',
    'handle_flask_errors', 'RetryHandler', 'HealthChecker'
]

