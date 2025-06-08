package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.MessageDTO;
import com.jerryvux.shopeeline.model.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "content", target = "content")
    @Mapping(source = "isRead", target = "isRead")
    @Mapping(source = "image", target = "image")
    @Mapping(source = "createdAt", target = "createdAt")
    MessageDTO toDto(Message message);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "userId", target = "user.id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "content", target = "content")
    @Mapping(source = "isRead", target = "isRead")
    @Mapping(source = "image", target = "image")
    @Mapping(source = "createdAt", target = "createdAt")
    Message toEntity(MessageDTO messageDTO);
}
