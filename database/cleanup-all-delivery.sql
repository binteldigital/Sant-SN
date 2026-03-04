-- Supprimer TOUTES les tables et éléments liés à la livraison de médicaments
-- Ancien système + nouveau système Glovo

-- Supprimer les tables dans l'ordre (respecter les dépendances)
DROP TABLE IF EXISTS prescription_orders CASCADE;
DROP TABLE IF EXISTS medication_order_items CASCADE;
DROP TABLE IF EXISTS medication_orders CASCADE;
DROP TABLE IF EXISTS delivery_tracking CASCADE;
DROP TABLE IF EXISTS delivery_reviews CASCADE;
DROP TABLE IF EXISTS pharmacy_order_items CASCADE;
DROP TABLE IF EXISTS pharmacy_orders CASCADE;
DROP TABLE IF EXISTS pharmacy_products CASCADE;
DROP TABLE IF EXISTS global_products CASCADE;

-- Supprimer les colonnes ajoutées aux tables existantes (si elles existent)
-- Note: PostgreSQL n'a pas de "DROP COLUMN IF EXISTS" avant la version 9.6
-- On utilise une approche différente

DO $$
BEGIN
    -- Supprimer la colonne delivery_person_id de users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'delivery_person_id') THEN
        ALTER TABLE users DROP COLUMN delivery_person_id;
    END IF;
    
    -- Supprimer la colonne is_online de users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'is_online') THEN
        ALTER TABLE users DROP COLUMN is_online;
    END IF;
    
    -- Supprimer la colonne current_location de users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'current_location') THEN
        ALTER TABLE users DROP COLUMN current_location;
    END IF;
    
    -- Supprimer la colonne vehicle_type de users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'vehicle_type') THEN
        ALTER TABLE users DROP COLUMN vehicle_type;
    END IF;
    
    -- Supprimer la colonne pharmacy_id de users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'pharmacy_id') THEN
        ALTER TABLE users DROP COLUMN pharmacy_id;
    END IF;
END $$;

-- Supprimer les types enum créés
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Nettoyer les utilisateurs avec les rôles delivery_person et pharmacist
-- (optionnel - décommenter si tu veux aussi supprimer ces comptes)
-- DELETE FROM users WHERE role IN ('delivery_person', 'pharmacist');

-- Vérification
SELECT 'Cleanup completed successfully' as status;
