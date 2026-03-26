# Event Registration System

A robust, containerized microservices architecture built with Spring Boot, Spring Cloud, and Docker, designed to smoothly handle large-scale event ticket bookings and payments.

---

## 📖 Project Explanation

The Event Registration System is designed to securely manage users, events, and ticket purchases in a highly scalable way. It uses the **Microservices Architecture Pattern**, where different business capabilities are split into separate, specialized applications that talk to each other.

### The Business Flow
1. **User Authentication:** A user registers and logs in via the `auth-service`. They receive a secure JWT Access Token and a persistent Refresh Token.
2. **Browsing Events:** The user requests a list of available events from the `event-service`. 
3. **Registering for an Event:** The user selects an event and attempts to register via the `registration-service`. 
4. **Concurrency Control:** The `event-service` uses *Pessimistic Database Locking* to guarantee that if 100 people try to buy the last 5 seats at the exact same millisecond, exactly 5 people get them and no databases are corrupted.
5. **Payments:** The `registration-service` interfaces with **Razorpay** to process the payment.
6. **Background Cleanup:** If a user abandons their checkout cart, a background scheduler in the `registration-service` automatically cancels their pending ticket after 15 minutes and releases the locked seat back to the `event-service`.

### The Microservice Components
- **API Gateway (Port 8080):** The single "front door" for all frontend internet traffic. It routes requests to the correct internal service and enforces JWT security rules.
- **Service Registry (Port 8761):** A Netflix Eureka server. Whenever a new service boots up, it essentially raises its hand and tells the registry its IP address so the API Gateway knows where to find it.
- **Auth Service (Port 8081):** Manages PostgreSQL user data, passwords, and tokens.
- **Event Service (Port 8082):** Manages event creation, capacity tracking, and seat reservations.
- **Registration Service (Port 8083):** Handles the complex logic of tying a User to an Event, executing Razorpay financial transactions, and generating HTML receipts.

---

## 🏗️ Building the Project

This project compiles Java source code into executable `.jar` files using Maven, and then packages those `.jar` files into isolated Linux environments using Docker.

### Building via Docker (Recommended)
Docker Compose will automatically execute the Maven builds inside isolated containers. You do not even need Java installed on your computer to build the project this way!

1. **Navigate to the project root:**
   ```bash
   cd event-Registration-System
   ```
2. **Build and start the cluster:**
   ```bash
   docker-compose up -d --build
   ```
   *What this does:* Docker looks at every service's `Dockerfile`. It pulls down a temporary Maven image, downloads all `pom.xml` dependencies, runs `mvn clean package -DskipTests` to build the jar, and then injects that jar into a super lightweight `eclipse-temurin:17-jre` Java runtime container.

### Building Manually via Maven (For Developers)
If you want to compile the code locally to run it in your IDE (like IntelliJ or VSCode):

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
