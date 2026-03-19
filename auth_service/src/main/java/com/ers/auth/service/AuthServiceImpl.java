package com.ers.auth.service;

import com.ers.auth.Entity.User;
import com.ers.auth.dtos.LoginRequest;
import com.ers.auth.dtos.LoginResponse;
import com.ers.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements  AuthService{
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;



    @Override
    public LoginResponse login(LoginRequest dto) {

        Authentication authToken =
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(), dto.getPassword());

        Authentication authenticated =
                authenticationManager.authenticate(authToken);

        String jwt = jwtUtil.createToken(authenticated);

        String email = authenticated.getName();
        User user = userService.getUserByEmail(email);

        return new LoginResponse(
                jwt
        );

    }


}
