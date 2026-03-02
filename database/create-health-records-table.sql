-- Création de la table health_records (Carnet de Santé Numérique)

-- Table principale du carnet de santé
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token unique pour le QR code
    qr_code_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- 1. Informations d'identification
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    birth_place VARCHAR(200),
    sex VARCHAR(20),
    parent_guardian VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    health_id_number VARCHAR(50),
    
    -- 2. Antécédents médicaux
    personal_history TEXT,
    family_history TEXT,
    allergies TEXT,
    blood_group VARCHAR(10),
    chronic_diseases TEXT,
    
    -- 3. Informations administratives
    reference_health_center VARCHAR(200),
    health_region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'actif', -- actif / archive
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: un seul carnet par patient
    CONSTRAINT unique_health_record_per_user UNIQUE (user_id)
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_qr_token ON health_records(qr_code_token);

-- Table des vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
    
    vaccine_name VARCHAR(200) NOT NULL,
    dose VARCHAR(50),
    administration_date DATE,
    lot_number VARCHAR(100),
    health_center VARCHAR(200),
    health_agent VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaccinations_health_record ON vaccinations(health_record_id);

-- Table des notes médicales (ajoutées par les admins)
CREATE TABLE IF NOT EXISTS health_record_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id),
    
    note_title VARCHAR(200),
    note_content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- general, diagnostic, prescription, observation
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_notes_record ON health_record_notes(health_record_id);
CREATE INDEX IF NOT EXISTS idx_health_notes_admin ON health_record_notes(admin_id);

-- Table d'historique des scans QR (audit)
CREATE TABLE IF NOT EXISTS qr_scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
    scanned_by UUID NOT NULL REFERENCES users(id),
    
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_context VARCHAR(50), -- hospital_admin, super_admin, doctor
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_record ON qr_scan_history(health_record_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_admin ON qr_scan_history(scanned_by);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_records_updated_at 
    BEFORE UPDATE ON health_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at 
    BEFORE UPDATE ON vaccinations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_notes_updated_at 
    BEFORE UPDATE ON health_record_notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE health_records IS 'Carnet de santé numérique des patients';
COMMENT ON TABLE vaccinations IS 'Historique des vaccinations du patient';
COMMENT ON TABLE health_record_notes IS 'Notes médicales ajoutées par les professionnels de santé';
COMMENT ON TABLE qr_scan_history IS 'Historique des scans QR pour audit';
