# Event Registration System

A full-stack, containerized microservices architecture built with Spring Boot, Spring Cloud, Docker, and a modern React frontend. It is designed to smoothly handle large-scale event ticket bookings, payments, and event management.

---

## 📖 Project Explanation

The Event Registration System is designed to securely manage users, events, and ticket purchases in a highly scalable way. It uses the **Microservices Architecture Pattern** for the backend, coupled with a responsive **single-page application (SPA)** for the frontend.

### The Business Flow
1. **User Authentication:** A user registers and logs in via the `auth-service` (managed in the frontend via a centralized Context). They receive a secure JWT Access Token and a persistent Refresh Token.
2. **Browsing Events:** The user requests a list of available events from the `event-service`. 
3. **Registering for an Event:** The user selects an event and attempts to register via the `registration-service`. 
4. **Concurrency Control:** The `event-service` uses *Pessimistic Database Locking* to guarantee that if 100 people try to buy the last 5 seats at the exact same millisecond, exactly 5 people get them and no databases are corrupted.
5. **Payments:** The `registration-service` interfaces with **Razorpay** to process the payment securely.
6. **Background Cleanup:** If a user abandons their checkout cart, a background scheduler in the `registration-service` automatically cancels their pending ticket after 15 minutes and releases the locked seat back to the `event-service`.

### Frontend Application
The user interface is a modern single-page application built for high performance and excellent user experience:
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query) for state/data fetching, React Hook Form for unified form handling, and Framer Motion for animations.
- **Features:** 
  - **Shared Authentication Context:** Centralized session management and real-time reactivity.
  - **Registrant Dashboard:** Dedicated panel for users to view and manage their event registrations.
  - **Organizer Dashboard:** Fully featured panel for event creators to manage hosted events, create new events, and list attendees.
  - **Admin Dashboard:** Platform administration tools for global user and registration management.

### The Microservice Components (Backend)
- **API Gateway (Port 8080):** The single "front door" for all frontend internet traffic. It routes requests to the correct internal service and enforces JWT security rules.
- **Service Registry (Port 8761):** A Netflix Eureka server. Whenever a new service boots up, it essentially raises its hand and tells the registry its IP address so the API Gateway knows where to find it.
- **Auth Service (Port 8081):** Manages PostgreSQL user data, passwords, and tokens.
- **Event Service (Port 8082):** Manages event creation, capacity tracking, and seat reservations.
- **Registration Service (Port 8083):** Handles the complex logic of tying a User to an Event, executing Razorpay financial transactions, and communicating with the frontend.

---

## ⚙️ Initial Environment Setup

Before running the project on a new system, you must configure PostgreSQL, Razorpay, and environment variables.

### 1. PostgreSQL Setup
The microservices use a PostgreSQL database. You can run one locally via Docker or install it directly.
1. **Install PostgreSQL:** If playing locally, install PostgreSQL and start the server on port `5432`.
2. **Create Database & User:**
   ```sql
   CREATE DATABASE neondb;
   CREATE USER neondb_owner WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE neondb TO neondb_owner;
   ```
   *(Note: The services use Hibernate `ddl-auto=update`, so tables will be generated automatically upon the first boot).*

### 2. Razorpay & Webhook Setup
The `registration-service` requires Razorpay API keys to process payments.
1. **Create a Razorpay Account:** Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/) (Test Mode is fine).
2. **Generate API Keys:** Go to Settings -> API Keys -> Generate Key to get your `Key ID` and `Key Secret`.
3. **Set Up the Webhook:** 
   - Go to Settings -> Webhooks -> Add New Webhook.
   - Set the Webhook URL to your publicly accessible backend domain (or use a tool like Ngrok for local development: `https://<your-ngrok-url>/api/registrations/webhook/razorpay`).
   - Set a "Webhook Secret" (any secure string, e.g., `my_webhook_secret`).
   - Select the `payment.captured` event to trigger upon successful ticket purchase.

### 3. Create the `.env` Configuration File
At the root of the project, create a `.env` file populated with your specific credentials:
```env
DB_URL=jdbc:postgresql://localhost:5432/neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=your_secure_password
JWT_SECRET=a_very_long_secure_random_string_mostly_256_bits
GATEWAY_ADMIN_USERNAME=admin
GATEWAY_ADMIN_PASSWORD=admin
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
EUREKA_DEFAULT_ZONE=http://localhost:8761/eureka/
DOCKER_EUREKA_DEFAULT_ZONE=http://host.docker.internal:8761/eureka/
```

---

## 🏗️ Building and Running the Project

### Running the Backend via Docker (Recommended)
Docker Compose will automatically execute the Maven builds inside isolated containers. You do not even need Java installed on your computer to build the project this way!

1. **Navigate to the project root:**
   ```bash
   cd event-Registration-System
   ```
2. **Build and start the cluster:**
   ```bash
   docker-compose up -d --build
   ```
   *What this does:* Docker looks at every backend service's `Dockerfile`. It pulls down a temporary Maven image, downloads all `pom.xml` dependencies, builds the JARs, and runs them. Wait a few minutes for all services to boot up and register with Eureka on port 8761.

### Running the Frontend
The frontend runs independently as a Node.js single-page application communicating with the API Gateway dynamically.

1. **Navigate to the frontend directory:**
   ```bash
   cd event-Registration-System/frontend
   ```
2. **Install node dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
The frontend should now be running on `http://localhost:5173`.

### Building Manually via Maven (For Developers)
If you want to compile the backend code locally to run it in your IDE (like IntelliJ or VSCode):

1. **Ensure you have Java 17 and Maven installed.**
2. **Build a specific service:**
   ```bash
   cd auth_service
   mvn clean install
   ```
   *(This will compile the Java code, run the internal Unit Tests, and output the final binary to the `/target` folder).*

---

## 🚀 Running the Services Manually (Without Docker)

When running manually, you must start the **Service Registry** first, as the other services will crash if they cannot find it.

1. **Start Eureka:**
   ```bash
   cd service-registry
   mvn spring-boot:run
   ```
2. Wait for it to boot fully on `http://localhost:8761`.
3. Start the `api-gateway`, `auth-service`, `event-service`, and `registration-service` using `mvn spring-boot:run` in their respective folders. 
   
*(**Crucial Note:** When developing manually, ensure that `eureka.client.serviceUrl.defaultZone` in your `application.properties` files points to your local machine: `http://localhost:8761/eureka/` instead of the Docker internal network).*

---

## 🛑 Stopping the Docker Cluster
To gracefully shut down all containers and clean up the internal Docker networking:
```bash
docker-compose down
```
