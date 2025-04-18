
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="border-r h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search conversations" 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div 
              key={conv.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-start ${
                selectedConversationId === conv.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="relative mr-3">
                <img 
                  src={conv.participantAvatar || `https://ui-avatars.com/api/?name=${conv.participantName}`}
                  alt={conv.participantName} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conv.isParticipantOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium truncate">{conv.participantName}</h3>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage.isFromParticipant ? `${conv.participantName}: ` : 'You: '}
                  {conv.lastMessage.text}
                </p>
              </div>
              
              {conv.unreadCount > 0 && (
                <span className="ml-2 bg-amazon-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
