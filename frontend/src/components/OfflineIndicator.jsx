import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showIndicator, setShowIndicator] = useState(false)
  const [_justCameOnline, setJustCameOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      setJustCameOnline(true)
      
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => {
        setShowIndicator(false)
        setJustCameOnline(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
      setJustCameOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showIndicator) {
    return null
  }

  return (
    <div className={isOnline ? 'online-indicator' : 'offline-indicator'}>
      <div className="flex items-center gap-1.5 text-xs">
        {isOnline ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>You're offline</span>
          </>
        )}
      </div>
    </div>
  )
}

export default OfflineIndicator