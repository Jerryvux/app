package com.jerryvux.shopeeline.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {

    private Integer id;
    private Integer conversationId;
    private Integer senderId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    private String senderName;
    private String senderAvatar;
}
