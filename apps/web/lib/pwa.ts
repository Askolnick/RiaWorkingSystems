/**
 * RIA PWA Utilities
 * 
 * Progressive Web App utilities for installation, offline detection, and service worker management
 * Based on Buoy's PWA patterns
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  installPrompt: BeforeInstallPromptEvent | null;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export class PWAManager {
  private installPrompt: BeforeInstallPromptEvent | null = null;
  private callbacks: {
    onInstallable?: (canInstall: boolean) => void;
    onInstalled?: () => void;
    onOffline?: (isOffline: boolean) => void;
    onUpdateAvailable?: () => void;
  } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize PWA functionality
   */
  private initialize(): void {
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as BeforeInstallPromptEvent;
      this.callbacks.onInstallable?.(true);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.callbacks.onInstalled?.();
    });

    // Online/offline detection
    window.addEventListener('online', () => {
      this.callbacks.onOffline?.(false);
    });

    window.addEventListener('offline', () => {
      this.callbacks.onOffline?.(true);
    });

    // Service worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          this.callbacks.onUpdateAvailable?.();
        }
      });
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onInstallable?: (canInstall: boolean) => void;
    onInstalled?: () => void;
    onOffline?: (isOffline: boolean) => void;
    onUpdateAvailable?: () => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current PWA installation state
   */
  getInstallState(): PWAInstallState {
    return {
      isInstallable: this.installPrompt !== null,
      isInstalled: this.isInstalled(),
      isStandalone: this.isStandalone(),
      platform: this.detectPlatform(),
      installPrompt: this.installPrompt,
    };
  }

  /**
   * Trigger PWA installation prompt
   */
  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install prompt failed:', error);
      return false;
    }
  }

  /**
   * Check if app is installed/running in standalone mode
   */
  isInstalled(): boolean {
    return this.isStandalone();
  }

  /**
   * Check if app is running in standalone mode
   */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      // iOS Safari
      (window.navigator as any).standalone === true ||
      // Android Chrome
      document.referrer.includes('android-app://')
    );
  }

  /**
   * Detect platform for PWA features
   */
  detectPlatform(): 'android' | 'ios' | 'desktop' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/macintosh|windows|linux/.test(userAgent)) {
      return 'desktop';
    }
    
    return 'unknown';
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(swPath = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(swPath);
      
      console.log('Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.callbacks.onUpdateAvailable?.();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      
      // Skip waiting and claim clients
      const worker = registration.waiting;
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' });
      }
      
      window.location.reload();
    }
  }

  /**
   * Show iOS install instructions
   */
  showIOSInstallInstructions(): string {
    return `To install RIA on your iOS device:
1. Tap the Share button (square with arrow)
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm`;
  }

  /**
   * Get install instructions for current platform
   */
  getInstallInstructions(): string {
    const platform = this.detectPlatform();
    
    switch (platform) {
      case 'ios':
        return this.showIOSInstallInstructions();
      case 'android':
        return 'Tap "Install" when prompted, or use "Add to Home Screen" from the browser menu.';
      case 'desktop':
        return 'Click the install button in the address bar or app menu.';
      default:
        return 'Installation instructions vary by device. Look for "Install" or "Add to Home Screen" options.';
    }
  }
}

/**
 * PWA Hook for React components
 */
export function usePWA() {
  const [pwaManager] = useState(() => new PWAManager());
  const [installState, setInstallState] = useState<PWAInstallState>(() => 
    pwaManager.getInstallState()
  );
  const [isOnline, setIsOnline] = useState(() => pwaManager.isOnline());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    pwaManager.setCallbacks({
      onInstallable: (canInstall) => {
        setInstallState(prev => ({ ...prev, isInstallable: canInstall }));
      },
      onInstalled: () => {
        setInstallState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          isInstallable: false 
        }));
      },
      onOffline: (offline) => {
        setIsOnline(!offline);
      },
      onUpdateAvailable: () => {
        setUpdateAvailable(true);
      },
    });

    // Register service worker
    pwaManager.registerServiceWorker();

    return () => {
      // Cleanup if needed
    };
  }, [pwaManager]);

  const install = async () => {
    const success = await pwaManager.promptInstall();
    if (success) {
      setInstallState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
    }
    return success;
  };

  const updateApp = async () => {
    await pwaManager.updateServiceWorker();
    setUpdateAvailable(false);
  };

  return {
    ...installState,
    isOnline,
    updateAvailable,
    install,
    updateApp,
    getInstallInstructions: () => pwaManager.getInstallInstructions(),
  };
}

/**
 * Global PWA manager instance
 */
export const globalPWAManager = new PWAManager();

/**
 * Check if PWA features are supported
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Add to homescreen detection
 */
export function isAddToHomescreenSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  // iOS Safari
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isIOSChrome = /crios/.test(navigator.userAgent.toLowerCase());
  const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) && 
                   !/chrome/.test(navigator.userAgent.toLowerCase());
  
  if (isIOS && (isSafari || isIOSChrome)) {
    return true;
  }
  
  // Android Chrome
  const isAndroid = /android/.test(navigator.userAgent.toLowerCase());
  const isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
  
  if (isAndroid && isChrome) {
    return true;
  }
  
  // Desktop browsers with PWA support
  return 'beforeinstallprompt' in window;
}