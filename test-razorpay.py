import requests
import hmac
import hashlib
import json
import time

# Configurations
EVENT_URL = "http://localhost:8082/api/events"
REG_SERVICE_URL = "http://localhost:8083/api"
WEBHOOK_SECRET = "siddhesh"

def test_flow():
    print("🚀 Starting Razorpay Integration End-to-End Test")
    
    # 1. Create Event
    print("\n[1] Creating a new Event with an entry fee of ₹500...")
    event_payload = {
        "title": f"Razorpay Test Event {int(time.time())}",
        "description": "Integration test",
        "eventDate": "2026-10-10T10:00:00",
        "entryFee": 500.0,
        "capacity": 100,
        "organizerId": 1
    }
    
    resp = requests.post(EVENT_URL, json=event_payload)
    if resp.status_code != 201:
        print("❌ Failed to create event:", resp.text)
        return
    
    event_id = resp.json().get("id")
    print(f"✅ Event Created successfully! Event ID: {event_id}")
    
    # 2. Register for Event
    print("\n[2] Registering User (ID: 99) for the Event...")
    reg_payload = {"userId": 99, "eventId": event_id}
    resp = requests.post(f"{REG_SERVICE_URL}/registrations/register", json=reg_payload)
    if resp.status_code != 201:
        print("❌ Failed to register:", resp.text)
        return
        
    registration_id = resp.json().get("id")
    print(f"✅ Registration created successfully (Status: PENDING)! Registration ID: {registration_id}")
    
    # 3. Create Payment Order
    print("\n[3] Calling Razorpay /create-order API...")
    order_payload = {"registrationId": registration_id}
    resp = requests.post(f"{REG_SERVICE_URL}/payments/create-order", json=order_payload)
    if resp.status_code != 200:
        print("❌ Failed to create Razorpay Order:", resp.text)
        return
        
    order_data = resp.json()
    rzp_order_id = order_data.get("razorpayOrderId")
    print(f"✅ Razorpay Order Created! Order ID: {rzp_order_id} | Amount: ₹{order_data.get('amount')}")
    
    # 4. Simulate Razorpay Webhook
    print("\n[4] Simulating Razorpay incoming Webhook (payment.captured)...")
    webhook_payload_dict = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_{int(time.time())}",
                    "order_id": rzp_order_id,
                    "status": "captured"
                }
            }
        }
    }
    
    webhook_payload_str = json.dumps(webhook_payload_dict, separators=(',', ':'))
    
    # Calculate HMAC SHA256 Signature
    signature = hmac.new(
        key=WEBHOOK_SECRET.encode('utf-8'),
        msg=webhook_payload_str.encode('utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    print(f"   Generated Signature: {signature}")
    
    # Send Webhook
    headers = {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": signature
    }
    
    resp = requests.post(f"{REG_SERVICE_URL}/payments/webhook", data=webhook_payload_str, headers=headers)
    if resp.status_code == 200:
        print("✅ Webhook validated successfully! Registration is now CONFIRMED.")
    else:
        print("❌ Webhook failed:", resp.text)
        
    print("\n🎉 End-to-End Test Completed!")

if __name__ == "__main__":
    test_flow()
