package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.User;
import java.util.Map;

public interface AuthService {

    Map<String, Object> login(String email, String password);

    User register(User user);
}
