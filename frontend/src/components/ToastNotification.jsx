import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastNotification = ({ type = 'info', title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStyles = () => {
    const baseStyles = "bg-white/90 backdrop-blur-md border rounded-2xl shadow-2xl p-3 max-w-sm"
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-200 border-l-4 border-l-green-500`
      case 'error':
        return `${baseStyles} border-red-200 border-l-4 border-l-red-500`
      case 'warning':
        return `${baseStyles} border-yellow-200 border-l-4 border-l-yellow-500`
      default:
        return `${baseStyles} border-blue-200 border-l-4 border-l-blue-500`
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={getStyles()}>
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-xs font-semibold text-gray-900 mb-0.5">
                {title}
              </h4>
            )}
            <p className="text-xs text-gray-700">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ToastNotification

