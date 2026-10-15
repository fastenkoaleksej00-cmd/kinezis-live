export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  fromStaff: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  authorId: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  lastReadByUserAt: string | null;
  lastReadByStaffAt: string | null;
}

export interface InboxItem extends Conversation {
  userName: string | null;
  userAvatar: string | null;
  lastMessage: string | null;
  unreadForStaff: boolean;
}
