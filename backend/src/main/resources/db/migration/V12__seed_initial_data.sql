-- Seed Default Hospital
INSERT INTO hospitals (id, name, address, phone, email, emergency_number, active, created_at, updated_at)
VALUES (1, 'City General Hospital & Research Center', '100 Healthcare Boulevard, Metro City, ST 90210', '+1 (555) 234-5678', 'grievance@citygeneral.org', '112 / +1 (555) 911-0000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for hospitals
SELECT setval(pg_get_serial_sequence('hospitals', 'id'), coalesce(max(id), 1)) FROM hospitals;

-- Seed Locations
INSERT INTO locations (hospital_id, name, description, floor_number, active) VALUES
(1, 'Reception / Help Desk', 'Main hospital entrance and information lobby', 'Ground Floor', TRUE),
(1, 'OPD (Outpatient Department)', 'Doctor consultation clinics and waiting bays', '1st Floor', TRUE),
(1, 'Emergency / Trauma Center', '24x7 Emergency Room & Triage', 'Ground Floor', TRUE),
(1, 'Billing Counter / Cashier', 'Inpatient and outpatient settlement counter', 'Ground Floor', TRUE),
(1, 'Pharmacy / Drug Dispensing', 'Central medicine dispensary and drug store', 'Ground Floor', TRUE),
(1, 'Laboratory & Diagnostics', 'Blood sample collection, pathology, radiology', 'Basement 1', TRUE),
(1, 'Inpatient Ward (General & Semi-Private)', 'Patient recovery and admission rooms', '2nd & 3rd Floor', TRUE),
(1, 'ICU & Critical Care', 'Intensive care units and post-op care', '4th Floor', TRUE),
(1, 'Waiting Area / Visitors Lounge', 'Public waiting area adjacent to clinics', '1st Floor', TRUE),
(1, 'Security Gate / Campus Perimeter', 'Main gate, entry checkpoints, security post', 'Ground Level', TRUE),
(1, 'Parking & Ambulance Bay', 'Visitor parking and ambulance drop-off zone', 'Ground / Basement', TRUE),
(1, 'Other Area', 'Any hospital department or facility not listed above', 'Various', TRUE);

-- Seed Complaint Categories
INSERT INTO complaint_categories (name, description, severity_default, active) VALUES
('Doctor / Medical Staff', 'Grievances regarding doctor consultation, clinical advice, or diagnosis communication', 'HIGH', TRUE),
('Nursing Staff', 'Issues regarding patient nursing care, injection timing, bedside manner, or assistance', 'MEDIUM', TRUE),
('Billing / Extra Charges', 'Discrepancies in hospital bills, overcharging, hidden fees, or delayed discharge billing', 'HIGH', TRUE),
('Bribe / Unofficial Payment Request', 'Any solicitation of unauthorized cash, gifts, tips, or illicit fees by staff', 'CRITICAL', TRUE),
('Misbehavior / Harassment', 'Unprofessional attitude, verbal misconduct, discrimination, or abusive behavior', 'HIGH', TRUE),
('Delay / Neglect', 'Unreasonable waiting times, unattended emergency, or delayed treatment/admission', 'HIGH', TRUE),
('Pharmacy / Medicine', 'Unavailable medicines, wrong drug dispensing, billing disputes at pharmacy', 'MEDIUM', TRUE),
('Cleanliness / Hygiene', 'Unclean washrooms, contaminated bedsheets, improper waste disposal, pest issues', 'MEDIUM', TRUE),
('Security / Watchman', 'Harassment by security, parking extortion, entry obstruction, baggage handling', 'LOW', TRUE),
('Facilities / Infrastructure', 'Air conditioning failure, broken elevator, drinking water unavailability, power issues', 'LOW', TRUE),
('Reception / Help Desk', 'Misguidance at front desk, slow registration, missing reports, rude receptionists', 'LOW', TRUE),
('Laboratory / Diagnostic Service', 'Delay in lab reports, faulty test collection, rude lab technicians, missing samples', 'MEDIUM', TRUE),
('Other Grievance', 'Any other genuine concern not categorized in standard options', 'MEDIUM', TRUE);

-- Seed QR Configuration
INSERT INTO qr_config (name, public_url, active, created_at, updated_at) VALUES
('Universal Hospital Grievance QR', 'http://localhost:5173/public', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Initial System Settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_at) VALUES
('HOSPITAL_NAME', 'City General Hospital & Research Center', 'Official hospital display name', CURRENT_TIMESTAMP),
('EMERGENCY_HOTLINE', '112 / +1 (555) 911-0000', 'Emergency contact displayed on public page', CURRENT_TIMESTAMP),
('GRIEVANCE_OFFICER_EMAIL', 'grievance.officer@citygeneral.org', 'Hospital ombudsman contact', CURRENT_TIMESTAMP),
('MAX_ATTACHMENT_SIZE_MB', '10', 'Max upload file size per attachment in MB', CURRENT_TIMESTAMP);
