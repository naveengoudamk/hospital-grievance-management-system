# PostgreSQL 17 Database Schema & Entity Relationships

The **Hospital Grievance & Accountability Management System** utilizes a normalized relational PostgreSQL 17 database schema managed via **Flyway Versioned Database Migrations**.

---

## 1. Entity Relationship Overview

```mermaid
erDiagram
    HOSPITALS ||--o{ LOCATIONS : "contains"
    HOSPITALS ||--o{ COMPLAINTS : "registers"
    LOCATIONS ||--o{ COMPLAINTS : "occurs_at"
    COMPLAINT_CATEGORIES ||--o{ COMPLAINTS : "categorized_as"
    COMPLAINTS ||--o{ COMPLAINT_ATTACHMENTS : "has_evidence"
    COMPLAINTS ||--o{ COMPLAINT_ASSIGNMENTS : "assigned_to"
    COMPLAINTS ||--o{ INVESTIGATIONS : "investigated_via"
    COMPLAINTS ||--o{ COMPLAINT_STATUS_HISTORY : "tracks_history"
    USERS ||--o{ COMPLAINT_ASSIGNMENTS : "assigned_officer"
    USERS ||--o{ INVESTIGATIONS : "investigator"
    USERS ||--o{ AUDIT_LOGS : "performed_by"

    USERS {
        bigserial id PK
        varchar full_name
        varchar username UK
        varchar email UK
        varchar phone
        varchar password_hash
        varchar role
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    HOSPITALS {
        bigserial id PK
        varchar name
        text address
        varchar phone
        varchar email
        varchar emergency_number
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    LOCATIONS {
        bigserial id PK
        bigint hospital_id FK
        varchar name
        text description
        varchar floor_number
        boolean active
        timestamp created_at
    }

    COMPLAINT_CATEGORIES {
        bigserial id PK
        varchar name UK
        text description
        varchar severity_default
        boolean active
        timestamp created_at
    }

    COMPLAINTS {
        bigserial id PK
        varchar complaint_reference UK
        bigint hospital_id FK
        bigint location_id FK
        bigint category_id FK
        text description
        boolean is_anonymous
        varchar complainant_name
        varchar complainant_phone
        varchar complainant_email
        varchar preferred_contact_method
        timestamp incident_date
        varchar priority
        varchar status
        varchar tracking_token_hash
        timestamp submitted_at
        timestamp updated_at
        timestamp resolved_at
    }

    COMPLAINT_ATTACHMENTS {
        bigserial id PK
        bigint complaint_id FK
        varchar original_file_name
        varchar stored_file_name
        varchar file_path
        varchar file_type
        bigint file_size
        timestamp uploaded_at
    }

    COMPLAINT_ASSIGNMENTS {
        bigserial id PK
        bigint complaint_id FK
        bigint committee_member_id FK
        bigint assigned_by FK
        timestamp assigned_at
        text remarks
        boolean active
    }

    INVESTIGATIONS {
        bigserial id PK
        bigint complaint_id FK
        bigint investigator_id FK
        text investigation_summary
        text findings
        text action_taken
        varchar investigation_status
        timestamp started_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    COMPLAINT_STATUS_HISTORY {
        bigserial id PK
        bigint complaint_id FK
        varchar old_status
        varchar new_status
        varchar changed_by
        text remarks
        timestamp changed_at
    }

    AUDIT_LOGS {
        bigserial id PK
        bigint user_id
        varchar username
        varchar action
        varchar entity_type
        varchar entity_id
        text old_value
        text new_value
        varchar ip_address
        timestamp created_at
    }

    QR_CONFIG {
        bigserial id PK
        varchar name
        varchar public_url
        text qr_code_base64
        boolean active
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Table Specifications & Indexes

### 2.1. `users`
- Stores administrators and committee investigators.
- Unique indexes on `username` and `email`.
- Index on `role`.

### 2.2. `complaints`
- Primary aggregate root representing grievance submissions.
- Unique index on `complaint_reference` (`HGS-YYYY-NNNNNN`).
- B-Tree indexes on `status`, `priority`, `category_id`, `location_id`, and `submitted_at` for high-throughput multi-criteria filtering.

### 2.3. `investigations`
- Stores findings and corrective action details submitted by assigned committee members.
- Foreign keys to `complaints` (cascade on delete) and `users`.

### 2.4. `audit_logs`
- Append-only compliance log.
- Indexes on `action`, `created_at`, and `(entity_type, entity_id)` for audit trail queries.

---

## 3. Flyway Migration Inventory

| Version | Migration Script | Purpose |
| :--- | :--- | :--- |
| `V1` | `V1__create_users.sql` | Creates staff and committee user table with unique indexes |
| `V2` | `V2__create_hospitals.sql` | Creates hospital organization profile table |
| `V3` | `V3__create_locations.sql` | Creates hospital department and floor location table |
| `V4` | `V4__create_categories.sql` | Creates complaint classifications & severity presets |
| `V5` | `V5__create_complaints.sql` | Creates primary complaints table with reference & token hash |
| `V6` | `V6__create_attachments.sql` | Creates supporting evidence file attachment table |
| `V7` | `V7__create_assignments.sql` | Creates committee member assignment history |
| `V8` | `V8__create_investigations.sql` | Creates inquiry findings & corrective action table |
| `V9` | `V9__create_status_history.sql` | Creates complaint state transition history log |
| `V10`| `V10__create_audit_logs.sql` | Creates compliance audit trail table |
| `V11`| `V11__create_qr_config.sql` | Creates ONE Universal QR code and settings tables |
| `V12`| `V12__seed_initial_data.sql` | Seeds hospital, 12 departments, 13 categories, & settings |
