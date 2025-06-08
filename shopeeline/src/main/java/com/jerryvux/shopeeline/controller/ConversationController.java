package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.ConversationDTO;
import com.jerryvux.shopeeline.mapper.ConversationMapper;
import com.jerryvux.shopeeline.model.Conversation;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.service.ConversationService;
import com.jerryvux.shopeeline.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private ConversationMapper conversationMapper;

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getUserConversations(Authentication authentication) {
        Integer userId = getUserIdFromAuthentication(authentication);
        List<Conversation> conversations = conversationService.getUserConversations(userId);
        List<ConversationDTO> conversationDTOs = conversations.stream()
                .map(conversationMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(conversationDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversation(
            @PathVariable Integer id,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);

        return conversationService.getConversationById(id)
                .filter(conversation
                        -> conversation.getBuyerId().equals(userId)
                || conversation.getSellerId().equals(userId))
                .map(conversationMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Integer userId = getUserIdFromAuthentication(authentication);
        Integer sellerId = Integer.valueOf(request.get("sellerId").toString());

        Integer productId = request.containsKey("productId") && request.get("productId") != null
                ? Integer.valueOf(request.get("productId").toString())
                : null;

        try {
            Conversation conversation = conversationService.createConversation(userId, sellerId, productId);
            ConversationDTO conversationDTO = conversationMapper.toDto(conversation);
            return ResponseEntity.status(HttpStatus.CREATED).body(conversationDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
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
