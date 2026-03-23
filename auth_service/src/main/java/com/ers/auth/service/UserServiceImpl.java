package com.ers.auth.service;

import com.ers.auth.entity.Role;
import com.ers.auth.entity.User;
import com.ers.auth.entity.UserProfile;
import com.ers.auth.entity.UserStatus;
import com.ers.auth.dtos.OrganizerRequest;
import com.ers.auth.dtos.OrganizerResponse;
import com.ers.auth.dtos.RegistrantRequest;
import com.ers.auth.dtos.RegistrantResponse;
import com.ers.auth.dtos.RegisterRequest;
import com.ers.auth.dtos.UpdateProfileRequest;
import com.ers.auth.dtos.UserProfileResponse;
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
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.ORGANIZER)
                .status(UserStatus.ACTIVE)
                .build();
                
        UserProfile profile = new UserProfile();
        profile.setName(request.getName());
        profile.setUser(user);
        user.setProfile(profile);

        User savedUser = userRepository.save(user);

        return new OrganizerResponse(
                savedUser.getId(),
                savedUser.getProfile().getName(),
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
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.REGISTRANT)
                .status(UserStatus.ACTIVE)
                .build();
                
        UserProfile profile = new UserProfile();
        profile.setName(request.getName());
        profile.setUser(user);
        user.setProfile(profile);

        User savedUser = userRepository.save(user);

        return new RegistrantResponse(
                savedUser.getId(),
                savedUser.getProfile().getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStatus());
    }

    @Override
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists");
        }
        
        if (request.getRole() != Role.ORGANIZER && request.getRole() != Role.REGISTRANT) {
            throw new RuntimeException("Invalid role for registration. Allowed roles: ORGANIZER, REGISTRANT");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();
                
        UserProfile profile = new UserProfile();
        profile.setName(request.getName());
        profile.setAddress(request.getAddress());
        profile.setPhone(request.getPhone());
        profile.setDob(request.getDob());
        profile.setUser(user);
        user.setProfile(profile);

        User savedUser = userRepository.save(user);

        return new UserProfileResponse(
                savedUser.getId(),
                savedUser.getProfile().getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStatus(),
                savedUser.getProfile().getPhone(),
                savedUser.getProfile().getAddress(),
                savedUser.getProfile().getDob());
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        UserProfile profile = user.getProfile();

        //create new user profile for first time if profile is null
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            profile.setName(request.getName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getDob() != null) {
            profile.setDob(request.getDob());
        }

        User savedUser = userRepository.save(user);

        return new UserProfileResponse(
                savedUser.getId(),
                savedUser.getProfile().getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStatus(),
                savedUser.getProfile().getPhone(),
                savedUser.getProfile().getAddress(),
                savedUser.getProfile().getDob());

    }


}
