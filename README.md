# 🏥 Hospital Grievance & Accountability Management System (HGAMS)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://openjdk.org/)
[![Spring Boot 3.3.5](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-DB%20Migrations-CC0200.svg?style=flat&logo=flyway)](https://flywaydb.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)

A modern, enterprise-grade, full-stack hospital accountability and grievance management platform. Built to empower patients, visitors, and hospital attendants to report incidents, medical negligence, billing irregularities, sanitation failures, or staff misconduct effortlessly through **ONE UNIVERSAL QR CODE**.

---

## 📑 Table of Contents

- [Key Highlights & Architectural Philosophy](#-key-highlights--architectural-philosophy)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Core Functional Workflows](#-core-functional-workflows)
  - [1. Universal Public Portal & QR Code](#1-universal-public-portal--qr-code)
  - [2. Cryptographic Zero-Knowledge Tracking](#2-cryptographic-zero-knowledge-tracking)
  - [3. Administration & Triage Engine](#3-administration--triage-engine)
  - [4. Committee Investigation & Corrective Action](#4-committee-investigation--corrective-action)
- [Database Schema & Migrations](#-database-schema--migrations)
- [REST API Reference](#-rest-api-reference)
- [Getting Started](#-getting-started)
  - [Option A: One-Click Docker Compose (Recommended)](#option-a-one-click-docker-compose-recommended)
  - [Option B: Manual Local Development](#option-b-manual-local-development)
- [Default Demo Credentials](#-default-demo-credentials)
- [Security & Compliance Architecture](#-security--compliance-architecture)
- [Automated Testing & Quality Assurance](#-automated-testing--quality-assurance)
- [Project Directory Structure](#-project-directory-structure)

---

## 🌟 Key Highlights & Architectural Philosophy

1. **One Universal QR Code Strategy:** Eliminates the maintenance burden and physical overhead of managing hundreds of individual departmental QR stickers. A single high-density QR code is posted across all hospital wards, OPDs, billing counters, and waiting halls. The intuitive responsive web client dynamically routes issues to the right hospital location and specialty.
2. **Anonymous or Identified Grievance Reporting:** Allows whistleblowers and distressed patients to report genuine incidents anonymously without fear of retaliation, while optionally permitting contact details for proactive communication.
3. **Cryptographic Tracking Token Security:** When a complaint is lodged, a unique human-friendly reference ID (`HGS-YYYY-NNNNNN`) and a 16-character alphanumeric secret token are generated. Only the **SHA-256 hash** of the token is stored in the database. Even in the event of a database breach, tracking tokens cannot be reversed or impersonated.
4. **Strict 6-Stage Lifecycle State Machine:**
   `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `ASSIGNED` ➔ `INVESTIGATION_IN_PROGRESS` ➔ `RESOLVED` (or `REJECTED`).
   Transitions are strictly enforced via service-layer domain rules.
5. **Role-Based Operational Workspaces:**
   - **Public Portal:** Clean, mobile-first, high-accessibility UI for reporting, instant tracking, emergency helplines, and hospital policy charters.
   - **Admin Management Console:** Real-time triage dashboard, workload analytics, committee assignment dispatch, status transition control, category & location management, universal QR code configuration, and immutable audit logs.
   - **Committee Investigation Portal:** Dedicated portal for Chief Medical Officers, Nursing Supervisors, and Operations leads to log official inquiry notes, record verified findings, recommend systemic corrective actions, and upload official case evidence.
6. **Immutable Audit Trails:** Every status transition, assignment dispatch, note submission, and priority escalation is logged to an audit table with actor ID, IP address, timestamp, and before/after state diffs.

---

## 🏗 System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       Universal Hospital QR Code        │
                               │        https://hospital.org/public      │
                               └────────────────────┬────────────────────┘
                                                    │ (Scanned by Mobile)
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND PORTAL (React 18 + TS + Vite)                          │
├──────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│        Public Portal         │      Admin Command Center        │    Committee Portal           │
│  - Incident Submission       │  - Triage Dashboard & Analytics  │  - Active Inquiry Management  │
│  - Real-time Timeline Track  │  - Case Assignment & Routing     │  - Verified Findings Notes    │
│  - Hospital Charter/Helpline │  - Category/Location Management  │  - Corrective Action Plan     │
│  - Evidence Uploads          │  - Audit Logs & CSV Data Export  │  - Official Inquiry Evidence  │
└──────────────────────────────┴─────────────────┬────────────────┴───────────────────────────────┘
                                                 │ REST API (JSON / Multipart)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND ENGINE (Spring Boot 3.3.5 / Java 21)                        │
├──────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│       Security & Auth        │         Core Domain API          │      Storage & Export         │
│  - JWT Bearer Token Auth     │  - Public Complaint Service      │  - Sanitized File Storage     │
│  - BCrypt Password Hashing   │  - Admin Workflow Service        │  - ZXing QR Engine            │
│  - Role Guards (ADMIN/CMTE)  │  - Committee Inquiry Service     │  - OpenCSV Analytics Exporter │
│  - SHA-256 Token Validator   │  - Dashboard Analytics Service   │  - Strict MIME/Size Validator │
└──────────────────────────────┴─────────────────┬────────────────┴───────────────────────────────┘
                                                 │ Spring Data JPA / Hibernate
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE (PostgreSQL 17 / Flyway Migrations)                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  users • hospitals • locations • categories • complaints • attachments • assignments             │
│  investigations • status_history • audit_logs • qr_configs • system_settings                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Java 21 (LTS), Spring Boot 3.3.5 |
| **Security & Auth** | Spring Security 6, JWT (`jjwt 0.12.6`), BCrypt Password Encoder |
| **Persistence & ORM** | Spring Data JPA, Hibernate 6, Flyway Migration Engine |
| **Database** | PostgreSQL 17 (Production/Dev), H2 in-memory (Unit Tests) |
| **QR Generation** | ZXing (`core` & `javase` 3.5.3) |
| **Reporting & Export** | OpenCSV 5.9 |
| **Frontend Framework** | React 18, TypeScript, Vite 5 |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React Icons |
| **Networking & State** | Axios (with automatic JWT interceptors), React Router DOM 6 |
| **Containerization** | Docker Engine, Docker Compose (Multi-stage builds) |
| **Testing** | JUnit 5, Mockito, AssertJ, Spring Boot Test Starter |

---

## 🔄 Core Functional Workflows

### 1. Universal Public Portal & QR Code
- Hospital administrators configure the official hospital name, logo, help desk phone numbers, and universal QR code slug.
- Visitors scan the universal QR code posted on physical signboards and are instantly directed to `/public`.
- Users can choose from 10+ standard hospital incident categories (e.g., Medical Negligence, Nursing Care, Billing Overcharge, Hygiene/Sanitation, Pharmacy Delays, Security & Harassment) and select the specific Block/Floor/Ward.
- Supports secure drag-and-drop evidence uploads (JPG, PNG, PDF up to 10MB) with filename sanitization and anti-traversal security.

### 2. Cryptographic Zero-Knowledge Tracking
- Upon submission, the user receives an instant printable/downloadable acknowledgment slip containing:
  - **Reference Number:** e.g., `HGS-2026-000101`
  - **Secret Tracking Token:** e.g., `Tk9aB7xK2pL4mQ8v`
- Anyone possessing the reference number and token can view a transparent 6-stage milestone tracker, public status updates, and committee resolution statements.
- Public tracking sanitizes all internal investigator notes and private staff identities to preserve confidentiality and prevent harassment.

### 3. Administration & Triage Engine
- Hospital Administrators receive instant notifications on incoming complaints.
- Automated SLA & priority calculation (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- One-click assignment to registered Committee Members with assignment notes and target resolution dates.
- Interactive dashboard displays real-time breakdowns by category, location, priority distribution, and SLA resolution velocity.
- Filterable CSV exports for executive committee meetings and regulatory compliance reporting.

### 4. Committee Investigation & Corrective Action
- Assigned committee members access a clean, focused investigation workspace.
- Capability to log internal inquiry notes, interview testimonies, root-cause findings, and institutional corrective actions.
- Formal resolution submission with public-facing closure summaries and optional internal supporting documents.

---

## 🗄 Database Schema & Migrations

Database versioning is fully managed through Flyway with 12 sequential migrations located in `backend/src/main/resources/db/migration/`:

1. `V1__create_users.sql` — User accounts with role constraints (`ROLE_ADMIN`, `ROLE_COMMITTEE_MEMBER`).
2. `V2__create_hospitals.sql` — Hospital master profiles and configuration.
3. `V3__create_locations.sql` — Departmental hierarchy (Block, Floor, Ward, OPD).
4. `V4__create_categories.sql` — Grievance classification taxonomies with default SLA hours.
5. `V5__create_complaints.sql` — Core grievance records, anonymized tracking hashes, priority, status.
6. `V6__create_attachments.sql` — File metadata, MIME types, storage paths, and uploader linkages.
7. `V7__create_assignments.sql` — Multi-investigator dispatch and assignment logs.
8. `V8__create_investigations.sql` — Formal inquiry findings, root causes, and corrective action records.
9. `V9__create_status_history.sql` — State machine transition ledger with remarks.
10. `V10__create_audit_logs.sql` — Immutable security and action audit ledger.
11. `V11__create_qr_config.sql` — Universal QR Code parameters and redirect configurations.
12. `V12__seed_initial_data.sql` — Initial departments, incident categories, and demo master records.

Detailed schema definitions and entity relationship diagrams are available in [`docs/database-schema.md`](docs/database-schema.md).

---

## 🔌 REST API Reference

The backend exposes a clean, RESTful API organized by authorization scope:

### Public Endpoints (`/api/public/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/qr-config` | Fetch universal QR code details and Base64 image |
| `GET` | `/api/public/qr-image` | Download raw PNG universal QR code sticker |
| `GET` | `/api/public/categories` | List active grievance categories and SLAs |
| `GET` | `/api/public/locations` | List active hospital locations/wards |
| `POST` | `/api/public/complaints` | Submit a new grievance (supports multipart uploads) |
| `POST` | `/api/public/complaints/track` | Track grievance progress via Ref No & Token |

### Authentication Endpoints (`/api/auth/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate staff user & return JWT Bearer token |
| `GET` | `/api/auth/me` | Return authenticated user identity and role |

### Admin Endpoints (`/api/admin/*`) — *Requires `ROLE_ADMIN`*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | High-level summary metrics & SLA alerts |
| `GET` | `/api/admin/dashboard/charts` | Categorical & location breakdown charts |
| `GET` | `/api/admin/complaints` | Filtered & paginated complaint management list |
| `GET` | `/api/admin/complaints/{id}` | Comprehensive complaint dossier view |
| `PATCH` | `/api/admin/complaints/{id}/status` | Update workflow status with audit remarks |
| `PATCH` | `/api/admin/complaints/{id}/priority` | Escalate or modify complaint priority |
| `POST` | `/api/admin/complaints/{id}/assign` | Assign complaint to committee member |
| `GET` | `/api/admin/users` | List hospital staff and committee accounts |
| `POST` | `/api/admin/users` | Create new committee investigator account |
| `GET` | `/api/admin/categories` | Manage incident classification taxonomy |
| `GET` | `/api/admin/locations` | Manage hospital blocks, wards, and floors |
| `GET` | `/api/admin/audit-logs` | Query system-wide immutable audit trail |
| `GET` | `/api/admin/export/complaints` | Download compliance CSV report |

### Committee Endpoints (`/api/committee/*`) — *Requires `ROLE_COMMITTEE_MEMBER` or `ROLE_ADMIN`*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/committee/dashboard/stats` | Assigned caseload and pending inquiry counts |
| `GET` | `/api/committee/complaints` | View assigned complaint roster |
| `GET` | `/api/committee/complaints/{id}` | View detailed investigation dossier |
| `POST` | `/api/committee/complaints/{id}/investigations` | Record formal inquiry findings & actions |
| `POST` | `/api/committee/complaints/{id}/attachments` | Upload official inquiry evidence |

Complete request and response payload schemas are documented in [`docs/api-documentation.md`](docs/api-documentation.md).

---

## 🚀 Getting Started

### Prerequisites
- [Docker Engine & Docker Compose](https://docs.docker.com/get-docker/) (Recommended) **OR**
- Java 21 JDK + Apache Maven 3.9+
- Node.js 18+ & npm 9+
- PostgreSQL 17

---

### Option A: One-Click Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/naveengoudamk/hospital-grievance-management-system.git
   cd hospital-grievance-management-system
   ```

2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Spin up all containers:
   ```bash
   docker compose up --build -d
   ```

4. Access the applications:
   - **Public QR Portal:** `http://localhost:3000/public`
   - **Internal Staff Login:** `http://localhost:3000/login`
   - **Backend REST API:** `http://localhost:8080/api`
   - **PostgreSQL Database:** `localhost:5432` (`db: hospital_grievance_db`)

---

### Option B: Manual Local Development

#### 1. Database Setup
Create a PostgreSQL database named `hospital_grievance_db`:
```sql
CREATE DATABASE hospital_grievance_db;
```

#### 2. Backend Setup
```bash
cd backend
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home # or your JDK 21 path
mvn clean spring-boot:run
```
*The backend will automatically execute all 12 Flyway database migrations and seed demo users.*

#### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Default Demo Credentials

The database is pre-seeded with sample user accounts for testing:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **System Administrator** | `admin` | `Admin@12345` | Full command center, triage, settings & audit logs |
| **Chief Medical Officer** | `committee1` | `Committee@123` | Medical negligence & clinical investigations |
| **Nursing Supervisor** | `committee2` | `Committee@123` | Patient care & nursing staff inquiries |
| **Operations Lead** | `committee3` | `Committee@123` | Billing disputes, sanitation & infrastructure |

*Note: The frontend login screen includes **Quick Fill** helper buttons to easily log in as any test role.*

---

## 🔒 Security & Compliance Architecture

- **Stateless Authentication:** Secure JWT Bearer tokens with configurable expiration and secret keys.
- **Password Security:** BCrypt password hashing with high work factor.
- **Cryptographic Separation:** Tracking tokens are hashed with SHA-256 before persistence. Even system administrators with full database access cannot discover patient tracking tokens.
- **Evidence Storage Hardening:**
  - Files are renamed to UUIDs upon upload to prevent original file execution or path overwrite attacks.
  - Strict whitelist validation on MIME types (`image/jpeg`, `image/png`, `application/pdf`).
  - Path traversal defense (`../` pattern stripping and root directory containment checks).
- **Audit Compliance:** Every critical action records user identity, action type, target entity ID, IP address, and details.

---

## 🧪 Automated Testing & Quality Assurance

The backend includes a comprehensive suite of unit and integration tests covering security, status state machine rules, QR code generation, cryptographic token generation, and service-layer business logic.

Execute the test suite:
```bash
cd backend
mvn test
```

### Verified Test Suites:
- `AuthServiceTest` — Authentication, user retrieval, password verification.
- `PublicComplaintServiceTest` — Anonymous and identified submissions, reference generation, token hashing.
- `AdminComplaintServiceTest` — Status transitions, assignment dispatches, priority escalation.
- `ComplaintStatusTransitionTest` — State machine rule validation & illegal transition rejection.
- `QrCodeGeneratorServiceTest` — ZXing QR code image generation and validation.
- `TokenGeneratorTest` — High-entropy token generation and SHA-256 deterministic hashing.

---

## 📁 Project Directory Structure

```
hospital-grievance-management-system/
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
├── docker-compose.yml               # Multi-container orchestration (DB + API + UI)
├── Dockerfile.backend               # Multi-stage JDK 21 Spring Boot Docker build
├── Dockerfile.frontend              # Multi-stage Vite + Nginx Docker build
├── README.md                        # Root portfolio documentation
├── docs/                            # Architectural and technical documentation
│   ├── architecture.md              # Deep-dive architecture specification
│   ├── database-schema.md           # ER diagram and table schemas
│   └── api-documentation.md         # Complete REST API payload catalog
├── backend/                         # Spring Boot 3.3.5 / Java 21 Application
│   ├── pom.xml                      # Maven dependencies & build plugins
│   └── src/
│       ├── main/
│       │   ├── java/com/hospital/grievance/
│       │   │   ├── config/          # Security, JWT, CORS, WebConfig
│       │   │   ├── controller/      # Auth, Public, Admin, Committee Controllers
│       │   │   ├── dto/             # Request & Response DTO records
│       │   │   ├── entity/          # JPA Entities (Complaint, User, etc.)
│       │   │   ├── enums/           # Role, Status, Priority, AuditAction
│       │   │   ├── exception/       # Global exception handler & custom exceptions
│       │   │   ├── repository/      # Spring Data JPA Repositories
│       │   │   ├── service/         # Business logic & Interface definitions
│       │   │   └── util/            # Reference generator, Token & QR utilities
│       │   └── resources/
│       │       ├── application.yml  # Application properties & profiles
│       │       └── db/migration/    # 12 Flyway SQL Migration scripts
│       └── test/                    # JUnit 5 & Mockito test suites
└── frontend/                        # React 18 + TypeScript + Vite Application
    ├── index.html                   # HTML5 Entry point
    ├── package.json                 # Frontend dependencies & scripts
    ├── tailwind.config.js           # Tailwind CSS theme & tokens
    ├── vite.config.ts               # Vite bundler & API proxy configuration
    └── src/
        ├── api/                     # Axios instance & typed API service clients
        ├── components/              # Reusable UI components & layouts
        ├── context/                 # AuthContext & Session management
        ├── pages/
        │   ├── public/              # Public QR portal, Report, Track, FAQ
        │   ├── admin/               # Admin Dashboard, Complaints, Users, Logs
        │   ├── committee/           # Committee Dashboard, Investigations
        │   └── auth/                # Staff Login screen
        ├── types/                   # Shared TypeScript interfaces
        └── App.tsx                  # Client router & route guards
```

---

## 👥 Authors & License

Developed as a modern, full-stack enterprise healthcare reference system.  
Licensed under the **MIT License**.
