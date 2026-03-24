package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.dto.PaymentRequest;
import com.ers.registration.registration_service.dto.PaymentResponse;
import com.ers.registration.registration_service.entity.Payment;
import com.ers.registration.registration_service.entity.PaymentStatus;
import com.ers.registration.registration_service.entity.Receipt;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;
import com.ers.registration.registration_service.repository.PaymentRepository;
import com.ers.registration.registration_service.repository.ReceiptRepository;
import com.ers.registration.registration_service.repository.RegistrationRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private RegistrationRepository registrationRepository;
    @Autowired
    private EventClient eventClient;
    @Autowired
    private ReceiptRepository receiptRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Override
    public PaymentResponse createPaymentOrder(PaymentRequest request) {
        log.info("Creating payment order for registration ID: {}", request.getRegistrationId());
        Registration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> {
                    log.error("Registration not found for ID: {}", request.getRegistrationId());
                    return new RuntimeException("Registration not found");
                });

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            log.warn("Cannot create payment for registration ID: {} - status is {}", request.getRegistrationId(), registration.getStatus());
            throw new RuntimeException("Registration is not in PENDING state.");
        }

        log.debug("Fetching event details for event ID: {}", registration.getEventId());
        EventDto event = eventClient.getEventById(registration.getEventId());
        Double entryFee = event.getEntryFee();

        if (entryFee == null || entryFee <= 0) {
            log.info("Event ID: {} is free. Confirming registration directly.", registration.getEventId());
            // Free event logic
            registration.setStatus(RegistrationStatus.CONFIRMED);
            registrationRepository.save(registration);

            Payment payment = Payment.builder()
                    .registration(registration)
                    .amount(0.0)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .transactionId("FREE_" + registration.getId())
                    .build();
            payment = paymentRepository.save(payment);

            Receipt receipt = Receipt.builder()
                    .payment(payment)
                    .receiptNumber("REC-FREE-" + registration.getId())
                    .generatedAt(java.time.LocalDateTime.now())
                    .build();
            receipt = receiptRepository.save(receipt);

            log.info("Free event registration confirmed for registration ID: {}", registration.getId());
            return PaymentResponse.builder()
                    .status("SUCCESS")
                    .message("Event is free. Registration confirmed.")
                    .amount(0.0)
                    .build();
        }

        try {
            log.info("Initiating Razorpay order for registration ID: {}, amount: {} paise", registration.getId(), (int)(entryFee * 100));
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise (Multiply by 100)
            int amountInPaise = (int) (entryFee * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + registration.getId());

            Order order = razorpay.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");
            log.info("Razorpay order created: {} for registration ID: {}", razorpayOrderId, registration.getId());

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
            log.error("Razorpay order creation failed for registration ID: {}", registration.getId(), e);
            throw new RuntimeException("Error while creating Razorpay Order", e);
        }
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        log.info("Received Razorpay webhook");
        try {
            boolean isSignatureValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isSignatureValid) {
                log.error("Invalid Razorpay webhook signature");
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
                log.warn("Webhook received for unknown Razorpay order ID: {}. Ignoring.", razorpayOrderId);
                return;
            }

            Payment payment = paymentOpt.get();

            if ("payment.captured".equals(event)) {
                log.info("Payment captured for order ID: {}, transaction ID: {}", razorpayOrderId, transactionId);
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(transactionId);

                Registration registration = payment.getRegistration();
                registration.setStatus(RegistrationStatus.CONFIRMED);
                registrationRepository.save(registration);
                payment = paymentRepository.save(payment);

                Receipt receipt = Receipt.builder()
                        .payment(payment)
                        .receiptNumber("REC-RZP-" + registration.getId() + "-" + System.currentTimeMillis() % 1000)
                        .generatedAt(java.time.LocalDateTime.now())
                        .build();
                receiptRepository.save(receipt);
                log.info("Registration confirmed and receipt generated for registration ID: {}", registration.getId());

            } else if ("payment.failed".equals(event)) {
                log.warn("Payment failed for Razorpay order ID: {}, transaction ID: {}", razorpayOrderId, transactionId);
                payment.setPaymentStatus(PaymentStatus.FAILED);
                payment.setTransactionId(transactionId);
                paymentRepository.save(payment);
            } else {
                log.debug("Unhandled webhook event type '{}' for order ID: {}", event, razorpayOrderId);
            }

        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            throw new RuntimeException("Webhook processing failed", e);
        }
    }
}
