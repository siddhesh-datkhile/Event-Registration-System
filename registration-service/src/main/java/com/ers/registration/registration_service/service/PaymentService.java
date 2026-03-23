package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.dto.PaymentRequest;
import com.ers.registration.registration_service.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPaymentOrder(PaymentRequest request);
    void handleWebhook(String payload, String signature);
}
