# Overflow

A modern, distributed Q&A platform built with microservices architecture, featuring real-time search capabilities, reputation systems, and event sourcing patterns.

---

## 🎯 Project Overview

**Overflow** is a full-stack distributed application designed to demonstrate enterprise-grade microservices patterns and modern cloud-native development practices. It functions as a sophisticated Q&A platform (inspired by Stack Overflow) where users can create questions, post answers, vote on content, and build reputation through community engagement.

### Core Business Logic:
- Users can **ask questions** with tags for categorization
- Users can **answer questions** and provide solutions
- Community members can **upvote/downvote** content to signal quality
- **Reputation system** rewards valuable contributions
- **Advanced search** across the entire question database
- **User profiles** with contribution statistics and history

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Next.js Web Application (TypeScript/React)            │    │
│  │  - User Interface                                       │    │
│  │  - Client-side State (Zustand)                         │    │
│  │  - Authentication (NextAuth)                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  YARP Reverse Proxy with Routing                        │    │
│  │  - Route to Question Service (/questions, /tags)        │    │
│  │  - Route to Search Service (/search)                    │    │
│  │  - Route to Profile Service (/profiles)                 │    │
│  │  - Route to Vote Service (/votes)                       │    │
│  │  - Route to Stats Service (/stats)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────┬──────────┬──────────┬──────────┬───────────┬──────────────┘
      │          │          │          │           │
      ↓          ↓          ↓          ↓           ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                            │
│  ┌────────────┬────────────┬────────────┬────────────────────┐  │
│  │  Question  │  Profile   │   Vote     │     Search         │  │
│  │  Service   │  Service   │  Service   │     Service        │  │
│  │            │            │            │                    │  │
│  │  - Create  │ - User     │ - Cast     │ - Index content    │  │
│  │  - Read    │   Profile  │   votes    │ - Full-text search │  │
│  │  - Update  │ - Stats    │ - Vote     │ - Real-time sync   │  │
│  │  - Delete  │ - Auth     │   history  │ - Typesense client │  │
│  └────────────┴────────────┴────────────┴────────────────────┘  │
│  ┌──────────────┐       ┌────────────────────────────────────┐  │
│  │ Stats Svc    │       │      Reputation Module              │  │
│  │              │       │  - Calculate reputation            │  │
│  │ - Events     │       │  - User ranking                    │  │
│  │ - Aggregate  │       │  - Badge system                    │  │
│  │ - Dashboard  │       │  - Leaderboards                    │  │
│  └──────────────┘       └────────────────────────────────────┘  │
└──────┬──────────┬──────────┬──────────┬──────────────────────────┘
       │          │          │          │
       ↓          ↓          ↓          ↓
┌──────────────────────────────────────────────────────────────────┐
│              Infrastructure & Data Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │  PostgreSQL  │  │    PostgreSQL        │   │
│  │  Database    │  │  Event Store │  │  (Marten)            │   │
│  │              │  │  (Marten)    │  │                      │   │
│  │ Multiple     │  │              │  │ - Event Sourcing     │   │
│  │ databases    │  │ - Full event │  │ - Projections        │   │
│  │ per service  │  │   history    │  │ - CQRS queries       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Keycloak    │  │  RabbitMQ    │  │     Typesense        │   │
│  │              │  │              │  │                      │   │
│  │ - SSO        │  │ - Message    │  │ - Search index       │   │
│  │ - OAuth 2.0  │  │   broker     │  │ - Fast full-text     │   │
│  │ - JWT tokens │  │ - Event      │  │   search             │   │
│  │              │  │   publishing │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

**Microservices Architecture**
- Each service is independently deployable with its own database
- Services communicate asynchronously through RabbitMQ
- YARP gateway routes requests to appropriate services

**Event Sourcing & CQRS**
- Stats Service uses Marten for event sourcing
- All domain events are persisted as audit trail
- Projections aggregate events into queryable state

**Domain-Driven Design**
- Bounded contexts: Question, Profile, Vote, Stats, Search
- Contracts define inter-service events
- Services are loosely coupled through event publications

**Asynchronous Communication**
- Services publish events to RabbitMQ
- Message handlers process events durably
- Wolverine ensures reliable message handling with outbox pattern

---

## ✨ Features

### Question Management
- Create, read, update, and delete questions
- Tag-based categorization
- Rich text editing with markdown support
- Full question lifecycle management

### Search Capabilities
- Real-time indexing via Typesense
- Fast full-text search across questions
- Tag-based filtering
- Advanced search queries

### Voting System
- Upvote/downvote questions and answers
- Vote history tracking
- Prevents duplicate voting

### Reputation & User Profiles
- Dynamic reputation calculation
- User contribution statistics
- Leaderboards and rankings
- User profile management
- Account linking through Keycloak

### Event-Driven Architecture
- Complete event audit trail
- Pub/Sub messaging with RabbitMQ
- Event projections for analytics
- Durable message outbox pattern

### Authentication & Authorization
- OAuth 2.0 / OpenID Connect via Keycloak
- JWT token-based sessions
- Role-based access control (RBAC)
- Secure API endpoints

---

## 🚀 Quick Start - Local Development

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Overflow.git
cd Overflow
```

### Step 2: Restore .NET Dependencies

```bash
dotnet restore
```

### Step 3: Restore Node.js Dependencies (Frontend)

```bash
cd webapp
npm install
cd ..
```

### Step 4: Start Infrastructure with .NET Aspire

The project uses **.NET Aspire** for orchestrating local development environment. This automatically starts all required services:

```bash
# Navigate to AppHost project
cd Overflow.AppHost

# Run the application
dotnet run
```

**What this does:**
- Launches Docker containers for PostgreSQL, RabbitMQ, Keycloak, and Typesense
- Starts all microservices (Question, Profile, Vote, Stats, Search)
- Starts the YARP API gateway
- Launches the Next.js frontend
- Opens the Aspire Dashboard at `http://localhost:8080`

### Step 5: Verify All Services are Running

Open the **Aspire Dashboard** at: `http://localhost:8080`

You should see all services with a green "Running" status:
- ✅ question-svc
- ✅ profile-svc
- ✅ vote-svc
- ✅ search-svc
- ✅ stats-svc
- ✅ gateway (YARP)
- ✅ webapp
- ✅ Keycloak (Identity)
- ✅ RabbitMQ (Messaging)
- ✅ Typesense (Search Index)
- ✅ PostgreSQL (Database)

### Step 6: Access the Application

**Frontend:**
- URL: `http://localhost:3000`
- Sign up / Login via Keycloak

**API Gateway:**
- Base URL: `http://localhost:8001` (or varies by configuration)

**Service Discovery:**
- Aspire Dashboard: `http://localhost:8080`

**Keycloak Admin Console:**
- URL: `http://localhost:6001`
- Username: `admin`
- Password: Check Aspire Dashboard for the password

**RabbitMQ Management:**
- URL: `http://localhost:15672`
- Credentials: Check docker-compose or Aspire Dashboard

**Typesense API:**
- URL: `http://localhost:8108`

---

## 🔧 Key Components Explained

### Overflow.AppHost
- Orchestrates the entire local development environment using .NET Aspire
- Configures all services with proper dependencies and startup order
- Manages Docker containers for databases and infrastructure
- Routes frontend requests through YARP gateway

### Microservices

**QuestionService**
- Manages question CRUD operations
- Tag management and filtering
- RESTful endpoints for questions and answers
- Uses EF Core with PostgreSQL

**SearchService**
- Real-time full-text search powered by Typesense
- Listens to question events and maintains search index
- Handles complex search queries
- Provides fast search results

**ProfileService**
- User profile management
- Middleware for auto-creating profiles on first OAuth login
- User statistics and contribution tracking
- Integration with Keycloak for user data

**VoteService**
- Upvote/downvote functionality
- Vote history and analytics
- Prevents duplicate votes
- Triggers reputation calculations

**StatsService**
- Event sourcing using Marten
- Aggregates question and reputation data
- Provides analytics and dashboard data
- Uses CQRS pattern for efficient queries

### Infrastructure Components

**Keycloak**
- OAuth 2.0 and OpenID Connect provider
- User authentication and management
- Realm configuration for Overflow platform
- JWT token generation

**RabbitMQ**
- Asynchronous message broker
- Pub/Sub messaging between services
- Durable queue setup for reliability
- Management interface for monitoring

**PostgreSQL**
- Primary relational database
- Separate databases per service (question, profile, vote, stats)
- EF Core migrations for schema management
- Event sourcing support via Marten

**Typesense**
- Vector-based search engine
- Real-time indexing
- Full-text search capabilities
- REST API for search queries

**YARP (API Gateway)**
- Reverse proxy and routing
- Service discovery
- Request forwarding to appropriate microservices
- Load balancing support

---

## 🚢 Deployment

### To Azure Container Apps

The project is configured for automated deployment to Azure using **Azure Developer CLI (azd)**:

```bash
# Initialize deployment configuration
azd auth login

# Provision infrastructure and deploy
azd up

# For infrastructure-only provisioning
azd provision

# For deployment-only (after provisioning)
azd deploy
```

**What gets deployed:**
- Web application on Azure Container Apps
- All microservices as containerized workloads
- PostgreSQL for databases
- RabbitMQ for messaging
- Keycloak for authentication
- Typesense for search
- YARP gateway for API routing

**Infrastructure as Code:**
- Bicep templates define all Azure resources
- Automatically generated from AppHost configuration
- Reusable components across services

---

## 📚 Development Workflow

### Running Individual Services

To run a single service for debugging:

```bash
cd QuestionService
dotnet run
```

### Database Migrations

Migrations are automatically applied on service startup. To manually create or update migrations:

```bash
cd QuestionService
dotnet ef migrations add MigrationName
```



