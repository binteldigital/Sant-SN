-- Ajout de la colonne pin_code pour sécuriser le carnet de santé

-- Ajouter la colonne pin_code (4 chiffres)
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS pin_code VARCHAR(4);

-- Commentaire
COMMENT ON COLUMN health_records.pin_code IS 'Code PIN à 4 chiffres pour sécuriser l\'accès au carnet de santé';
