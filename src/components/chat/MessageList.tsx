
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 bg-gray-50">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender_id === currentUserId
                  ? 'bg-amazon-light text-white'
                  : 'bg-white border'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70 block text-right mt-1">
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};
