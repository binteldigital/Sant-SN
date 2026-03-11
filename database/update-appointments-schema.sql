-- Update appointments table to make date and time optional
-- This allows patients to create appointment requests without specifying date/time

-- First, check current constraints
-- Make appointment_date nullable if it's not already
ALTER TABLE appointments 
    ALTER COLUMN appointment_date DROP NOT NULL;

-- Make appointment_time nullable if it's not already
ALTER TABLE appointments 
    ALTER COLUMN appointment_time DROP NOT NULL;

-- Add a comment to document the new workflow
COMMENT ON TABLE appointments IS 'Appointments table - Patients create requests without date/time, hospitals assign date/time when confirming';

-- Create index for pending appointments without dates (for hospital dashboard)
CREATE INDEX IF NOT EXISTS idx_appointments_pending_no_date 
    ON appointments(status, hospital_id) 
    WHERE status = 'pending' AND appointment_date IS NULL;
