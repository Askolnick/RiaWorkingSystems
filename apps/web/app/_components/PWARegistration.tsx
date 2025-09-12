'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('🔧 Service Worker registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('❌ Service Worker registration failed:', error);
        });
    }

    // Handle PWA installation prompt
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install banner after a delay
      setTimeout(() => {
        if (deferredPrompt && !localStorage.getItem('pwa-install-dismissed')) {
          showInstallPrompt();
        }
      }, 5000);
    };

    const showInstallPrompt = () => {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
      `;
      
      banner.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>Install RIA Management</strong><br>
          Add to home screen for quick access
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="install-btn" style="background: white; color: #3b82f6; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
            Install
          </button>
          <button id="dismiss-btn" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
            Later
          </button>
        </div>
      `;

      document.body.appendChild(banner);

      banner.querySelector('#install-btn')?.addEventListener('click', () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('📱 PWA installation accepted');
            }
            deferredPrompt = null;
          });
        }
        banner.remove();
      });

      banner.querySelector('#dismiss-btn')?.addEventListener('click', () => {
        localStorage.setItem('pwa-install-dismissed', 'true');
        banner.remove();
      });

      // Auto-hide after 15 seconds
      setTimeout(() => {
        if (banner.parentNode) {
          banner.remove();
        }
      }, 15000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}