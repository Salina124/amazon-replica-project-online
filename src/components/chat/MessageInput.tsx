
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t flex items-center">
      <Input 
        placeholder="Type a message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 mr-2"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
        disabled={disabled || !message.trim()}
      >
        <Send size={18} />
      </Button>
    </form>
  );
};
