
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, User, Search } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for chat conversations and sellers
const mockConversations = [
  {
    id: 'conv1',
    seller: {
      id: 'seller1',
      name: 'ElectroGadgets Store',
      avatar: 'https://ui-avatars.com/api/?name=Electro+Gadgets&background=random',
      isOnline: true,
    },
    lastMessage: {
      text: 'Yes, it comes with a 2-year warranty.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isFromSeller: true,
    },
    unread: 0,
  },
  {
    id: 'conv2',
    seller: {
      id: 'seller2',
      name: 'TechWorld',
      avatar: 'https://ui-avatars.com/api/?name=Tech+World&background=random',
      isOnline: false,
    },
    lastMessage: {
      text: 'Do you have this in blue color?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isFromSeller: false,
    },
    unread: 1,
  },
  {
    id: 'conv3',
    seller: {
      id: 'seller3',
      name: 'Home Essentials',
      avatar: 'https://ui-avatars.com/api/?name=Home+Essentials&background=random',
      isOnline: true,
    },
    lastMessage: {
      text: 'Your order has been shipped. The tracking number is TX8547921.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isFromSeller: true,
    },
    unread: 0,
  },
];

// Mock messages for selected conversation
const mockMessages = {
  conv1: [
    {
      id: 'm1',
      content: 'Hello! I have a question about the wireless headphones I purchased.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      isFromSeller: false,
    },
    {
      id: 'm2',
      content: 'Hi there! How can I help you with your headphones?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 minutes ago
      isFromSeller: true,
    },
    {
      id: 'm3',
      content: 'I wanted to know if they come with a warranty.',
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50 minutes ago
      isFromSeller: false,
    },
    {
      id: 'm4',
      content: 'Yes, it comes with a 2-year warranty.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isFromSeller: true,
    },
  ],
  conv2: [
    {
      id: 'm1',
      content: 'Hi, I\'m interested in the smartwatch you have listed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      isFromSeller: false,
    },
    {
      id: 'm2',
      content: 'Hello! Thank you for your interest. It\'s one of our best-selling models.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(), // 2.5 hours ago
      isFromSeller: true,
    },
    {
      id: 'm3',
      content: 'Do you have this in blue color?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isFromSeller: false,
    },
  ],
  conv3: [
    {
      id: 'm1',
      content: 'When will my order be shipped?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
      isFromSeller: false,
    },
    {
      id: 'm2',
      content: 'We\'re processing your order now. It should ship within 24 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5).toISOString(), // 24.5 hours ago
      isFromSeller: true,
    },
    {
      id: 'm3',
      content: 'Great, thank you!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.2).toISOString(), // 24.2 hours ago
      isFromSeller: false,
    },
    {
      id: 'm4',
      content: 'Your order has been shipped. The tracking number is TX8547921.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
      isFromSeller: true,
    },
  ],
};

const suggestionMessages = [
  "Hi, when will my order arrive?",
  "Is this product still available?",
  "Do you offer international shipping?",
  "Can I get a discount for bulk orders?",
];

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationList, setConversationList] = useState(mockConversations);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
  
  // Load conversation messages when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation as keyof typeof mockMessages] || []);
      
      // Mark conversation as read when selected
      setConversationList(prev => 
        prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, unread: 0 } 
            : conv
        )
      );
    }
  }, [selectedConversation]);
  
  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMsg = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isFromSeller: false,
    };
    
    // Add message to current conversation
    setMessages(prev => [...prev, newMsg]);
    
    // Update last message in conversation list
    setConversationList(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: {
                text: newMessage,
                timestamp: new Date().toISOString(),
                isFromSeller: false,
              }
            } 
          : conv
      )
    );
    
    setNewMessage('');
    
    // Simulate seller response after a delay
    if (selectedConversation === 'conv1') {
      setTimeout(() => {
        const sellerResponse = {
          id: `m${Date.now()}`,
          content: "Thanks for your message! I'll check and get back to you as soon as possible.",
          timestamp: new Date().toISOString(),
          isFromSeller: true,
        };
        
        setMessages(prev => [...prev, sellerResponse]);
        
        // Update last message in conversation list
        setConversationList(prev => 
          prev.map(conv => 
            conv.id === selectedConversation 
              ? { 
                  ...conv, 
                  lastMessage: {
                    text: sellerResponse.content,
                    timestamp: new Date().toISOString(),
                    isFromSeller: true,
                  }
                } 
              : conv
          )
        );
      }, 1500);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Filter conversations based on search term
  const filteredConversations = conversationList.filter(conv => 
    conv.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle clicking a suggestion message
  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
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
              <div className="border-r">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      placeholder="Search conversations" 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto h-[calc(600px-60px)]">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => (
                      <div 
                        key={conv.id}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-start ${
                          selectedConversation === conv.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <div className="relative mr-3">
                          <img 
                            src={conv.seller.avatar} 
                            alt={conv.seller.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conv.seller.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium truncate">{conv.seller.name}</h3>
                            <span className="text-xs text-gray-500">{formatTimestamp(conv.lastMessage.timestamp)}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage.isFromSeller ? `${conv.seller.name}: ` : 'You: '}
                            {conv.lastMessage.text}
                          </p>
                        </div>
                        
                        {conv.unread > 0 && (
                          <span className="ml-2 bg-amazon-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No conversations found
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-3 border-b flex items-center">
                      {conversationList.find(c => c.id === selectedConversation)?.seller && (
                        <>
                          <img 
                            src={conversationList.find(c => c.id === selectedConversation)?.seller.avatar} 
                            alt={conversationList.find(c => c.id === selectedConversation)?.seller.name} 
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <h3 className="font-medium">
                              {conversationList.find(c => c.id === selectedConversation)?.seller.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {conversationList.find(c => c.id === selectedConversation)?.seller.isOnline 
                                ? 'Online' 
                                : 'Offline'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Messages List */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      <div className="space-y-4">
                        {messages.map(msg => (
                          <div 
                            key={msg.id}
                            className={`flex ${msg.isFromSeller ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.isFromSeller 
                                  ? 'bg-white border'
                                  : 'bg-amazon-light text-white'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <span className="text-xs opacity-70 block text-right mt-1">
                                {formatTimestamp(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Suggested Messages */}
                    <div className="p-2 border-t border-gray-200 flex flex-wrap gap-2 bg-gray-50">
                      {suggestionMessages.map((msg, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(msg)}
                          className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center">
                      <Input 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        type="submit" 
                        className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                        disabled={!newMessage.trim()}
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <MessageCircle size={64} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                    <p className="text-gray-500 mb-6">Select a conversation to start chatting</p>
                    <p className="text-sm text-gray-400">You can contact sellers about products you've purchased or are interested in.</p>
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
