import React from 'react';

interface MessageSidebarProps {
  conversations?: any[];
  onSelectConversation?: (id: string) => void;
  selectedId?: string;
}

export default function MessageSidebar({ 
  conversations = [],
  onSelectConversation,
  selectedId
}: MessageSidebarProps) {
  return (
    <div className="w-64 border-r bg-gray-50">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Messages</h2>
      </div>
      <div className="overflow-y-auto">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
              selectedId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => onSelectConversation?.(conversation.id)}
          >
            <div className="font-medium text-sm">
              {conversation.subject || '(no subject)'}
            </div>
            <div className="text-xs text-gray-600 mt-1 truncate">
              {conversation.lastMessage?.preview}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(conversation.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}