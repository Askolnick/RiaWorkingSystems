'use client';

import React, { useState, useEffect } from 'react';
import { useSecureStorage, XSSProtection } from '@ria/security';

interface SecureStorageDemoProps {
  userId?: string;
}

export default function SecureStorageDemo({ userId = 'demo-user' }: SecureStorageDemoProps) {
  const [password, setPassword] = useState('');
  const [testData, setTestData] = useState('');
  const [retrievedData, setRetrievedData] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    storage,
    isReady,
    isInitializing,
    error,
    initialize,
    setItem,
    getItem,
    keys,
    getStats,
    clear
  } = useSecureStorage({
    autoInitialize: false,
    clearOnLogout: true
  });

  const [stats, setStats] = useState<{
    itemCount: number;
    totalSize: number;
    avgItemSize: number;
  } | null>(null);

  // Initialize storage with password
  const handleInitialize = async () => {
    if (!password.trim()) {
      alert('Please enter a password');
      return;
    }

    try {
      await initialize(password, userId);
      setIsInitialized(true);
      updateStats();
    } catch (err) {
      console.error('Failed to initialize secure storage:', err);
    }
  };

  // Store test data securely
  const handleStoreData = async () => {
    if (!isReady || !testData.trim()) {
      alert('Please initialize storage and enter test data');
      return;
    }

    try {
      // Sanitize input before storing
      const sanitizedData = XSSProtection.sanitizeText(testData);
      
      await setItem('demo-data', {
        content: sanitizedData,
        timestamp: new Date().toISOString(),
        type: 'demo'
      });
      
      setTestData('');
      updateStats();
      alert('Data stored securely!');
    } catch (err) {
      console.error('Failed to store data:', err);
      alert('Failed to store data');
    }
  };

  // Retrieve stored data
  const handleRetrieveData = async () => {
    if (!isReady) {
      alert('Please initialize storage first');
      return;
    }

    try {
      const data = await getItem<{
        content: string;
        timestamp: string;
        type: string;
      }>('demo-data');
      
      if (data) {
        setRetrievedData(`${data.content} (stored: ${new Date(data.timestamp).toLocaleString()})`);
      } else {
        setRetrievedData('No data found');
      }
    } catch (err) {
      console.error('Failed to retrieve data:', err);
      setRetrievedData('Error retrieving data');
    }
  };

  // Update storage statistics
  const updateStats = async () => {
    if (!isReady) return;

    try {
      const storageStats = await getStats();
      setStats(storageStats);
    } catch (err) {
      console.error('Failed to get stats:', err);
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (!isReady) return;

    if (confirm('Clear all encrypted data?')) {
      try {
        await clear();
        setRetrievedData('');
        updateStats();
        alert('All data cleared');
      } catch (err) {
        console.error('Failed to clear data:', err);
      }
    }
  };

  // Update stats when storage becomes ready
  useEffect(() => {
    if (isReady) {
      updateStats();
    }
  }, [isReady]);

  return (
    <div className="rounded-2xl bg-bg-1 border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">🔒 Encrypted Storage Demo</h2>
        <div className="text-xs text-text-muted">
          Status: {isInitializing ? 'Initializing...' : isReady ? '✅ Ready' : '⏸️ Not initialized'}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          Error: {error}
        </div>
      )}

      {!isInitialized && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-text-muted block mb-1">
              Encryption Password (demo only - don't use real passwords)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter demo password"
                className="flex-1 h-8 px-3 rounded border border-border text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
              />
              <button
                onClick={handleInitialize}
                disabled={isInitializing || !password.trim()}
                className="h-8 px-3 rounded bg-theme text-white text-sm disabled:opacity-50"
              >
                {isInitializing ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isReady && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-text-muted block mb-1">Test Data</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="Enter sensitive data to encrypt"
                className="flex-1 h-8 px-3 rounded border border-border text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleStoreData()}
              />
              <button
                onClick={handleStoreData}
                disabled={!testData.trim()}
                className="h-8 px-3 rounded bg-green-500 text-white text-sm disabled:opacity-50"
              >
                Store
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRetrieveData}
              className="h-8 px-3 rounded bg-blue-500 text-white text-sm"
            >
              Retrieve Data
            </button>
            <button
              onClick={handleClearData}
              className="h-8 px-3 rounded bg-red-500 text-white text-sm"
            >
              Clear All
            </button>
            <button
              onClick={updateStats}
              className="h-8 px-3 rounded border border-border text-sm"
            >
              Refresh Stats
            </button>
          </div>

          {retrievedData && (
            <div className="text-sm bg-green-50 p-2 rounded">
              <strong>Retrieved:</strong> {retrievedData}
            </div>
          )}

          {stats && (
            <div className="text-xs text-text-muted space-y-1">
              <div>Items: {stats.itemCount}</div>
              <div>Total size: {stats.totalSize} bytes</div>
              <div>Avg item size: {stats.avgItemSize} bytes</div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-text-muted">
        💡 This demonstrates military-grade AES-256-GCM encryption for sensitive data storage.
        All data is encrypted before being stored in the browser.
      </div>
    </div>
  );
}