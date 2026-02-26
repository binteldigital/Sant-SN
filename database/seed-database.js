/**
 * Database Seed Script
 * Creates initial admin user and seeds essential data
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedAdminUser() {
    console.log('Creating admin user...');
    
    const client = await pool.connect();
    
    try {
        // Check if admin already exists
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const checkResult = await client.query(checkQuery, ['admin@sunusante.sn']);
        
        if (checkResult.rows.length > 0) {
            console.log('✓ Admin user already exists');
            return;
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        // Create admin user
        const query = `
            INSERT INTO users (
                email, password_hash, role, full_name, phone, 
                is_active, email_verified, phone_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        
        const values = [
            'admin@sunusante.sn',
            passwordHash,
            'super_admin',
            'Administrateur Demo',
            '+221 77 123 45 67',
            true,
            true,
            true
        ];
        
        const result = await client.query(query, values);
        console.log('✅ Admin user created with ID:', result.rows[0].id);
        console.log('   Email: admin@sunusante.sn');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function seedDemoUsers() {
    console.log('Creating demo users...');
    
    const client = await pool.connect();
    
    try {
        const demoUsers = [
            {
                email: 'patient@demo.sn',
                password: 'patient123',
                role: 'patient',
                full_name: 'Amadou Diallo',
                phone: '+221 77 111 11 11'
            },
            {
                email: 'doctor@demo.sn',
                password: 'doctor123',
                role: 'doctor',
                full_name: 'Dr. Fatou Ndiaye',
                phone: '+221 77 222 22 22'
            },
            {
                email: 'hospital.admin@demo.sn',
                password: 'admin123',
                role: 'hospital_admin',
                full_name: 'Moussa Sow',
                phone: '+221 77 333 33 33'
            }
        ];
        
        for (const user of demoUsers) {
            // Check if user exists
            const checkQuery = 'SELECT * FROM users WHERE email = $1';
            const checkResult = await client.query(checkQuery, [user.email]);
            
            if (checkResult.rows.length > 0) {
                console.log(`✓ User ${user.email} already exists`);
                continue;
            }
            
            const passwordHash = await bcrypt.hash(user.password, 10);
            
            const query = `
                INSERT INTO users (
                    email, password_hash, role, full_name, phone,
                    is_active, email_verified, phone_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            await client.query(query, [
                user.email,
                passwordHash,
                user.role,
                user.full_name,
                user.phone,
                true,
                true,
                true
            ]);
            
            console.log(`✅ Created ${user.role}: ${user.email} / ${user.password}`);
        }
        
    } catch (error) {
        console.error('❌ Error creating demo users:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function runSeed() {
    console.log('🚀 Starting database seeding...\n');
    
    try {
        await seedAdminUser();
        console.log('');
        
        await seedDemoUsers();
        console.log('');
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('   Admin:    admin@sunusante.sn / admin123');
        console.log('   Patient:  patient@demo.sn / patient123');
        console.log('   Doctor:   doctor@demo.sn / doctor123');
        console.log('   Hospital: hospital.admin@demo.sn / admin123');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runSeed();
}

export { seedAdminUser, seedDemoUsers };
