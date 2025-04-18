
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChat } from '@/hooks/useChat';

const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  const { 
    conversations, 
    messages, 
    loading, 
    loadMessages, 
    sendMessage 
  } = useChat(user?.id);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to access your messages');
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Load messages when selecting a conversation
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, loadMessages]);
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !content.trim()) return;
    
    const success = await sendMessage(selectedConversationId, content);
    if (!success) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <ConversationList 
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              {/* Messages Area */}
              <div className="col-span-2 flex flex-col">
                {selectedConversationId ? (
                  <>
                    {/* Conversation Header */}
                    {loading ? (
                      <div className="p-4 text-center">Loading...</div>
                    ) : (
                      <>
                        <div className="p-3 border-b">
                          {conversations.find(c => c.id === selectedConversationId)?.participantName && (
                            <div className="flex items-center">
                              <img 
                                src={conversations.find(c => c.id === selectedConversationId)?.participantAvatar || 
                                     `https://ui-avatars.com/api/?name=${
                                       conversations.find(c => c.id === selectedConversationId)?.participantName
                                     }`} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <h3 className="font-medium">
                                  {conversations.find(c => c.id === selectedConversationId)?.participantName}
                                </h3>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <MessageList 
                          messages={messages}
                          currentUserId={user?.id}
                        />
                        
                        <MessageInput 
                          onSendMessage={handleSendMessage}
                          disabled={!selectedConversationId}
                        />
                      </>
                    )}
                  </> 
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <MessageCircle size={64} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                    <p className="text-gray-500 mb-6">Select a conversation to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
