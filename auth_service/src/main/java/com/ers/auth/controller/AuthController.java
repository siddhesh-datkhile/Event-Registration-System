package com.ers.auth.controller;

import com.ers.auth.dtos.ApiResponse;
import com.ers.auth.dtos.LoginRequest;
import com.ers.auth.dtos.LoginResponse;
import com.ers.auth.dtos.RegisterRequest;
import com.ers.auth.dtos.UserProfileResponse;
// import com.ers.auth.security.JwtUtil;
import com.ers.auth.service.AuthService;
import com.ers.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.ers.auth.dtos.TokenRefreshRequest;
import com.ers.auth.dtos.TokenRefreshResponse;
import com.ers.auth.entity.RefreshToken;
import com.ers.auth.service.RefreshTokenService;
import com.ers.auth.security.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
// import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private final AuthService authService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JwtUtil jwtUtil;

    // @Autowired
    // private AuthenticationManager authenticationManager;

    // @Autowired
    // private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                new ApiResponse<>("Login successful", authService.login(request), 200));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfileResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserProfileResponse response = userService.register(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(new ApiResponse<>("User registered successfully", response, 201));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<TokenRefreshResponse> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    Authentication auth = new UsernamePasswordAuthenticationToken(user.getEmail(), null, user.getAuthorities());
                    String token = jwtUtil.createToken(auth, user.getId());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

}
