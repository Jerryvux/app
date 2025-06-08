package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {

    List<Conversation> findByBuyerIdOrSellerId(Integer buyerId, Integer sellerId);

    @Query("SELECT c FROM Conversation c WHERE (c.buyerId = :userId1 AND c.sellerId = :userId2) OR (c.buyerId = :userId2 AND c.sellerId = :userId1)")
    List<Conversation> findConversationBetweenUsers(Integer userId1, Integer userId2);

    @Query("SELECT c FROM Conversation c WHERE (c.buyerId = :userId1 AND c.sellerId = :userId2 AND c.productId = :productId) OR (c.buyerId = :userId2 AND c.sellerId = :userId1 AND c.productId = :productId)")
    Optional<Conversation> findConversationByUsersAndProduct(Integer userId1, Integer userId2, Integer productId);
}
