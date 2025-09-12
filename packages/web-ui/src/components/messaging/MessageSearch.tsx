'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Clock, User, Hash, Filter } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface SearchResult {
  id: string;
  threadId: string;
  threadTitle: string;
  messageId: string;
  bodyText: string;
  authorId: string;
  authorName: string;
  sentAt: string;
  snippet: string;
  highlights: Array<{ start: number; end: number }>;
}

export interface SearchFilters {
  authorId?: string;
  threadId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
}

interface MessageSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function MessageSearch({
  onSearch,
  onResultClick,
  placeholder = 'Search messages...',
  className = '',
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const searchResults = await onSearch(query, filters);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, filters, onSearch]);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setFilters({});
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick(result);
    setShowResults(false);
  }, [onResultClick]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const highlightText = (text: string, highlights: Array<{ start: number; end: number }>) => {
    if (highlights.length === 0) return text;

    const parts = [];
    let lastIndex = 0;

    highlights.forEach(({ start, end }) => {
      // Add text before highlight
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      
      // Add highlighted text
      parts.push(
        <mark key={`${start}-${end}`} className="bg-yellow-200 px-1 rounded">
          {text.slice(start, end)}
        </mark>
      );
      
      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {loading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">Search Filters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.hasAttachments || false}
                onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                className="mr-2"
              />
              Messages with attachments only
            </label>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No messages found</p>
              <p className="text-sm">Try different search terms or adjust your filters</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.threadId}-${result.messageId}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {result.authorName}
                        </span>
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">
                          {result.threadTitle}
                        </span>
                        <Clock className="h-3 w-3 text-gray-400 ml-auto" />
                        <span className="text-xs text-gray-500">
                          {formatDate(result.sentAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {highlightText(result.snippet, result.highlights)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

// Quick search component for smaller spaces
interface QuickSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuickSearch({
  onSearch,
  placeholder = 'Quick search...',
  className = '',
}: QuickSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </form>
  );
}