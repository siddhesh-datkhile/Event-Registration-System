package com.ers.auth.service;

import com.ers.auth.Entity.Role;
import com.ers.auth.Entity.User;
import com.ers.auth.Entity.UserStatus;
import com.ers.auth.dtos.OrganizerRequest;
import com.ers.auth.dtos.OrganizerResponse;
import com.ers.auth.dtos.RegistrantRequest;
import com.ers.auth.dtos.RegistrantResponse;
import com.ers.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    @Autowired
    public final UserRepository userRepository;
    @Autowired
    public final PasswordEncoder passwordEncoder;

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public OrganizerResponse createOrganizer(OrganizerRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        // Testing Purpose
        String rawPassword = "organizer@123";
        // Production logic
        // String rawPassword = UUID.randomUUID().toString().substring(0, 8);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.ORGANIZER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return new OrganizerResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStatus());

    }

    @Override
    public RegistrantResponse createRegistrant(RegistrantRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        // Testing Purpose
        String rawPassword = "registrant@123";
        // Production logic
        // String rawPassword = UUID.randomUUID().toString().substring(0, 8);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.REGISTRANT)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return new RegistrantResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStatus());
    }
}
