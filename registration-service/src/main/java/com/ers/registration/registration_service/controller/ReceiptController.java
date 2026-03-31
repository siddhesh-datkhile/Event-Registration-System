package com.ers.registration.registration_service.controller;

import com.ers.registration.registration_service.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping(value = "/{registrationId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getReceiptHtml(@PathVariable Long registrationId) {
        String html = receiptService.generateReceiptHtml(registrationId);
        return ResponseEntity.ok(html);
    }
}
