import React from 'react';

interface ConversationListProps {
  conversations?: any[];
}

export default function ConversationList({ conversations = [] }: ConversationListProps) {
  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No conversations found
        </div>
      ) : (
        conversations.map((conversation) => (
          <div key={conversation.id} className="p-4 border rounded hover:bg-gray-50">
            <h3 className="font-medium">{conversation.subject || '(no subject)'}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {conversation.lastMessage?.preview}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {conversation.kind}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(conversation.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}