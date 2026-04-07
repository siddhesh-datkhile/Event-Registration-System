package com.ers.registration.registration_service.service;

import com.ers.registration.registration_service.client.AuthClient;
import com.ers.registration.registration_service.client.EventClient;
import com.ers.registration.registration_service.dto.EventDto;
import com.ers.registration.registration_service.entity.Payment;
import com.ers.registration.registration_service.entity.PaymentStatus;
import com.ers.registration.registration_service.entity.Receipt;
import com.ers.registration.registration_service.entity.Registration;
import com.ers.registration.registration_service.entity.RegistrationStatus;
import com.ers.registration.registration_service.repository.PaymentRepository;
import com.ers.registration.registration_service.repository.ReceiptRepository;
import com.ers.registration.registration_service.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptServiceImpl implements ReceiptService {

    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final EventClient eventClient;
    private final AuthClient authClient;

    @Override
    public String generateReceiptHtml(Long registrationId) {
        log.info("Generating HTML receipt for registration ID: {}", registrationId);
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> {
                    log.error("Receipt generation failed: Registration not found with ID: {}", registrationId);
                    return new RuntimeException("Registration not found.");
                });

        if (registration.getStatus() != RegistrationStatus.CONFIRMED) {
            log.warn("Receipt generation denied for registration ID: {} - status is {}", registrationId, registration.getStatus());
            throw new RuntimeException("Cannot generate receipt. Registration is not confirmed.");
        }

        Payment payment = paymentRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> {
                    log.error("No payment record found for registration ID: {}", registrationId);
                    return new RuntimeException("No payment record found for this registration.");
                });

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            log.warn("Receipt generation denied for registration ID: {} - payment status is {}", registrationId, payment.getPaymentStatus());
            throw new RuntimeException("Cannot generate receipt. Payment is not successful.");
        }

        Receipt receipt = receiptRepository.findByPaymentId(payment.getId())
                .orElseThrow(() -> {
                    log.error("Receipt record missing for payment ID: {}", payment.getId());
                    return new RuntimeException("Receipt record not found. Please try again later.");
                });

        log.debug("Fetching event details for event ID: {}", registration.getEventId());
        EventDto event = eventClient.getEventById(registration.getEventId());

        log.info("Building HTML receipt for registration ID: {}, receipt number: {}", registrationId, receipt.getReceiptNumber());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        String html = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Receipt | %s</title>
                    <style>
                        body {
                            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
                            color: #333;
                            background-color: #f4f6f8;
                            margin: 0;
                            padding: 40px;
                            display: flex;
                            justify-content: center;
                        }
                        .receipt-container {
                            background: #fff;
                            width: 100%%;
                            max-width: 600px;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                            position: relative;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #eee;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            margin: 0;
                            color: #2c3e50;
                            font-size: 28px;
                        }
                        .header p {
                            margin: 5px 0 0;
                            color: #7f8c8d;
                        }
                        .status-badge {
                            background: #d4edda;
                            color: #155724;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-weight: 600;
                            font-size: 14px;
                            display: inline-block;
                            margin-top: 10px;
                        }
                        .details-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        .detail-group label {
                            display: block;
                            font-size: 12px;
                            color: #7f8c8d;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 4px;
                        }
                        .detail-group span {
                            font-size: 16px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        .amount-box {
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .amount-box .amount {
                            font-size: 32px;
                            font-weight: 700;
                            color: #2c3e50;
                            margin: 10px 0 0;
                        }
                        .footer {
                            text-align: center;
                            color: #95a5a6;
                            font-size: 14px;
                            border-top: 1px solid #eee;
                            padding-top: 20px;
                        }
                        .print-btn {
                            display: block;
                            width: 100%%;
                            background: #3498db;
                            color: white;
                            border: none;
                            padding: 15px;
                            font-size: 16px;
                            font-weight: 600;
                            border-radius: 8px;
                            cursor: pointer;
                            margin-top: 20px;
                            transition: background 0.2s;
                        }
                        .print-btn:hover { background: #2980b9; }

                        @media print {
                            body { background: white; padding: 0; }
                            .receipt-container { box-shadow: none; max-width: 100%%; }
                            .print-btn { display: none; }
                        }
                    </style>
                </head>
                <body>

                <div class="receipt-container">
                    <div class="header">
                        <h1>Payment Receipt</h1>
                        <p>Official Record of Registration</p>
                        <div class="status-badge">PAID IN FULL</div>
                    </div>

                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Receipt Number</label>
                            <span>%s</span>
                        </div>
                        <div class="detail-group">
                            <label>Transaction Date</label>
                            <span>%s</span>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Event Name</label>
                            <span>%s</span>
                        </div>
                        <div class="detail-group">
                            <label>Participant ID</label>
                            <span>%d</span>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Registration ID</label>
                            <span>%d</span>
                        </div>
                        <div class="detail-group">
                            <label>Razorpay/Txn ID</label>
                            <span>%s</span>
                        </div>
                    </div>

                    <div class="amount-box">
                        <label style="font-size: 14px; color: #7f8c8d;">Amount Paid</label>
                        <div class="amount">₹%.2f</div>
                    </div>

                    <div class="footer">
                        <p>Thank you for registering! Please keep this receipt for your records.</p>
                    </div>

                    <button class="print-btn" onclick="window.print()">Print Receipt</button>
                </div>

                </body>
                </html>
                """;

        return String.format(
                html,
                event.getTitle(),
                receipt.getReceiptNumber(),
                receipt.getGeneratedAt().format(formatter),
                event.getTitle(),
                registration.getUserId(),
                registration.getId(),
                payment.getTransactionId() != null ? payment.getTransactionId() : "N/A",
                payment.getAmount() != null ? payment.getAmount() : 0.0);
    }

    @Override
    public byte[] generateReceiptPdf(Long registrationId) {
        log.info("Generating PDF receipt for registration ID: {}", registrationId);
        
        // Reuse the same validation and data fetching logic as HTML
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> {
                    log.error("PDF receipt generation failed: Registration not found with ID: {}", registrationId);
                    throw new RuntimeException("Registration not found.");
                });

        if (registration.getStatus() != RegistrationStatus.CONFIRMED) {
            log.warn("PDF receipt generation denied for registration ID: {} - status is {}", registrationId, registration.getStatus());
            throw new RuntimeException("Cannot generate receipt. Registration is not confirmed.");
        }

        Payment payment = paymentRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> {
                    log.error("No payment record found for registration ID: {}", registrationId);
                    throw new RuntimeException("No payment record found for this registration.");
                });

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            log.warn("PDF receipt generation denied for registration ID: {} - payment status is {}", registrationId, payment.getPaymentStatus());
            throw new RuntimeException("Cannot generate receipt. Payment is not successful.");
        }

        Receipt receipt = receiptRepository.findByPaymentId(payment.getId())
                .orElseThrow(() -> {
                    log.error("Receipt record missing for payment ID: {}", payment.getId());
                    throw new RuntimeException("Receipt record not found. Please try again later.");
                });

        EventDto event = eventClient.getEventById(registration.getEventId());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Generate PDF
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD), 18);
                contentStream.newLineAtOffset(100, 750);
                contentStream.showText("Payment Receipt");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 12);
                contentStream.newLineAtOffset(100, 720);
                contentStream.showText("Official Record of Registration");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD), 12);
                contentStream.newLineAtOffset(100, 690);
                contentStream.showText("PAID IN FULL");
                contentStream.endText();

                // Details
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 650);
                contentStream.showText("Receipt Number: " + receipt.getReceiptNumber());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 630);
                contentStream.showText("Transaction Date: " + receipt.getGeneratedAt().format(formatter));
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 610);
                contentStream.showText("Event Name: " + event.getTitle());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 590);
                contentStream.showText("Participant ID: " + registration.getUserId());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 570);
                contentStream.showText("Registration ID: " + registration.getId());
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 550);
                contentStream.showText("Razorpay/Txn ID: " + (payment.getTransactionId() != null ? payment.getTransactionId() : "N/A"));
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD), 14);
                contentStream.newLineAtOffset(100, 520);
                contentStream.showText("Amount Paid: ₹" + String.format("%.2f", payment.getAmount() != null ? payment.getAmount() : 0.0));
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN), 10);
                contentStream.newLineAtOffset(100, 480);
                contentStream.showText("Thank you for registering! Please keep this receipt for your records.");
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            log.info("PDF receipt generated successfully for registration ID: {}", registrationId);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Error generating PDF receipt for registration ID: {}", registrationId, e);
            throw new RuntimeException("Failed to generate PDF receipt.", e);
        }
    }
}
