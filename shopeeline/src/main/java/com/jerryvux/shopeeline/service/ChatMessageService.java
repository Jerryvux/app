package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.ChatMessage;
import com.jerryvux.shopeeline.repository.ChatMessageRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ConversationService conversationService;

    public List<ChatMessage> getMessagesByConversation(Integer conversationId) {
        return chatMessageRepository.findByConversationIdWithSenderOrderByCreatedAtAsc(conversationId);
    }

    public ChatMessage sendMessage(Integer conversationId, Integer senderId, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setConversationId(conversationId);
        chatMessage.setSenderId(senderId);
        chatMessage.setMessage(message);
        chatMessage.setIsRead(false);
        chatMessage.setCreatedAt(LocalDateTime.now());

        // Cập nhật last message trong conversation
        conversationService.updateLastMessage(conversationId, message);

        return chatMessageRepository.save(chatMessage);
    }

    @Transactional
    public void markMessagesAsRead(Integer conversationId, Integer userId) {
        chatMessageRepository.markMessagesAsRead(conversationId, userId);
    }

    @Transactional
    public void deleteMessage(Integer conversationId, Integer messageId, Integer userId) {
        // 1. Tìm tin nhắn
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // 2. Kiểm tra tin nhắn có thuộc conversation này không
        if (!chatMessage.getConversationId().equals(conversationId)) {
            throw new IllegalArgumentException("Message does not belong to this conversation");
        }

        // 3. Kiểm tra người yêu cầu có phải là người gửi tin nhắn không
        if (!chatMessage.getSenderId().equals(userId)) {
            throw new SecurityException("You are not allowed to delete this message");
        }
        // 4. Xóa tin nhắn
        chatMessageRepository.delete(chatMessage);
    }
}
