
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from '@/types/chat';
import { toast } from 'sonner';

// Define a type for the profile data we expect
type ProfileData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function useChat(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            profiles!conversations_customer_id_fkey(id, full_name, avatar_url),
            profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
            messages(*)
          `)
          .or(`customer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (error) {
          toast.error('Error loading conversations');
          console.error('Error loading conversations:', error);
          return;
        }

        if (!data) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const formattedConversations: Conversation[] = data.map(conv => {
          const isCustomer = conv.customer_id === userId;
          
          // Safely access the profile data with proper typing
          const customerProfile = conv.profiles?.conversations_customer_id_fkey as ProfileData | null;
          const sellerProfile = conv.profiles?.conversations_seller_id_fkey as ProfileData | null;
          
          // Determine which profile to use based on user role
          const participantProfile = isCustomer ? sellerProfile : customerProfile;
          
          // Get the last message from the conversation if available
          const lastMessage = conv.messages && conv.messages.length > 0 
            ? conv.messages[0] 
            : null;

          return {
            id: conv.id,
            participantId: isCustomer ? conv.seller_id : conv.customer_id,
            participantName: participantProfile?.full_name || 'Unknown User',
            participantAvatar: participantProfile?.avatar_url,
            isParticipantOnline: false, // We'll update this with realtime presence
            lastMessage: lastMessage ? {
              text: lastMessage.content,
              timestamp: lastMessage.created_at,
              isFromParticipant: lastMessage.sender_id === (isCustomer ? conv.seller_id : conv.customer_id)
            } : {
              text: 'No messages yet',
              timestamp: conv.created_at,
              isFromParticipant: false
            },
            unreadCount: conv.messages ? conv.messages.filter(m => 
              m.sender_id === (isCustomer ? conv.seller_id : conv.customer_id) && !m.read_at
            ).length : 0
          };
        });

        setConversations(formattedConversations);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchConversations:', err);
        toast.error('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        payload => {
          if (payload.new) {
            const newMessage = payload.new as Message;
            
            // Update messages if we're in the relevant conversation
            setMessages(prev => {
              const existingMessage = prev.find(m => m.id === newMessage.id);
              if (existingMessage) {
                return prev.map(m => m.id === newMessage.id ? newMessage : m);
              }
              return [...prev, newMessage];
            });

            // Update conversation list
            setConversations(prev => {
              return prev.map(conv => {
                if (conv.id === newMessage.conversation_id) {
                  return {
                    ...conv,
                    lastMessage: {
                      text: newMessage.content,
                      timestamp: newMessage.created_at,
                      isFromParticipant: newMessage.sender_id === conv.participantId
                    },
                    unreadCount: newMessage.sender_id === conv.participantId 
                      ? conv.unreadCount + 1 
                      : conv.unreadCount
                  };
                }
                return conv;
              });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Error loading messages');
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      await supabase.rpc('mark_messages_read', { conversation_id: conversationId });
    } catch (err) {
      console.error('Error in loadMessages:', err);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content
        });

      if (error) {
        toast.error('Error sending message');
        console.error('Error sending message:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in sendMessage:', err);
      toast.error('Failed to send message');
      return false;
    }
  };

  const createConversation = async (sellerId: string) => {
    if (!userId) {
      toast.error('You must be logged in to start a conversation');
      return null;
    }
    
    if (userId === sellerId) {
      toast.error("You can't start a conversation with yourself");
      return null;
    }

    try {
      // First check if a conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select()
        .or(`and(customer_id.eq.${userId},seller_id.eq.${sellerId}),and(customer_id.eq.${sellerId},seller_id.eq.${userId})`)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        toast.error('Error checking for existing conversation');
        console.error('Error checking for existing conversation:', checkError);
        return null;
      }

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation if one doesn't exist
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          customer_id: userId,
          seller_id: sellerId
        })
        .select()
        .single();

      if (error) {
        toast.error('Error creating conversation');
        console.error('Error creating conversation:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in createConversation:', err);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  return {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    createConversation
  };
}
