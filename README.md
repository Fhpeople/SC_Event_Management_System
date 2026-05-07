# Event Ticketing and Booking System

## Project Overview
This project is an Event Ticketing & Booking System that allows event organizers to create and manage events, customers to book and purchase tickets, and administrators to manage refunds. The system is designed using Clean Architecture and Domain-Driven Design (DDD) to ensure modifiability, scalability, and clear separation of concerns.

Tech stack used in this project:
- Language: TypeScript
- Framework: NestJS
- Database: PostgreSQL

## Architecture Overview
The system follows Clean Architecture, which separates responsibilities into the following four layers.
- Domain layer: Contains core business entities, value objects, and business rules.
- Application layer: Handles use cases through application services.
- Infrastructure layer: Responsible for database and external service implementations.
- Presentation layer: Handles interaction with users through REST API controllers.

## Project Structure
```
src/
 ├── domain/
 │   ├── event/
 │   │   ├── event.entity.ts
 │   │   └── ticket-category.entity.ts
 │   ├── booking/
 │   │   ├── booking.entity.ts
 │   │   └── ticket.entity.ts
 │   ├── refund/
 │   │   └── refund.entity.ts
 │   └── shared/
 │       └── money.value-object.ts
 │
 ├── application/
 │   └── services/
 │       ├── event.service.ts
 │       ├── booking.service.ts
 │       └── refund.service.ts
 │
 ├── infrastructure/
 │   └── database/
 │       └── (empty / placeholder)
 │
 ├── presentation/
 │   └── controllers/
 │       ├── event.controller.ts
 │       ├── booking.controller.ts
 │       └── refund.controller.ts
 │
 └── main.ts
```

This project structure represents the initial implementation of Clean Architecture for Week 8.
At this stage, the project mainly focuses on defining the architectural layers, core entities, and initial business rules.
More advanced Domain-Driven Design (DDD) patterns such as aggregates, domain events, repositories, commands, and queries will be gradually introduced and refined in the following development stages
In future iterations, application services will also be refactored into commands and queries following the CQRS pattern.

## Initial Business Rules

### Event
- Event end date must be after start date
- Event capacity must be greater than zero
- Event must have at least one ticket category before being published
- Event with status Cancelled cannot be published

### Ticket Category
- Ticket price cannot be negative
- Ticket quota must be greater than zero
- Total ticket quota must not exceed event capacity

### Booking
- Booking quantity must be greater than zero
- A customer can't have more than one active booking for the same event
- Booking must have a payment deadline

### Payment
- Booking can only be paid if status is PendingPayment
- Payment must match total booking price
- Booking can't be paid after payment deadline

## Initial Domain Model

### Entities
- Event: represents an event created by an organizer
- TicketCategory: represents ticket types
- Booking: represents a ticket reservation
- Ticket: represents a confirmed ticket after payment
- Refund: represents a refund request process

### Value Object
- Money: represents price with amount and currency

### Relationships
- One Event has many Ticket Categories
- One Event has many Bookings
- One Booking generates multiple Tickets
- One Booking may have one Refund

The domain model is designed based on the main business flow:
Event creation → ticket setup → booking → payment → ticket issuance → refund (if needed).

## Ubiquitous Language Glossary

| Term | Meaning |
|---|---|
| Event | An activity created and managed by an Event Organizer, which can be attended by customers. |
| Event Organizer | A user responsible for creating, managing, and controlling events. |
| Customer | A user who browses events, books tickets, and completes payments. |
| Gate Officer | A user who verifies and validates tickets during the event check-in process. |
| Ticket | Proof of attendance generated after a booking is successfully paid. |
| Ticket Category | A classification of tickets such as Regular, VIP, or Early Bird with specific price and quota. |
| Ticket Code | A unique identifier assigned to each ticket for validation purposes. |
| Quota | The maximum number of tickets available for a specific ticket category. |
| Booking | A temporary reservation made by a customer before completing payment, usually with a time limit. |
| Pending Payment | A booking status indicating that the payment has not yet been completed. |
| Paid | A booking status indicating that the payment has been successfully completed. |
| Expired | A booking status indicating that the payment deadline has passed without completion. |
| Payment Deadline | The maximum time allowed for completing payment after a booking is created. |
| Money | A value object representing a monetary amount along with its currency. |
| Refund | The process of returning payment to a customer under certain conditions. |
| Sales Period | The time range during which a ticket category is available for purchase. |
| Check-in | The process of validating a ticket when a participant enters the event venue. |

## Current Progress (Week 8)
- Define Clean Architecture structure
- Identify core entities and business rules
- Create initial domain model
- Prepare project structure

This document represents the initial system design. The design will be incrementally refined and expanded in the following development stages.
