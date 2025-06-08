package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.UserResponseDTO;
import com.jerryvux.shopeeline.model.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDTO toDTO(User user);

    List<UserResponseDTO> toDTOs(List<User> users);
}
