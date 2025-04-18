
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
        // First, get the basic conversation data
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .or(`customer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          toast.error('Error loading conversations');
          console.error('Error loading conversations:', conversationsError);
          return;
        }

        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // For each conversation, get the profile data and messages separately
        const formattedConversations: Conversation[] = await Promise.all(
          conversationsData.map(async (conv) => {
            const isCustomer = conv.customer_id === userId;
            const participantId = isCustomer ? conv.seller_id : conv.customer_id;
            
            // Get participant profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', participantId)
              .single();
            
            if (profileError) {
              console.error('Error loading profile:', profileError);
            }
            
            // Get the last message for this conversation
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (messageError && messageError.code !== 'PGRST116') {
              console.error('Error loading message:', messageError);
            }
            
            // Count unread messages
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('sender_id', participantId)
              .is('read_at', null);
              
            if (countError) {
              console.error('Error counting unread messages:', countError);
            }

            return {
              id: conv.id,
              participantId: participantId,
              participantName: profileData?.full_name || 'Unknown User',
              participantAvatar: profileData?.avatar_url,
              isParticipantOnline: false, // We'll update this with realtime presence
              lastMessage: messageData ? {
                text: messageData.content,
                timestamp: messageData.created_at,
                isFromParticipant: messageData.sender_id === participantId
              } : {
                text: 'No messages yet',
                timestamp: conv.created_at,
                isFromParticipant: false
              },
              unreadCount: count || 0
            };
          })
        );

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
