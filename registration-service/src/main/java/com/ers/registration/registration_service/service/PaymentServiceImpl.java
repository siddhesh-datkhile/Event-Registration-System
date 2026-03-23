package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.dto.PaymentRequest;
import com.ers.registration.registration_service.dto.PaymentResponse;
import com.ers.registration.registration_service.entity.Payment;
import com.ers.registration.registration_service.entity.PaymentStatus;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;
import com.ers.registration.registration_service.repository.PaymentRepository;
import com.ers.registration.registration_service.repository.RegistrationRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private RegistrationRepository registrationRepository;
    @Autowired
    private EventClient eventClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Override
    public PaymentResponse createPaymentOrder(PaymentRequest request) {
        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("Registration is not in PENDING state.");
        }

        EventDto event = eventClient.getEventById(registration.getEventId());
        Double entryFee = event.getEntryFee();

        if (entryFee == null || entryFee <= 0) {
            // Free event logic
            registration.setStatus(RegistrationStatus.CONFIRMED);
            registrationRepository.save(registration);

            return PaymentResponse.builder()
                    .status("SUCCESS")
                    .message("Event is free. Registration confirmed.")
                    .amount(0.0)
                    .build();
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise (Multiply by 100)
            int amountInPaise = (int) (entryFee * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + registration.getId());

            Order order = razorpay.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            Payment payment = Payment.builder()
                    .registration(registration)
                    .amount(entryFee)
                    .paymentStatus(PaymentStatus.PENDING)
                    .razorpayOrderId(razorpayOrderId)
                    .build();

            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(entryFee)
                    .currency("INR")
                    .status("PENDING")
                    .message("Order created successfully")
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error while creating Razorpay Order", e);
        }
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        try {
            boolean isSignatureValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isSignatureValid) {
                throw new RuntimeException("Invalid webhook signature");
            }

            JSONObject jsonPayload = new JSONObject(payload);
            String event = jsonPayload.getString("event");

            JSONObject paymentEntity = jsonPayload.getJSONObject("payload").getJSONObject("payment")
                    .getJSONObject("entity");
            String razorpayOrderId = paymentEntity.getString("order_id");
            String transactionId = paymentEntity.getString("id");

            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isEmpty()) {
                // If it's a completely unknown payment just ignore or log
                return;
            }

            Payment payment = paymentOpt.get();

            if ("payment.captured".equals(event)) {
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(transactionId);

                Registration registration = payment.getRegistration();
                registration.setStatus(RegistrationStatus.CONFIRMED);
                registrationRepository.save(registration);
                paymentRepository.save(payment);

            } else if ("payment.failed".equals(event)) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                payment.setTransactionId(transactionId);
                paymentRepository.save(payment);
            }

        } catch (Exception e) {
            throw new RuntimeException("Webhook processing failed", e);
        }
    }
}
