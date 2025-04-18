
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  isParticipantOnline: boolean;
  lastMessage: {
    text: string;
    timestamp: string;
    isFromParticipant: boolean;
  };
  unreadCount: number;
}
