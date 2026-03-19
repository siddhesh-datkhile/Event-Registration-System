package com.ers.auth.service;

import com.ers.auth.dtos.LoginRequest;
import com.ers.auth.dtos.LoginResponse;

public interface AuthService {
    public LoginResponse login(LoginRequest req);
}
