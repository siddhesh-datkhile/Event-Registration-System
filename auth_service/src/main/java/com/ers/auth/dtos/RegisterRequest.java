package com.ers.auth.dtos;

import com.ers.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Phone No is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "DOB is required")
    private LocalDate dob;
    
    @NotNull(message = "Role is required")
    private Role role;
}
