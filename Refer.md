Great question — this is exactly where **real microservices architecture starts 🔥**

Short answer:

> 👉 **Auth Service handles authentication (JWT)**
> 👉 **Other services only validate the JWT (no login logic there)**

---

# 🧠 Big Picture Architecture

```
[ Client ]
     ↓
[ Auth Service ] → generates JWT
     ↓
[ Other Services ] → validate JWT
```

---

## 🔐 Step-by-Step Flow

### 1️⃣ User logs in (Auth Service)

```text
POST /auth/login
```

Auth service:

* Verifies username/password
* Generates **JWT token**

Example token:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2️⃣ Client sends token to other services

```http
GET /events
Authorization: Bearer <JWT_TOKEN>
```

---

### 3️⃣ Other services validate token

👉 They DO NOT call Auth Service again
👉 They just:

* Decode JWT
* Verify signature
* Extract user info

---

## 🔧 How to implement this

---

## 🔹 In Auth Service

👉 Responsibilities:

* Login
* Register
* Generate JWT

Use:

* `jjwt` or `spring security jwt`

---

## 🔹 In Other Services (VERY IMPORTANT)

👉 Add:

* Spring Security
* JWT filter

---

### Example Flow inside Event Service

1. Request comes:

```http
Authorization: Bearer xyz
```

2. JWT Filter runs:

* Extract token
* Validate
* Set user in security context

3. Controller executes

---

## 🧩 Code Concept (Other Services)

### JWT Filter (simplified)

```java
String token = request.getHeader("Authorization");

if (token != null && token.startsWith("Bearer ")) {
    token = token.substring(7);

    String username = jwtUtil.extractUsername(token);

    if (jwtUtil.validateToken(token)) {
        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(username, null, List.of());

        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
```

---

## 🔑 Important Concept

| Service             | Responsibility      |
| ------------------- | ------------------- |
| Auth Service        | Generate JWT        |
| Other Services      | Validate JWT        |
| API Gateway (later) | Can centralize auth |

---

## 🚀 Best Practice (Industry)

👉 Option 1 (Simple):

* Each service validates JWT ✅ (recommended for you)

👉 Option 2 (Advanced):

* API Gateway validates JWT
* Services trust gateway

---

## ⚠️ Common Mistakes

❌ Calling Auth Service for every request
❌ Storing sessions
❌ Sharing DB between services

---

## 🎯 For YOUR project

You’re building:

> Event Registration System

### Suggested setup:

* **Auth Service**

    * `/login`
    * `/register`
    * JWT generation

* **Event Service**

    * Validate JWT
    * Allow only logged-in users

* **Registration Service**

    * Validate JWT
    * Prevent duplicate registration

---

## 🔥 Pro Tip

👉 Use **same secret key across all services**

```properties
jwt.secret=mysecretkey
```

So all services can validate token

---

## 👍 Final Answer

👉 Auth Service = **issue JWT**
👉 Other services = **verify JWT locally**
👉 No need to call Auth Service again

---

If you want next:
I can give you:
✅ Complete JWT implementation (Auth + Filter + Config)
✅ Ready-to-use code for all services

Just say 👍














#Event Service MVC





Perfect — now we’ll build your **Event Service end-to-end (clean, production-style)** 🚀
You’ve finalized design, so now we implement **proper layered architecture**.

---

# 🧱 Step 1: Final Structure

```text
event-service
│
├── controller
├── service
├── repository
├── entity
├── dto
├── mapper (optional)
├── exception
└── config
```

---

# 🧩 Step 2: Entities (FINAL)

## ✅ Event

```java
@Entity
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    private LocalDateTime eventDate;

    private Double entryFee;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private Long organizerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

---

## ✅ Venue

```java
@Entity
@Data
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String city;
}
```

---

## ✅ Enum

```java
public enum EventStatus {
    OPEN,
    CLOSED
}
```

---

# 🗄️ Step 3: Repository

```java
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByVenueCityContaining(String city);
}
```

```java
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
}
```

---

# 📥 Step 4: DTOs

## EventRequest

```java
@Data
public class EventRequest {
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Double entryFee;
    private Integer capacity;
    private Long venueId;
}
```

---

## EventResponse

```java
@Data
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Double entryFee;
    private Integer capacity;
    private EventStatus status;
    private String venueName;
    private String city;
}
```

---

# 🧠 Step 5: Service Layer

```java
@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    // ✅ CREATE EVENT
    public EventResponse createEvent(EventRequest request, Long userId) {

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setEntryFee(request.getEntryFee());
        event.setCapacity(request.getCapacity());
        event.setOrganizerId(userId);
        event.setVenue(venue);
        event.setStatus(EventStatus.OPEN);

        Event saved = eventRepository.save(event);

        return mapToResponse(saved);
    }

    // ✅ GET EVENTS (FILTER)
    public List<EventResponse> getEvents(String city, EventStatus status) {

        List<Event> events;

        if (city != null) {
            events = eventRepository.findByVenueCityContaining(city);
        } else if (status != null) {
            events = eventRepository.findByStatus(status);
        } else {
            events = eventRepository.findAll();
        }

        return events.stream().map(this::mapToResponse).toList();
    }

    // ✅ UPDATE EVENT
    public EventResponse updateEvent(Long id, EventRequest request, Long userId) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setEntryFee(request.getEntryFee());
        event.setCapacity(request.getCapacity());

        return mapToResponse(eventRepository.save(event));
    }

    // ✅ DELETE EVENT
    public void deleteEvent(Long id, Long userId) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        eventRepository.delete(event);
    }

    // ✅ UPDATE STATUS
    public EventResponse updateStatus(Long id, EventStatus status, Long userId) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizerId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        event.setStatus(status);

        return mapToResponse(eventRepository.save(event));
    }

    // 🔁 MAPPER
    private EventResponse mapToResponse(Event event) {
        EventResponse res = new EventResponse();
        res.setId(event.getId());
        res.setTitle(event.getTitle());
        res.setDescription(event.getDescription());
        res.setEventDate(event.getEventDate());
        res.setEntryFee(event.getEntryFee());
        res.setCapacity(event.getCapacity());
        res.setStatus(event.getStatus());
        res.setVenueName(event.getVenue().getName());
        res.setCity(event.getVenue().getCity());
        return res;
    }
}
```

---

# 🌐 Step 6: Controller

```java
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    // CREATE
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestBody EventRequest request,
            @RequestHeader("userId") Long userId) {

        return ResponseEntity.ok(eventService.createEvent(request, userId));
    }

    // LIST + FILTER
    @GetMapping
    public List<EventResponse> getEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) EventStatus status) {

        return eventService.getEvents(city, status);
    }

    // UPDATE
    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @PathVariable Long id,
            @RequestBody EventRequest request,
            @RequestHeader("userId") Long userId) {

        return eventService.updateEvent(id, request, userId);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteEvent(
            @PathVariable Long id,
            @RequestHeader("userId") Long userId) {

        eventService.deleteEvent(id, userId);
        return "Deleted successfully";
    }

    // STATUS
    @PatchMapping("/{id}/status")
    public EventResponse updateStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status,
            @RequestHeader("userId") Long userId) {

        return eventService.updateStatus(id, status, userId);
    }
}
```

---

# ⚙️ Step 7: application.yml

```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/event_db
    username: root
    password: root

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

---

# ✅ APIs READY

| Method | Endpoint            | Description |
| ------ | ------------------- | ----------- |
| POST   | /events             | Create      |
| GET    | /events             | List/filter |
| PUT    | /events/{id}        | Update      |
| DELETE | /events/{id}        | Delete      |
| PATCH  | /events/{id}/status | Open/Close  |

---

# 🚀 Next Step (VERY IMPORTANT)

Now your **Event Service is COMPLETE (Core)** ✅

👉 Next you should build:

### 🔥 1. Registration Service (ticket buying)

### 🔐 2. JWT Security (no fake userId)

### 🌐 3. API Gateway

---

Just tell:
👉 *build registration service*
or
👉 *secure event service* 😄
