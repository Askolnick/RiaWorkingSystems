interface Message {
  id: string;
  content: string;
  from: string;
  timestamp: Date;
}

interface ThreadViewProps {
  messages: Message[];
}

export function ThreadView({ messages }: ThreadViewProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium">{message.from}</span>
            <span className="text-sm text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-gray-700">{message.content}</div>
        </div>
      ))}
    </div>
  );
}