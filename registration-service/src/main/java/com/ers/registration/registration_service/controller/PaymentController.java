package com.ers.registration.registration_service.controller;

import com.ers.registration.registration_service.dto.PaymentRequest;
import com.ers.registration.registration_service.dto.PaymentResponse;
import com.ers.registration.registration_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createPaymentOrder(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPaymentOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
            
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
