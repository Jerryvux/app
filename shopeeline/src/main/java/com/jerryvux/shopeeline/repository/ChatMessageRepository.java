package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);

    @Query("SELECT cm FROM ChatMessage cm JOIN FETCH cm.sender WHERE cm.conversationId = :conversationId ORDER BY cm.createdAt ASC")
    List<ChatMessage> findByConversationIdWithSenderOrderByCreatedAtAsc(Integer conversationId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversationId = :conversationId AND m.senderId != :userId")
    void markMessagesAsRead(Integer conversationId, Integer userId);
}
