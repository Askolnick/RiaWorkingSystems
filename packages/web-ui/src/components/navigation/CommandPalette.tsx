'use client';
import React from 'react';
import Link from 'next/link';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';

interface SearchResult {
  title: string;
  path: string;
  href: string;
}

interface CommandPaletteProps {
  searchFunction: (query: string) => SearchResult[];
  className?: string;
}

export default function CommandPalette({ searchFunction, className }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  const results = React.useMemo(() => {
    return query.trim() ? searchFunction(query).slice(0, 20) : [];
  }, [query, searchFunction]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaK = (e.key.toLowerCase() === 'k') && (e.metaKey || e.ctrlKey);
      const isSlash = e.key === '/';
      
      if (isMetaK || (!open && isSlash)) {
        e.preventDefault();
        setOpen(true);
        setQuery('');
        setSelectedIndex(0);
      } else if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        setSelectedIndex(0);
      } else if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault();
          const selectedResult = results[selectedIndex];
          if (selectedResult) {
            window.location.href = selectedResult.href;
          }
          setOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      
      {/* Command Palette */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
        <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features, pages, and commands..."
              className="flex-1 border-0 shadow-none focus:ring-0"
            />
            <div className="flex gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded border">
                ⌘K
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded border">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {query.trim() ? (
                  <>No results found for "{query}"</>
                ) : (
                  <>
                    Type to search features and pages.
                    <div className="mt-2 text-sm">
                      Tip: Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">/</kbd> to open
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={result.href}
                    href={result.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.path}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === selectedIndex && (
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded">
                          Enter
                        </kbd>
                      )}
                      <div className="text-xs text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
              <span>Navigate with ↑↓ arrows</span>
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}