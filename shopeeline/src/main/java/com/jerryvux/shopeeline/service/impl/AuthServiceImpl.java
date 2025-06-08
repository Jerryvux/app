package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.config.JwtTokenProvider;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.repository.UserRepository;
import com.jerryvux.shopeeline.security.UserPrincipal;
import com.jerryvux.shopeeline.service.AuthService;
import com.jerryvux.shopeeline.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @EventListener(ApplicationReadyEvent.class)
    public void encodeAdminPasswordOnStartup() {
        String rawPassword = "admin";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        System.out.println("DEBUG: Encoded password for '" + rawPassword + "': " + encodedPassword);
    }

    @Override
    public Map<String, Object> login(String email, String password) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

            if (!user.getIsActive()) {
                throw new RuntimeException("Tài khoản đã bị khóa");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", user);

            return response;
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Sai mật khẩu");
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    @Transactional
    public User register(User user) {
        Optional<User> existingUser = userRepository.findByEmailForUpdate(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        user.setIsActive(true);

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đăng ký: " + e.getMessage());
        }
    }
}
