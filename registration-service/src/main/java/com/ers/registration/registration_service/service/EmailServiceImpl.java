package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.AuthClient;
import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.dto.UserDto;
import com.ers.registration.registration_service.entity.Payment;
import com.ers.registration.registration_service.entity.Receipt;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.repository.PaymentRepository;
import com.ers.registration.registration_service.repository.ReceiptRepository;
import com.ers.registration.registration_service.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final JavaMailSender mailSender;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final EventClient eventClient;
    private final AuthClient authClient;

    @Override
    @Async
    public void sendRegistrationConfirmationEmail(Long registrationId) {
        log.info("Sending registration confirmation email asynchronously for registration ID: {}", registrationId);

        try {
            // Fetch registration
            Registration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new RuntimeException("Registration not found."));

            // Fetch user email
            UserDto user = authClient.getUserById(registration.getUserId());

            // Fetch payment and receipt
            Payment payment = paymentRepository.findByRegistrationId(registrationId)
                    .orElseThrow(() -> new RuntimeException("Payment not found."));

            Receipt receipt = receiptRepository.findByPaymentId(payment.getId())
                    .orElseThrow(() -> new RuntimeException("Receipt not found."));

            // Fetch event
            EventDto event = eventClient.getEventById(registration.getEventId());

            // Send email (no PDF generation)
            sendEmail(user.getEmail(), event, registration, payment, receipt);

            log.info("Registration confirmation email sent successfully to {} for registration ID: {}", user.getEmail(), registrationId);
        } catch (Exception e) {
            log.error("Failed to send registration confirmation email for registration ID: {}", registrationId, e);
        }
    }

    private void sendEmail(String toEmail, EventDto event, Registration registration, Payment payment, Receipt receipt) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false);

        helper.setTo(toEmail);
        helper.setFrom(fromEmail);
        helper.setSubject("Registration Confirmed - " + event.getTitle());

        String body = String.format("""
                Dear Participant,

                Your registration for the event "%s" has been confirmed successfully.

                Registration Details:
                - Registration ID: %d
                - Event: %s
                - Amount Paid: ₹%.2f
                - Transaction ID: %s
                - Receipt Number: %s

                Please save this email for your records.

                Thank you for registering!

                Best regards,
                Event Registration System
                """,
                event.getTitle(),
                registration.getId(),
                event.getTitle(),
                payment.getAmount(),
                payment.getTransactionId(),
                receipt.getReceiptNumber());

        helper.setText(body);

        mailSender.send(message);
    }
}