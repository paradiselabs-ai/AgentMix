import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted')
      } else {
        console.log('PWA installation dismissed')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="pwa-install-prompt">
      <Card className="glass-card border-white/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-teal rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Install AgentMix
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get the full experience with offline access and faster loading
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Smartphone className="h-3 w-3" />
                <span>Works on mobile</span>
                <Monitor className="h-3 w-3 ml-2" />
                <span>Works on desktop</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/30"
                >
                  Not now
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt