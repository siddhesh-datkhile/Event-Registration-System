package com.ers.registration.registration_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String status;
    private String message;

}
