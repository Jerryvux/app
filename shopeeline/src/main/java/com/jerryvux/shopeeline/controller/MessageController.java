package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.MessageDTO;
import com.jerryvux.shopeeline.exception.NotFoundException;
import com.jerryvux.shopeeline.mapper.MessageMapper;
import com.jerryvux.shopeeline.model.Message;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;
    @Autowired
    private MessageMapper messageMapper;

    @GetMapping
    public List<MessageDTO> getAllMessages() {
        return messageService.getAllMessages().stream()
                .map(messageMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/unread")
    public List<MessageDTO> getUnreadMessages() {
        return messageService.getUnreadMessages().stream()
                .map(messageMapper::toDto)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/read")
    public MessageDTO markAsRead(@PathVariable Integer id) {
        MessageDTO messageDTO = messageMapper.toDto(messageService.markAsRead(id));
        if (messageDTO == null) {
            throw new NotFoundException("Message not found with ID: " + id);
        }
        return messageDTO;
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Integer id) {
        messageService.deleteMessage(id);
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(
        @RequestBody Map<String, Object> request,
        Authentication authentication
    ) {
        Integer conversationId = Integer.valueOf(request.get("conversationId").toString());
        String content = request.get("content").toString();
        Integer userId = ((User) authentication.getPrincipal()).getId();

        Message message = messageService.sendMessage(conversationId, userId, content);
        return ResponseEntity.ok(messageMapper.toDto(message));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(
        @PathVariable Integer conversationId
    ) {
        List<MessageDTO> messages = messageService.getMessagesByConversation(conversationId).stream()
            .map(messageMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/user")
    public ResponseEntity<List<MessageDTO>> getUnreadMessagesByUser(Authentication authentication) {
        Integer userId = ((User) authentication.getPrincipal()).getId();
        List<MessageDTO> unreadMessages = messageService.getUnreadMessagesByUser(userId).stream()
            .map(messageMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(unreadMessages);
    }
}
