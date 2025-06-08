package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.dto.UserResponseDTO;
import com.jerryvux.shopeeline.model.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<UserResponseDTO> getAll();

    Optional<UserResponseDTO> getById(Integer id);

    User create(User user);

    User update(Integer id, User user);

    void delete(Integer id);

    UserDetails findById(Integer id);

    List<User> getAllUsers();

    User getUserById(Integer id);

    User updateUser(User user);

    void deleteUser(Integer id);
}
