package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.service.UserService;
import com.jerryvux.shopeeline.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private com.jerryvux.shopeeline.service.VoucherService voucherService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Integer id, @RequestParam String role) {
        User user = userService.getUserById(id);
        user.setRole(role);
        return ResponseEntity.ok(userService.updateUser(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        // Assuming we have an isActive field in User model
        user.setIsActive(!user.getIsActive());
        return ResponseEntity.ok(userService.updateUser(user));
    }

    // Endpoint to send a message from admin
    @PostMapping("/messages")
    public ResponseEntity<Void> sendMessageToUser(@RequestBody Map<String, Object> messageData) {
        try {
            Integer recipientId = Integer.valueOf(messageData.get("recipientId").toString());
            String title = messageData.get("title").toString();
            String content = messageData.get("content").toString();

            messageService.saveAdminMessage(recipientId, title, content);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build(); // Bad request if recipientId is not a valid number
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build(); // Not found if recipient user doesn't exist
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/vouchers")
    public ResponseEntity<?> createVoucher(@RequestBody com.jerryvux.shopeeline.dto.VoucherDto voucherDto) {
        logger.info("Received request to create voucher: {}", voucherDto);
        try {
            com.jerryvux.shopeeline.model.Voucher createdVoucher = voucherService.createVoucherFromDto(voucherDto);
            logger.info("Voucher created successfully: {}", createdVoucher.getCode());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVoucher);
        } catch (IllegalArgumentException e) {
            logger.warn("Bad request while creating voucher: {}. Request: {}", e.getMessage(), voucherDto);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            logger.warn("Data integrity violation while creating voucher: {}. Request: {}", e.getMessage(), voucherDto);
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("unique constraint") || e.getMessage().toLowerCase().contains("duplicate entry")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Voucher code already exists or another unique constraint was violated.");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Data integrity violation: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating voucher. Request: {}", voucherDto, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while processing your request.");
        }
    }
}
