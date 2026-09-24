CREATE TABLE investigations (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    investigator_id BIGINT NOT NULL REFERENCES users(id),
    investigation_summary TEXT,
    findings TEXT,
    action_taken TEXT,
    investigation_status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investigations_complaint ON investigations(complaint_id);
CREATE INDEX idx_investigations_investigator ON investigations(investigator_id);
