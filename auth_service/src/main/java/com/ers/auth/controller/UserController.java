package com.ers.auth.controller;

import com.ers.auth.Entity.User;
import com.ers.auth.dtos.UserProfileResponse;
import com.ers.auth.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // Extracted from JWT token via SecurityContext

        User user = userService.getUserByEmail(email);

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus());

        return ResponseEntity.ok(response);
    }
}
