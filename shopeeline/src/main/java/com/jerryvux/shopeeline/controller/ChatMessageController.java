package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.model.ChatMessage;
import com.jerryvux.shopeeline.dto.ChatMessageDTO;
import com.jerryvux.shopeeline.mapper.ChatMessageMapper;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.model.Conversation;
import com.jerryvux.shopeeline.service.ChatMessageService;
import com.jerryvux.shopeeline.service.ConversationService;
import com.jerryvux.shopeeline.security.UserPrincipal;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Integer conversationId,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);

        boolean hasAccess = conversationService.getConversationById(conversationId)
                .map(conversation
                        -> conversation.getBuyerId().equals(userId)
                || conversation.getSellerId().equals(userId))
                .orElse(false);

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ChatMessage> messages = chatMessageService.getMessagesByConversation(conversationId);
        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(chatMessageMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messageDTOs);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable Integer conversationId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);
        String message = request.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        boolean hasAccess = conversationService.getConversationById(conversationId)
                .map(conversation
                        -> conversation.getBuyerId().equals(userId)
                || conversation.getSellerId().equals(userId))
                .orElse(false);

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ChatMessage chatMessage = chatMessageService.sendMessage(conversationId, userId, message);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatMessage);
    }

    @PutMapping("/{conversationId}/read")
    @Transactional
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Integer conversationId,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);

        boolean hasAccess = conversationService.getConversationById(conversationId)
                .map(conversation
                        -> conversation.getBuyerId().equals(userId)
                || conversation.getSellerId().equals(userId))
                .orElse(false);

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        chatMessageService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Integer conversationId,
            @PathVariable Integer messageId,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);

        try {
            chatMessageService.deleteMessage(conversationId, messageId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Integer getUserIdFromAuthentication(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userPrincipal.getId();
    }
}
