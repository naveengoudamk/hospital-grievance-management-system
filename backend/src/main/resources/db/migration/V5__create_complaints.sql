CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_reference VARCHAR(50) NOT NULL UNIQUE,
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    location_id BIGINT REFERENCES locations(id),
    category_id BIGINT NOT NULL REFERENCES complaint_categories(id),
    description TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    complainant_name VARCHAR(150),
    complainant_phone VARCHAR(30),
    complainant_email VARCHAR(150),
    preferred_contact_method VARCHAR(30),
    incident_date TIMESTAMP,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    tracking_token_hash VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_complaints_ref ON complaints(complaint_reference);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category ON complaints(category_id);
CREATE INDEX idx_complaints_location ON complaints(location_id);
CREATE INDEX idx_complaints_submitted_at ON complaints(submitted_at);
