package com.ers.auth.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone No is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Address is required")
    
    private String address;

    @NotNull(message = "DOB is required")
    @Past(message = "DOB must be in the past")
    private LocalDate dob;
}
