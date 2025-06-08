import { useState, useEffect } from 'react';
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation,
  deleteMessage,
  getConversation,
  getUserProfile,
} from '../data/api';

export const useChat = (userId, sellerId, productId, initialConversationId) => {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState({
    id: 'unknown',
    name: 'Đang tải...',
    avatar: 'https://via.placeholder.com/40'
  });

  const initializeChat = async () => {
    try {
      setLoading(true);
      let convResponse;
      let participant2Id = sellerId;

      if (!participant2Id && initialConversationId) {
        const convoData = await getConversation(initialConversationId);
        const otherParticipant = convoData.data.participants.find(
          (participant) => participant.id !== userId
        );
        if (otherParticipant) {
          participant2Id = otherParticipant.id;
        }
      }

      if (!participant2Id) {
        throw new Error('Cannot determine other participant ID');
      }

      convResponse = await getOrCreateConversation(userId, participant2Id, productId);
      const conversationData = convResponse.data;
      setConversationId(conversationData.id);

      const otherParticipant = conversationData.participants?.find(
        (participant) => participant.id !== userId
      );

      if (otherParticipant) {
        setOtherUser({
          id: otherParticipant.id,
          name: otherParticipant.name || 'Người dùng',
          avatar: otherParticipant.avatar || 'https://via.placeholder.com/40',
        });
      } else {
        const fallbackUserProfile = await getUserProfile(
          conversationData.buyerId === userId ? conversationData.sellerId : conversationData.buyerId
        );
        setOtherUser({
          id: fallbackUserProfile.data.id,
          name: fallbackUserProfile.data.name || 'Người dùng',
          avatar: fallbackUserProfile.data.avatar || 'https://via.placeholder.com/40',
        });
      }

      await loadMessages(conversationData.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const idToUse = convId || conversationId;
      const response = await getConversationMessages(idToUse);
      setMessages(response.data);
      await markMessagesAsRead(idToUse);
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  };


  const handleSend = async (content) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      const response = await sendMessage(conversationId, content);
      setMessages(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(conversationId, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (userId && (sellerId || initialConversationId)) {
      initializeChat();
    }
  }, [userId, sellerId, initialConversationId]);

  return {
    messages,
    loading,
    sending,
    otherUser,
    handleSend,
    handleDeleteMessage,
    loadMessages
  };
}; 