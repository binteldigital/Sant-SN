/**
 * Data Migration Script
 * Migrates static data from hospitals.js and pharmacies.js to PostgreSQL
 */

import pg from 'pg';
import { hospitals } from '../src/data/hospitals.js';
import { pharmacies } from '../src/data/pharmacies.js';

const { Pool } = pg;

// Database connection - use environment variables in production
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/sunusante',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateHospitals() {
    console.log('Migrating hospitals...');
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const hospital of hospitals) {
            const query = `
                INSERT INTO hospitals (
                    name, type, category, address, latitude, longitude,
                    location, district, department, phone, email, website,
                    description, services, image_urls, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                ON CONFLICT DO NOTHING
                RETURNING id
            `;
            
            const values = [
                hospital.name,
                hospital.type,
                hospital.category,
                hospital.address,
                hospital.coords.lat,
                hospital.coords.lng,
                hospital.location,
                hospital.district,
                hospital.department,
                hospital.phone,
                hospital.email,
                hospital.website,
                hospital.description,
                JSON.stringify([]), // services
                JSON.stringify([]), // image_urls
                true // is_active
            ];
            
            const result = await client.query(query, values);
            if (result.rows.length > 0) {
                console.log(`✓ Migrated hospital: ${hospital.name}`);
            }
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully migrated ${hospitals.length} hospitals`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating hospitals:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function migratePharmacies() {
    console.log('Migrating pharmacies...');
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const pharmacy of pharmacies) {
            const query = `
                INSERT INTO pharmacies (
                    name, pharmacist, address, latitude, longitude,
                    quartier, commune, district, department, phone,
                    email, website, on_duty_status, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT DO NOTHING
                RETURNING id
            `;
            
            const values = [
                pharmacy.name,
                pharmacy.pharmacist,
                pharmacy.address,
                pharmacy.coords.lat,
                pharmacy.coords.lng,
                pharmacy.quartier,
                pharmacy.commune,
                pharmacy.district,
                pharmacy.department,
                pharmacy.phone,
                pharmacy.email,
                pharmacy.website,
                false, // on_duty_status - will be managed dynamically
                true // is_active
            ];
            
            const result = await client.query(query, values);
            if (result.rows.length > 0) {
                console.log(`✓ Migrated pharmacy: ${pharmacy.name}`);
            }
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully migrated ${pharmacies.length} pharmacies`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error migrating pharmacies:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function seedSystemSettings() {
    console.log('Seeding system settings...');
    
    const client = await pool.connect();
    
    try {
        const defaultSettings = [
            {
                key: 'branding',
                value: {
                    primary_color: '#10b981', // Emerald green
                    secondary_color: '#059669',
                    app_name: 'Sunu Santé',
                    tagline: 'Santé à votre portée',
                    logo_url: null
                },
                description: 'Application branding and colors'
            },
            {
                key: 'hero_section',
                value: {
                    title: 'Trouvez un établissement de santé',
                    subtitle: 'Réservez votre rendez-vous en quelques clics',
                    background_image: null,
                    featured_hospitals: []
                },
                description: 'Homepage hero section content'
            },
            {
                key: 'features',
                value: {
                    enable_booking: true,
                    enable_sms: false,
                    enable_email: false,
                    enable_duty_pharmacy: true,
                    maintenance_mode: false
                },
                description: 'Feature toggles'
            },
            {
                key: 'emergency_contacts',
                value: {
                    samu: '1515',
                    police: '17',
                    fire: '18',
                    emergency: '112'
                },
                description: 'Emergency contact numbers'
            }
        ];
        
        await client.query('BEGIN');
        
        for (const setting of defaultSettings) {
            const query = `
                INSERT INTO system_settings (setting_key, setting_value, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (setting_key) DO NOTHING
            `;
            
            await client.query(query, [
                setting.key,
                JSON.stringify(setting.value),
                setting.description
            ]);
        }
        
        await client.query('COMMIT');
        console.log('✅ System settings seeded');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding settings:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function runMigration() {
    console.log('🚀 Starting data migration...\n');
    
    try {
        await migrateHospitals();
        console.log('');
        
        await migratePharmacies();
        console.log('');
        
        await seedSystemSettings();
        console.log('');
        
        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration();
}

export { migrateHospitals, migratePharmacies, seedSystemSettings };
