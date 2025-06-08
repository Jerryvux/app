package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.ConversationDTO;
import com.jerryvux.shopeeline.model.Conversation;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {
    public ConversationDTO toDto(Conversation conversation) {
        if (conversation == null) {
            return null;
        }
        ConversationDTO dto = new ConversationDTO();
        BeanUtils.copyProperties(conversation, dto);
        return dto;
    }

    public Conversation toEntity(ConversationDTO dto) {
        if (dto == null) {
            return null;
        }
        Conversation conversation = new Conversation();
        BeanUtils.copyProperties(dto, conversation);
        return conversation;
    }
}
