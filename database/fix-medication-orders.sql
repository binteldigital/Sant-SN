-- Ajouter les colonnes manquantes à medication_orders
ALTER TABLE medication_orders 
ADD COLUMN IF NOT EXISTS delivery_person_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Désactiver RLS pour les tests
ALTER TABLE medication_orders DISABLE ROW LEVEL SECURITY;
