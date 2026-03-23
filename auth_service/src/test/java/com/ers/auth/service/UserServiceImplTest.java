package com.ers.auth.service;

import com.ers.auth.dtos.RegisterRequest;
import com.ers.auth.dtos.UpdateProfileRequest;
import com.ers.auth.dtos.UserProfileResponse;
import com.ers.auth.entity.Role;
import com.ers.auth.entity.User;
import com.ers.auth.entity.UserProfile;
import com.ers.auth.entity.UserStatus;
import com.ers.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("John Doe");
        registerRequest.setEmail("johndoe@example.com");
        registerRequest.setPassword("securePassword");
        registerRequest.setRole(Role.REGISTRANT);
        registerRequest.setPhone("1234567890");
        registerRequest.setAddress("123 Test Street");
        registerRequest.setDob(LocalDate.of(1990, 1, 1));
    }

    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmail("johndoe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("securePassword")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(1L)
                .email("johndoe@example.com")
                .password("encodedPassword")
                .role(Role.REGISTRANT)
                .status(UserStatus.ACTIVE)
                .build();
                
        UserProfile profile = new UserProfile();
        profile.setName("John Doe");
        profile.setPhone("1234567890");
        profile.setAddress("123 Test Street");
        profile.setDob(LocalDate.of(1990, 1, 1));
        profile.setUser(savedUser);
        savedUser.setProfile(profile);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserProfileResponse response = userService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getName());
        assertEquals("johndoe@example.com", response.getEmail());
        assertEquals(Role.REGISTRANT, response.getRole());
        assertEquals("1234567890", response.getPhone());
        
        verify(userRepository).existsByEmail("johndoe@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_ExistingUser_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail("johndoe@example.com")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(registerRequest));
        assertEquals("User already exists", exception.getMessage());
        
        verify(userRepository).existsByEmail("johndoe@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateProfile_Success() {
        // Arrange
        String email = "johndoe@example.com";
        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setName("John Updated");
        updateRequest.setPhone("0987654321");
        
        User existingUser = User.builder()
                .id(1L)
                .email(email)
                .role(Role.REGISTRANT)
                .status(UserStatus.ACTIVE)
                .build();
                
        UserProfile profile = new UserProfile();
        profile.setName("John Doe");
        profile.setPhone("1234567890");
        profile.setAddress("123 Test Street");
        profile.setUser(existingUser);
        existingUser.setProfile(profile);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        UserProfileResponse response = userService.updateProfile(email, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals("John Updated", response.getName());
        assertEquals("0987654321", response.getPhone());
        assertEquals("123 Test Street", response.getAddress()); // Kept original
        assertEquals("johndoe@example.com", response.getEmail()); // Kept original
        
        verify(userRepository).findByEmail(email);
        verify(userRepository).save(existingUser);
    }
}
