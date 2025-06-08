package com.jerryvux.shopeeline.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private Integer id;
    private Integer buyerId;
    private Integer sellerId;
    private Integer productId;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
