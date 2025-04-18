
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from '@/types/chat';
import { toast } from 'sonner';

export function useChat(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch conversations
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:customer_id(id, full_name, avatar_url),
          seller:seller_id(id, full_name, avatar_url),
          messages:messages(*)
        `)
        .or(`customer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error('Error loading conversations');
        return;
      }

      const formattedConversations: Conversation[] = data.map(conv => {
        const isCustomer = conv.customer_id === userId;
        const participant = isCustomer ? conv.seller : conv.customer;
        const lastMessage = conv.messages[0] || null;

        return {
          id: conv.id,
          participantId: participant.id,
          participantName: participant.full_name || 'Unknown User',
          participantAvatar: participant.avatar_url,
          isParticipantOnline: false, // We'll update this with realtime presence
          lastMessage: lastMessage ? {
            text: lastMessage.content,
            timestamp: lastMessage.created_at,
            isFromParticipant: lastMessage.sender_id === participant.id
          } : {
            text: 'No messages yet',
            timestamp: conv.created_at,
            isFromParticipant: false
          },
          unreadCount: conv.messages.filter(m => 
            m.sender_id === participant.id && !m.read_at
          ).length
        };
      });

      setConversations(formattedConversations);
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        payload => {
          if (payload.new) {
            // Update messages if we're in the relevant conversation
            setMessages(prev => {
              const existingMessage = prev.find(m => m.id === payload.new.id);
              if (existingMessage) {
                return prev.map(m => m.id === payload.new.id ? payload.new : m);
              }
              return [...prev, payload.new];
            });

            // Update conversation list
            setConversations(prev => {
              return prev.map(conv => {
                if (conv.id === payload.new.conversation_id) {
                  return {
                    ...conv,
                    lastMessage: {
                      text: payload.new.content,
                      timestamp: payload.new.created_at,
                      isFromParticipant: payload.new.sender_id === conv.participantId
                    },
                    unreadCount: payload.new.sender_id === conv.participantId 
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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Error loading messages');
      return;
    }

    setMessages(data);

    // Mark messages as read
    await supabase.rpc('mark_messages_read', { conversation_id: conversationId });
  };

  const sendMessage = async (conversationId: string, content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content
      });

    if (error) {
      toast.error('Error sending message');
      return false;
    }

    return true;
  };

  const createConversation = async (sellerId: string) => {
    if (userId === sellerId) {
      toast.error("You can't start a conversation with yourself");
      return null;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        customer_id: userId,
        seller_id: sellerId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        // Conversation already exists, fetch it
        const { data: existingConv } = await supabase
          .from('conversations')
          .select()
          .eq('customer_id', userId)
          .eq('seller_id', sellerId)
          .single();
        
        return existingConv;
      }
      toast.error('Error creating conversation');
      return null;
    }

    return data;
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
