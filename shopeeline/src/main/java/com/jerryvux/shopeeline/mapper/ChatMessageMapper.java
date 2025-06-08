package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.model.ChatMessage;
import com.jerryvux.shopeeline.dto.ChatMessageDTO;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageMapper {

    public ChatMessageDTO toDto(ChatMessage chatMessage) {
        if (chatMessage == null) {
            return null;
        }

        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(chatMessage.getId());
        dto.setConversationId(chatMessage.getConversationId());
        dto.setSenderId(chatMessage.getSenderId());
        dto.setMessage(chatMessage.getMessage());
        dto.setIsRead(chatMessage.getIsRead());
        dto.setCreatedAt(chatMessage.getCreatedAt());

        if (chatMessage.getSender() != null) {
            dto.setSenderName(chatMessage.getSender().getName());
            dto.setSenderAvatar(chatMessage.getSender().getAvatar());
        }

        return dto;
    }

    public ChatMessage toEntity(ChatMessageDTO dto) {
        if (dto == null) {
            return null;
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setId(dto.getId());
        chatMessage.setConversationId(dto.getConversationId());
        chatMessage.setSenderId(dto.getSenderId());
        chatMessage.setMessage(dto.getMessage());
        chatMessage.setIsRead(dto.getIsRead());
        chatMessage.setCreatedAt(dto.getCreatedAt());

        return chatMessage;
    }
}
