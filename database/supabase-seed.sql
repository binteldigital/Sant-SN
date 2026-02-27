-- Seed data for Sunu Santé
-- Run this after creating the schema

-- Insert demo admin user (password: admin123)
-- Password hash generated with bcrypt (10 rounds)
INSERT INTO users (email, password_hash, role, full_name, phone, is_active, email_verified, phone_verified)
VALUES (
    'admin@sunusante.sn',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'super_admin',
    'Administrateur Demo',
    '+221 77 123 45 67',
    true,
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo users
INSERT INTO users (email, password_hash, role, full_name, phone, is_active, email_verified, phone_verified)
VALUES 
    ('patient@demo.sn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'Amadou Diallo', '+221 77 111 11 11', true, true, true),
    ('doctor@demo.sn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'Dr. Fatou Ndiaye', '+221 77 222 22 22', true, true, true),
    ('hospital.admin@demo.sn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hospital_admin', 'Moussa Sow', '+221 77 333 33 33', true, true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample hospitals (first 10 from the dataset)
INSERT INTO hospitals (name, type, category, address, latitude, longitude, location, district, department, phone, email, website, description, is_active)
VALUES 
    (
        'Hôpital Principal de Dakar (HPD)',
        'Hôpital Militaire',
        'Hôpital Militaire',
        '1, Avenue Nelson Mandela, Dakar-Plateau',
        14.6677,
        -17.4378,
        'Dakar-Plateau',
        'Dakar Centre',
        'Dakar',
        '+221 33 839 50 50 / +221 33 839 50 02',
        'communication@hpd.sn',
        'www.hopitalprincipal.sn',
        'Hôpital Principal de Dakar (HPD) est un établissement de type Hôpital Militaire situé à Dakar-Plateau.',
        true
    ),
    (
        'CHNU de Fann (Centre Hospitalier National Universitaire)',
        'Hôpital Public',
        'CHU / EPS Niveau 3',
        'Avenue Cheikh Anta Diop, Fann, Dakar – BP 5035',
        14.6919,
        -17.4647,
        'Fann – Point E',
        'Dakar Centre',
        'Dakar',
        '+221 33 869 18 18 / +221 33 839 50 08',
        'chnufann@chnu-fann.sn',
        'www.chnu-fann.sn',
        'CHNU de Fann est un établissement de type CHU / EPS Niveau 3.',
        true
    ),
    (
        'CHU Abass Ndao',
        'Hôpital Public',
        'CHU / EPS Niveau 3',
        'Route de Fann, Avenue Cheikh Anta Diop, Dakar',
        14.69,
        -17.46,
        'Fann – Médina',
        'Dakar Centre',
        'Dakar',
        '+221 33 849 78 00',
        '',
        '',
        'CHU Abass Ndao est un établissement de type CHU / EPS Niveau 3.',
        true
    ),
    (
        'CHU Aristide Le Dantec',
        'Hôpital Public',
        'CHU / EPS Niveau 3',
        '30, Avenue Pasteur, Dakar-Plateau',
        14.6736,
        -17.4346,
        'Dakar-Plateau',
        'Dakar Centre',
        'Dakar',
        '+221 33 823 53 95 / +221 33 899 38 00',
        'h.dantec@sentoo.sn',
        '',
        'CHU Aristide Le Dantec est un établissement de type CHU / EPS Niveau 3.',
        true
    ),
    (
        'Hôpital Militaire d''Ouakam',
        'Hôpital Militaire',
        'Hôpital Militaire',
        'Ouakam, Dakar',
        14.71,
        -17.46,
        'Ouakam',
        'Dakar Ouest',
        'Dakar',
        '+221 33 820 28 00',
        '',
        '',
        'Hôpital Militaire d''Ouakam.',
        true
    )
ON CONFLICT DO NOTHING;

-- Insert sample pharmacies
INSERT INTO pharmacies (name, pharmacist, address, latitude, longitude, quartier, commune, district, department, phone, on_duty_status, is_active)
VALUES 
    (
        'Pharmacie du Plateau',
        'Dr. Diallo',
        '15 Avenue Nelson Mandela, Dakar-Plateau',
        14.6677,
        -17.4378,
        'Plateau',
        'Dakar',
        'Dakar Centre',
        'Dakar',
        '+221 33 821 00 00',
        false,
        true
    ),
    (
        'Pharmacie Fann',
        'Dr. Ndiaye',
        'Avenue Cheikh Anta Diop, Fann',
        14.6919,
        -17.4647,
        'Fann',
        'Dakar',
        'Dakar Centre',
        'Dakar',
        '+221 33 869 00 00',
        true,
        true
    ),
    (
        'Pharmacie Médina',
        'Dr. Sow',
        'Rue 10, Médina',
        14.69,
        -17.46,
        'Médina',
        'Dakar',
        'Dakar Centre',
        'Dakar',
        '+221 33 822 00 00',
        false,
        true
    )
ON CONFLICT DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (patient_id, hospital_id, appointment_date, appointment_time, status, reason, notes)
SELECT 
    u.id,
    h.id,
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    'confirmed',
    'Consultation générale',
    'Première visite'
FROM users u, hospitals h
WHERE u.email = 'patient@demo.sn' AND h.name = 'Hôpital Principal de Dakar (HPD)'
ON CONFLICT DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, action, entity_type, details)
SELECT 
    id,
    'LOGIN',
    'user',
    '{"ip": "127.0.0.1", "user_agent": "Mozilla/5.0"}'::jsonb
FROM users
WHERE email = 'admin@sunusante.sn'
ON CONFLICT DO NOTHING;
