package com.ers.auth.controller;

import com.ers.auth.Entity.User;
import com.ers.auth.dtos.UpdateProfileRequest;
import com.ers.auth.dtos.UserProfileResponse;
import com.ers.auth.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private final UserService userService;

    @GetMapping("/profile")
public ResponseEntity<UserProfileResponse> getUserProfile() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();

    User user = userService.getUserByEmail(email);
    UserProfile profile = user.getProfile();

    UserProfileResponse response = new UserProfileResponse(
            user.getId(),
            profile != null ? profile.getName() : null,
            user.getEmail(),
            user.getRole(),
            user.getStatus(),
            profile != null ? profile.getPhone() : null,
            profile != null ? profile.getAddress() : null,
            profile != null ? profile.getDob() : null
    );

    return ResponseEntity.ok(response);
}

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserProfileResponse response = userService.updateProfile(email, request);

        return ResponseEntity.ok(response);
    }
}
