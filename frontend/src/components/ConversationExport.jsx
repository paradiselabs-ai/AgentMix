import React, { useState } from 'react'
import { Download, FileText, Code, Share2, Copy, Check } from 'lucide-react'

const ConversationExport = ({ conversation, messages, onClose }) => {
  const [exportFormat, setExportFormat] = useState('markdown')
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const generateMarkdown = () => {
    let markdown = `# ${conversation.name}\n\n`
    markdown += `**Conversation ID:** ${conversation.id}\n`
    markdown += `**Status:** ${conversation.status}\n`
    markdown += `**Created:** ${formatDate(conversation.created_at)}\n`
    markdown += `**Total Messages:** ${messages.length}\n\n`
    markdown += `---\n\n`

    messages.forEach((message, index) => {
      markdown += `## Message ${index + 1}\n\n`
      markdown += `**Agent:** ${message.agent_name || 'Unknown'}\n`
      markdown += `**Time:** ${formatDate(message.timestamp)}\n\n`
      markdown += `${message.content}\n\n`
      markdown += `---\n\n`
    })

    return markdown
  }

  const generateJSON = () => {
    return JSON.stringify({
      conversation: {
        id: conversation.id,
        name: conversation.name,
        status: conversation.status,
        created_at: conversation.created_at,
        exported_at: new Date().toISOString()
      },
      messages: messages.map((message, index) => ({
        index: index + 1,
        agent_name: message.agent_name || 'Unknown',
        timestamp: message.timestamp,
        content: message.content
      }))
    }, null, 2)
  }

  const generatePlainText = () => {
    let text = `${conversation.name}\n`
    text += `${'='.repeat(conversation.name.length)}\n\n`
    text += `Conversation ID: ${conversation.id}\n`
    text += `Status: ${conversation.status}\n`
    text += `Created: ${formatDate(conversation.created_at)}\n`
    text += `Total Messages: ${messages.length}\n\n`

    messages.forEach((message, index) => {
      text += `[${formatDate(message.timestamp)}] ${message.agent_name || 'Unknown'}:\n`
      text += `${message.content}\n\n`
    })

    return text
  }

  const getExportContent = () => {
    switch (exportFormat) {
      case 'markdown':
        return generateMarkdown()
      case 'json':
        return generateJSON()
      case 'text':
        return generatePlainText()
      default:
        return generateMarkdown()
    }
  }

  const getFileName = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const safeName = conversation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const extension = exportFormat === 'markdown' ? 'md' : exportFormat === 'json' ? 'json' : 'txt'
    return `${safeName}_${timestamp}.${extension}`
  }

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const content = getExportContent()
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getFileName()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopy = async () => {
    try {
      const content = getExportContent()
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const formatOptions = [
    { value: 'markdown', label: 'Markdown (.md)', icon: FileText, description: 'Rich text format with formatting' },
    { value: 'json', label: 'JSON (.json)', icon: Code, description: 'Structured data format' },
    { value: 'text', label: 'Plain Text (.txt)', icon: FileText, description: 'Simple text format' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Conversation Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">{conversation.name}</h4>
            <p className="text-sm text-gray-600">
              {messages.length} messages • {conversation.status}
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {formatOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      exportFormat === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={exportFormat === option.value}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {getExportContent().substring(0, 200)}...
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Exporting...' : 'Download'}
            </button>
            
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationExport

