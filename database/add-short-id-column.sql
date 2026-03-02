-- Ajout de la colonne short_id pour identifiant court (6 caractères)

-- Ajouter la colonne short_id
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS short_id VARCHAR(6) UNIQUE;

-- Créer un index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_health_records_short_id 
ON health_records(short_id);

-- Fonction pour générer un ID court unique
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_id VARCHAR(6);
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Générer un ID aléatoire de 6 caractères (chiffres + lettres majuscules)
        new_id := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
        
        -- Vérifier si l'ID existe déjà
        SELECT EXISTS(SELECT 1 FROM health_records WHERE short_id = new_id) INTO exists_check;
        
        -- Si l'ID n'existe pas, on le retourne
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour les enregistrements existants avec un short_id
UPDATE health_records 
SET short_id = generate_short_id()
WHERE short_id IS NULL;

-- Commentaire
COMMENT ON COLUMN health_records.short_id IS 'Identifiant court unique de 6 caractères pour accès rapide';
