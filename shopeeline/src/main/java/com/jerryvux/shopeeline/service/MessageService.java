package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Conversation;
import com.jerryvux.shopeeline.model.Message;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.repository.ConversationRepository;
import com.jerryvux.shopeeline.repository.MessageRepository;
import com.jerryvux.shopeeline.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Collections;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getUnreadMessages() {
        return messageRepository.findByIsRead(false);
    }

    public Message markAsRead(Integer id) {
        Message message = messageRepository.findById(id).orElse(null);
        if (message != null) {
            message.setIsRead(true);
            return messageRepository.save(message);
        }
        return null;
    }

    public void deleteMessage(Integer id) {
        messageRepository.deleteById(id);
    }

    public Message sendMessage(Integer conversationId, Integer userId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message message = new Message();
        message.setUser(user);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        // Cập nhật tin nhắn cuối cùng của conversation
        conversation.setLastMessage(content);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversationRepository.save(conversation);

        return messageRepository.save(message);
    }

    public Message saveAdminMessage(Integer recipientId, String title, String content) {
        User recipientUser = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient user not found"));

        Message adminMessage = new Message();
        adminMessage.setUser(recipientUser);
        adminMessage.setTitle(title);
        adminMessage.setContent(content);
        adminMessage.setIsRead(false);
        adminMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return messageRepository.save(adminMessage);
    }

    public List<Message> getMessagesByConversation(Integer conversationId) {
        // TODO: Implement conversation message retrieval
        return Collections.emptyList();
    }

    public List<Message> getUnreadMessagesByUser(Integer userId) {
        return messageRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(message -> !message.getIsRead())
                .toList();
    }
}
