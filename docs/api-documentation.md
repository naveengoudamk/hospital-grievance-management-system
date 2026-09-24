# RESTful API Reference Specification

Base Path: `/api`  
Standard Response Format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-24T22:30:00"
}
```

Standard Error Format:
```json
{
  "timestamp": "2026-09-24T22:30:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Detailed error message",
  "path": "/api/public/complaints",
  "details": ["Optional validation errors"]
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates internal administrator or committee member and issues short-lived JWT.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Admin@12345"
  }
  ```
- **Response `data`:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "id": 1,
    "username": "admin",
    "fullName": "Chief Grievance Administrator",
    "email": "admin@hospital.org",
    "role": "ROLE_ADMIN",
    "expiresInMs": 86400000
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated user profile.
- **Access:** `ROLE_ADMIN` or `ROLE_COMMITTEE_MEMBER` (Bearer Token required)

---

## 2. Public Endpoints (`/api/public`)

*No authentication or user registration required.*

### `POST /api/public/complaints`
Submits a new grievance with optional multiple evidence attachments (Multipart Form Data).
- **Form Parts:**
  - `complaint`: JSON string with payload:
    ```json
    {
      "categoryId": 1,
      "locationId": 2,
      "description": "Long waiting delay and lack of consultation guidance in OPD.",
      "isAnonymous": false,
      "complainantName": "John Doe",
      "complainantPhone": "+1 (555) 019-2834",
      "complainantEmail": "john@example.com",
      "preferredContactMethod": "PHONE",
      "incidentDate": "2026-09-24T14:30:00"
    }
    ```
  - `files`: Array of files (`.jpg`, `.png`, `.pdf`)
- **Response `data`:**
  ```json
  {
    "complaintReference": "HGS-2026-482910",
    "trackingToken": "K7M9P2X4W8N3V5Q1",
    "status": "SUBMITTED",
    "categoryName": "Delay / Neglect",
    "locationName": "OPD (Outpatient Department)",
    "submittedAt": "2026-09-24T22:30:00",
    "message": "Complaint submitted successfully. Please save your Reference Number and Tracking Token."
  }
  ```

### `POST /api/public/complaints/json`
Direct JSON submission endpoint when no file attachments are present.

### `POST /api/public/complaints/track`
Tracks complaint progress securely using reference and token.
- **Request Body:**
  ```json
  {
    "complaintReference": "HGS-2026-482910",
    "trackingToken": "K7M9P2X4W8N3V5Q1"
  }
  ```
- **Response `data`:**
  ```json
  {
    "complaintReference": "HGS-2026-482910",
    "categoryName": "Delay / Neglect",
    "locationName": "OPD (Outpatient Department)",
    "currentStatus": "UNDER_REVIEW",
    "statusDisplayName": "UNDER REVIEW",
    "statusMessage": "Your reported issue is currently being reviewed by the grievance administration desk.",
    "submittedAt": "2026-09-24T22:30:00",
    "attachmentCount": 1,
    "timeline": [
      {
        "stepKey": "SUBMITTED",
        "title": "Complaint Submitted",
        "completed": true,
        "current": false,
        "timestamp": "2026-09-24T22:30:00"
      },
      {
        "stepKey": "UNDER_REVIEW",
        "title": "Under Review",
        "completed": true,
        "current": true
      }, ...
    ]
  }
  ```

### `GET /api/public/config`
Returns public hospital profile, ombudsman email, and emergency contact numbers.

### `GET /api/public/categories`
Returns active complaint categories.

### `GET /api/public/locations`
Returns active hospital departments.

### `GET /api/public/complaints/attachments/{id}`
Streams authorized evidence file for display/download.

---

## 3. Administrator Endpoints (`/api/admin`)

*Requires `ROLE_ADMIN` authority.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Returns aggregated metrics, distribution graphs, and critical cases |
| `GET` | `/api/admin/complaints` | Multi-criteria search with server-side pagination & sorting |
| `GET` | `/api/admin/complaints/{id}` | Full internal complaint dossier with audit trail |
| `PUT` | `/api/admin/complaints/{id}/priority` | Updates complaint priority (LOW, MEDIUM, HIGH, CRITICAL) |
| `PUT` | `/api/admin/complaints/{id}/status` | Updates status with state transition validation rules |
| `PUT` | `/api/admin/complaints/{id}/assign` | Assigns complaint to an active committee member |
| `GET` | `/api/admin/complaints/{id}/history` | Returns complete status change timeline |
| `GET` | `/api/admin/complaints/export` | Generates and downloads filtered CSV report |
| `GET` | `/api/admin/users` | Lists system users with pagination |
| `POST`| `/api/admin/users` | Creates new administrator or committee member |
| `PUT` | `/api/admin/users/{id}` | Updates staff profile |
| `PUT` | `/api/admin/users/{id}/toggle-status` | Activates or deactivates user account |
| `GET` | `/api/admin/committee-members` | Lists active committee members for assignment dropdowns |
| `GET` | `/api/admin/categories` | Lists all complaint categories |
| `POST`| `/api/admin/categories` | Adds new category |
| `PUT` | `/api/admin/categories/{id}` | Edits category |
| `GET` | `/api/admin/locations` | Lists all hospital departments |
| `POST`| `/api/admin/locations` | Adds new location |
| `PUT` | `/api/admin/locations/{id}` | Edits location |
| `GET` | `/api/admin/audit-logs` | Filterable immutable system audit logs |
| `GET` | `/api/admin/qr` | Retrieves active ONE Universal QR configuration |
| `POST`| `/api/admin/qr/generate` | Regenerates QR code with custom public URL |
| `GET` | `/api/admin/qr/download` | Downloads high-resolution QR PNG image |

---

## 4. Committee Member Endpoints (`/api/committee`)

*Requires `ROLE_COMMITTEE_MEMBER` or `ROLE_ADMIN` authority.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/committee/dashboard` | Case metrics for authenticated committee member |
| `GET` | `/api/committee/complaints` | Filterable list of complaints assigned to the logged-in member |
| `GET` | `/api/committee/complaints/{id}` | Assigned case dossier and inquiry details |
| `POST`| `/api/committee/complaints/{id}/investigation` | Records/updates investigation summary, findings, and action taken |
| `PUT` | `/api/committee/complaints/{id}/status` | Updates inquiry status (INVESTIGATION / ACTION_TAKEN) |
| `POST`| `/api/committee/complaints/{id}/attachments` | Uploads committee inquiry evidence file |
