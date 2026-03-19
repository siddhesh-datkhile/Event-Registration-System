package com.ers.auth.exception;

import com.ers.auth.dtos.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //Authentication Exception
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthException(AuthenticationException ex) {
        return ResponseEntity.status(401).body(
                new ApiResponse<>("Invalid credentials", null, 401)
        );
    }

    // General Exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(500).body(
                new ApiResponse<>(ex.getMessage(), null, 500)
        );
    }
}