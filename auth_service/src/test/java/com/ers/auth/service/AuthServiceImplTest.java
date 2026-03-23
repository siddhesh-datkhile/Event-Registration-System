package com.ers.auth.service;

import com.ers.auth.dtos.LoginRequest;
import com.ers.auth.dtos.LoginResponse;
import com.ers.auth.entity.User;
import com.ers.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new LoginRequest();
        validRequest.setEmail("test@example.com");
        validRequest.setPassword("password123");
    }

    @Test
    void testLogin_Success() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
                
        when(jwtUtil.createToken(authentication)).thenReturn("mocked.jwt.token");
        when(authentication.getName()).thenReturn("test@example.com");
        
        User mockUser = new User();
        when(userService.getUserByEmail("test@example.com")).thenReturn(mockUser);

        // Act
        LoginResponse response = authService.login(validRequest);

        // Assert
        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil).createToken(authentication);
        verify(userService).getUserByEmail("test@example.com");
    }

    @Test
    void testLogin_Failure_ThrowsBadCredentialsException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authService.login(validRequest));
        
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verifyNoInteractions(jwtUtil);
        verifyNoInteractions(userService);
    }
}
