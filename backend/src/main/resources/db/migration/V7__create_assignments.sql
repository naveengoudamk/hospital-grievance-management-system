CREATE TABLE complaint_assignments (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    committee_member_id BIGINT NOT NULL REFERENCES users(id),
    assigned_by BIGINT REFERENCES users(id),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_assignments_complaint ON complaint_assignments(complaint_id);
CREATE INDEX idx_assignments_member ON complaint_assignments(committee_member_id);
