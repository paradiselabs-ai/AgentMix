import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Loader2, Save, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

const AgentForm = ({ onSuccess, onCancel, agent = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    model: '',
    api_key: '',
    config: {}
  })
  const [providers, setProviders] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [discoveringModels, setDiscoveringModels] = useState(false)
  const [keyValidation, setKeyValidation] = useState({ status: null, message: '' })

  useEffect(() => {
    fetchProviders()
    if (agent) {
      setFormData({
        name: agent.name || '',
        provider: agent.provider || '',
        model: agent.model || '',
        api_key: agent.api_key || '',
        config: agent.config || {}
      })
    }
  }, [agent])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/providers')
      const data = await response.json()
      console.log('Providers response:', data) // Debug log
      if (data.success) {
        setProviders(data.providers)
      } else {
        console.error('Failed to fetch providers:', data)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const discoverModels = async (provider, apiKey) => {
    if (!provider || (!apiKey && !['ollama', 'lmstudio'].includes(provider))) {
      return
    }

    try {
      setDiscoveringModels(true)
      setKeyValidation({ status: 'validating', message: 'Validating API key and discovering models...' })
      
      const response = await fetch(`/api/providers/${provider}/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          discover_models: true
        }),
      })

      const data = await response.json()
      
      if (data.success && data.valid) {
        if (data.models_discovered) {
          setAvailableModels(data.models)
          setKeyValidation({ 
            status: 'success', 
            message: `✓ API key valid. Discovered ${data.total_count} models.` 
          })
        } else {
          // Fallback to static models if discovery fails
          const selectedProvider = providers.find(p => p.id === provider)
          setAvailableModels(selectedProvider?.models || [])
          setKeyValidation({ 
            status: 'warning', 
            message: '✓ API key valid. Using default models (discovery failed).' 
          })
        }
      } else {
        setKeyValidation({ 
          status: 'error', 
          message: `✗ ${data.error || 'Invalid API key'}` 
        })
        const selectedProvider = providers.find(p => p.id === provider)
        setAvailableModels(selectedProvider?.models || [])
      }
    } catch (error) {
      console.error('Error discovering models:', error)
      setKeyValidation({ 
        status: 'error', 
        message: '✗ Error validating API key' 
      })
      const selectedProvider = providers.find(p => p.id === provider)
      setAvailableModels(selectedProvider?.models || [])
    } finally {
      setDiscoveringModels(false)
    }
  }

  const handleProviderChange = (provider) => {
    setFormData(prev => ({ ...prev, provider, model: '', api_key: '' }))
    setAvailableModels([])
    setKeyValidation({ status: null, message: '' })
    
    // For local providers, immediately discover models
    if (['ollama', 'lmstudio'].includes(provider)) {
      discoverModels(provider, '')
    } else {
      // Set default models for other providers
      const selectedProvider = providers.find(p => p.id === provider)
      setAvailableModels(selectedProvider?.models || [])
    }
  }

  const handleApiKeyChange = (apiKey) => {
    setFormData(prev => ({ ...prev, api_key: apiKey }))
    setKeyValidation({ status: null, message: '' })
  }

  const handleApiKeyBlur = () => {
    if (formData.provider && formData.api_key && !['ollama', 'lmstudio'].includes(formData.provider)) {
      discoverModels(formData.provider, formData.api_key)
    }
  }

  const handleRefreshModels = () => {
    if (formData.provider) {
      discoverModels(formData.provider, formData.api_key)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = agent 
        ? `/api/agents/${agent.id}`
        : '/api/agents'
      
      const method = agent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        onSuccess()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving agent:', error)
      alert('Error saving agent')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }))
  }

  const selectedProvider = providers.find(p => p.id === formData.provider)
  const modelsToShow = availableModels.length > 0 ? availableModels : (selectedProvider?.models || [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter agent name"
              required
            />
          </div>

          <div>
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={handleProviderChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                    {provider.cost === 'free' && <span className="ml-2 text-green-600">(Free)</span>}
                    {provider.cost === 'freemium' && <span className="ml-2 text-blue-600">(Free + Paid)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && selectedProvider.requires_key && (
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <div className="space-y-2">
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  onBlur={handleApiKeyBlur}
                  placeholder="Enter API key"
                  required
                />
                {keyValidation.status && (
                  <div className={`flex items-center gap-2 text-sm ${
                    keyValidation.status === 'success' ? 'text-green-600' :
                    keyValidation.status === 'warning' ? 'text-yellow-600' :
                    keyValidation.status === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {keyValidation.status === 'validating' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {keyValidation.status === 'success' && <CheckCircle className="h-4 w-4" />}
                    {keyValidation.status === 'warning' && <AlertCircle className="h-4 w-4" />}
                    {keyValidation.status === 'error' && <AlertCircle className="h-4 w-4" />}
                    <span>{keyValidation.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="model">Model</Label>
              {formData.provider && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshModels}
                  disabled={discoveringModels}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${discoveringModels ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <Select
              value={formData.model}
              onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              required
              disabled={!selectedProvider || discoveringModels}
            >
              <SelectTrigger>
                <SelectValue placeholder={discoveringModels ? "Discovering models..." : "Select model"} />
              </SelectTrigger>
              <SelectContent>
                {modelsToShow.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                    {selectedProvider?.free_models?.includes(model) && (
                      <span className="ml-2 text-green-600 text-xs">(Free)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableModels.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {availableModels.length} models discovered
              </p>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuration</h3>
          {selectedProvider?.config_fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>
                {field.name.charAt(0).toUpperCase() + field.name.slice(1).replace('_', ' ')}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'text' && field.name !== 'system_message' && (
                <Input
                  id={field.name}
                  value={formData.config[field.name] || field.default || ''}
                  onChange={(e) => handleConfigChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.name}`}
                  required={field.required}
                />
              )}
              {field.type === 'text' && field.name === 'system_message' && (
                <Textarea
                  id={field.name}
                  value={formData.config[field.name] || field.default || ''}
                  onChange={(e) => handleConfigChange(field.name, e.target.value)}
                  placeholder="Enter system message"
                  rows={3}
                />
              )}
              {(field.type === 'float' || field.type === 'int') && (
                <Input
                  id={field.name}
                  type="number"
                  step={field.type === 'float' ? '0.1' : '1'}
                  min={field.min}
                  max={field.max}
                  value={formData.config[field.name] || field.default || ''}
                  onChange={(e) => handleConfigChange(field.name, parseFloat(e.target.value))}
                  placeholder={`Enter ${field.name}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {agent ? 'Update' : 'Create'} Agent
        </Button>
      </div>
    </form>
  )
}

export default AgentForm

