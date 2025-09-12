'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, Users, User as UserIcon } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Avatar } from '../../Avatar/Avatar';
import { cn } from '../../utils/cn';

interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

interface UserSearchPickerProps {
  onUsersSelected: (users: User[]) => void;
  searchUsers: (query: string) => Promise<User[]>;
  multiSelect?: boolean;
  placeholder?: string;
  className?: string;
}

export function UserSearchPicker({
  onUsersSelected,
  searchUsers,
  multiSelect = true,
  placeholder = 'Search for users...',
  className
}: UserSearchPickerProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 1) {
        setIsSearching(true);
        try {
          const results = await searchUsers(query);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Failed to search users:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, searchUsers]);

  const handleSelectUser = (user: User) => {
    if (multiSelect) {
      const isSelected = selectedUsers.some(u => u.id === user.id);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      setSelectedUsers([user]);
      onUsersSelected([user]);
      setQuery('');
      setShowResults(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = () => {
    onUsersSelected(selectedUsers);
    setQuery('');
    setSelectedUsers([]);
    setShowResults(false);
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(u => u.id === userId);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedUsers.map(user => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1 py-1">
              <Avatar 
                src={user.avatarUrl} 
                alt={user.displayName}
                size="xs"
                fallback={user.displayName[0]}
              />
              <span>{user.displayName}</span>
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
          onFocus={() => query.length > 1 && setShowResults(true)}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 p-0 max-h-64 overflow-y-auto">
          {searchResults.map(user => {
            const selected = isUserSelected(user.id);
            return (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left',
                  selected && 'bg-accent'
                )}
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.displayName}
                  size="sm"
                  fallback={user.displayName[0]}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.displayName}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                </div>
                {selected && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </Card>
      )}

      {/* No Results */}
      {showResults && query.length > 1 && searchResults.length === 0 && !isSearching && (
        <Card className="absolute z-50 w-full mt-2 p-4 text-center text-muted-foreground">
          No users found matching "{query}"
        </Card>
      )}

      {/* Submit Button for Multi-Select */}
      {multiSelect && selectedUsers.length > 0 && (
        <Button
          onClick={handleSubmit}
          className="mt-3 w-full"
        >
          {selectedUsers.length === 1 ? (
            <><UserIcon className="h-4 w-4 mr-2" /> Start Direct Message</>
          ) : (
            <><Users className="h-4 w-4 mr-2" /> Start Group Chat ({selectedUsers.length} users)</>
          )}
        </Button>
      )}
    </div>
  );
}