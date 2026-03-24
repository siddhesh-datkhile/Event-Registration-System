package com.ers.auth.service;

import com.ers.auth.entity.User;
import com.ers.auth.dtos.LoginRequest;
import com.ers.auth.dtos.LoginResponse;
import com.ers.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements  AuthService{
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;



    @Override
    public LoginResponse login(LoginRequest dto) {
        log.info("Attempting login for user: {}", dto.getEmail());

        Authentication authToken =
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(), dto.getPassword());

        Authentication authenticated =
                authenticationManager.authenticate(authToken);

        log.debug("Authentication successful for user: {}", dto.getEmail());

        String email = authenticated.getName();
        User user = userService.getUserByEmail(email);

        String jwt = jwtUtil.createToken(authenticated, user.getId());
        
        log.info("JWT payload created for user: {} with ID: {}", email, user.getId());

        return new LoginResponse(
                jwt
        );

    }


}
