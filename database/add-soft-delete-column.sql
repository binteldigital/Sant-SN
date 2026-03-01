-- Ajouter les colonnes pour le soft delete des rendez-vous par le patient

-- Ajouter la colonne deleted_by_patient
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_by_patient BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne deleted_at pour traçabilité
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_by_patient 
ON appointments(deleted_by_patient);

-- Mettre à jour la politique RLS pour permettre aux admins de voir tous les RDV
-- même ceux supprimés par le patient

COMMENT ON COLUMN appointments.deleted_by_patient IS 'Indique si le patient a supprimé ce RDV de sa vue';
COMMENT ON COLUMN appointments.deleted_at IS 'Date de suppression par le patient';
