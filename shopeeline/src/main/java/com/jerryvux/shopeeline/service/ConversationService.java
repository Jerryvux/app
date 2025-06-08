package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Conversation;
import com.jerryvux.shopeeline.model.Product;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.repository.ConversationRepository;
import com.jerryvux.shopeeline.repository.ProductRepository;
import com.jerryvux.shopeeline.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Conversation> getUserConversations(Integer userId) {
        return conversationRepository.findByBuyerIdOrSellerId(userId, userId);
    }

    public Optional<Conversation> getConversationById(Integer id) {
        return conversationRepository.findById(id);
    }

    public Conversation createConversation(Integer buyerId, Integer sellerId, Integer productId) {
        // Kiểm tra user có tồn tại không
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        // Kiểm tra xem đã có conversation giữa hai người dùng với sản phẩm này chưa
        Optional<Conversation> existingConversation;

        if (productId != null) {
            // Kiểm tra sản phẩm có tồn tại không
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            existingConversation = conversationRepository
                    .findConversationByUsersAndProduct(buyerId, sellerId, productId);
        } else {
            // Nếu không có productId, tìm conversation giữa hai user
            List<Conversation> conversations = conversationRepository
                    .findConversationBetweenUsers(buyerId, sellerId);
            existingConversation = conversations.isEmpty()
                    ? Optional.empty() : Optional.of(conversations.get(0));
        }

        // Nếu đã có conversation, trả về conversation đó
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        // Tạo conversation mới
        Conversation conversation = new Conversation();
        conversation.setBuyerId(buyerId);
        conversation.setSellerId(sellerId);
        conversation.setProductId(productId);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        return conversationRepository.save(conversation);
    }

    public void updateLastMessage(Integer conversationId, String message) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        conversation.setLastMessage(message);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversationRepository.save(conversation);
    }
}
