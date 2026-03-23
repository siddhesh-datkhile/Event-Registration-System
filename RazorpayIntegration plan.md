# Goal Description
Integrate Razorpay payment gateway to process fees for event registrations. This entails generating a Razorpay Order when the user initiates payment, and capturing the final status using a Razorpay Webhook.

## User Review Required
> [!IMPORTANT]
> **Razorpay Credentials**: The application will require `razorpay.key.id` and `razorpay.key.secret` in [application.properties](file:///home/josh/IdeaProjects/event-Registration-System/api-gateway/src/main/resources/application.properties). 
> **Webhook Secret**: We will also need a `razorpay.webhook.secret` to securely verify the signature of incoming webhooks.
> **Public URL**: In order for Razorpay to send webhook events to your local machine, you will need to tunnel your local port (e.g. using `ngrok`).

## Proposed Changes

### Configuration
#### [MODIFY] [pom.xml](file:///home/josh/IdeaProjects/event-Registration-System/api-gateway/pom.xml) (Registration Service)
- Add the `razorpay-java` SDK dependency.

#### [MODIFY] [application.properties](file:///home/josh/IdeaProjects/event-Registration-System/api-gateway/src/main/resources/application.properties)
- Add placeholders for `razorpay.key.id`, `razorpay.key.secret`, and `razorpay.webhook.secret`.

### Entity & DTOs
#### [MODIFY] [Payment.java](file:///home/josh/IdeaProjects/event-Registration-System/registration-service/src/main/java/com/ers/registration/registration_service/entity/Payment.java)
- Ensure `transactionId` is used to store Razorpay's `razorpay_payment_id`.
- Add a new field `razorpayOrderId` to track the order associated with the user payload.

#### [NEW] `PaymentRequest.java` and `PaymentResponse.java`
- To receive the registration ID and return the `razorpayOrderId`, `amount`, and `currency` needed by the frontend.

### Service Layer
#### [NEW] `PaymentService.java` & `PaymentServiceImpl.java`
- `createPaymentOrder(Registration registration)`: Uses Razorpay `RazorpayClient` to calculate the amount (from Event) and create an [Order](file:///home/josh/IdeaProjects/event-Registration-System/api-gateway/src/main/java/com/ers/gateway/api_gateway/filter/JwtAuthenticationFilter.java#100-104). Returns the Order details to the frontend.
- `handleWebhook(String payload, String signature)`: Verifies the HMAC SHA256 signature using the `webhook.secret`. 
  - If event is `payment.captured`: Find the [Payment](file:///home/josh/IdeaProjects/event-Registration-System/registration-service/src/main/java/com/ers/registration/registration_service/entity/Payment.java#10-48) by `razorpayOrderId`, update `transactionId`, set `PaymentStatus` to `SUCCESS`, and `RegistrationStatus` to `CONFIRMED`.
  - If event is `payment.failed`: Update `PaymentStatus` to `FAILED`.

### Controller Layer
#### [NEW] `PaymentController.java`
- `POST /api/payments/create-order`
- `POST /api/payments/webhook`

## Verification Plan
1. Send a POST request to create an order for a valid Registration. Ensure a Razorpay `order_id` is successfully created.
2. Manually construct an HMAC signed JSON payload and send to the webhook endpoint to simulate a completed payment, verifying the [Payment](file:///home/josh/IdeaProjects/event-Registration-System/registration-service/src/main/java/com/ers/registration/registration_service/entity/Payment.java#10-48) and [Registration](file:///home/josh/IdeaProjects/event-Registration-System/registration-service/src/main/java/com/ers/registration/registration_service/entity/Registration.java#10-42) entities update their statuses appropriately.
