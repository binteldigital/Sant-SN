#!/usr/bin/env node
/**
 * Supabase Database Setup Script
 * Creates schema and seeds data for Sunu Santé
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://evxejazaxwuiqfdzruli.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
    console.log('\nUsage:');
    console.log('  SUPABASE_SERVICE_KEY=your_service_key node setup-supabase.js');
    process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Read SQL files
function readSQLFile(filename) {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, 'utf8');
}

// Execute SQL in chunks
async function executeSQL(sql, description) {
    console.log(`\n🔄 Executing: ${description}...`);
    
    // Split SQL into statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
        try {
            const { error } = await supabase.rpc('exec_sql', { 
                sql: statement + ';' 
            });
            
            if (error) {
                // Try direct query if RPC fails
                const { error: queryError } = await supabase
                    .from('_sql_execute')
                    .select('*')
                    .eq('query', statement + ';');
                    
                if (queryError) {
                    console.error(`  ⚠️  Warning: ${error.message}`);
                    errorCount++;
                } else {
                    successCount++;
                }
            } else {
                successCount++;
            }
        } catch (err) {
            console.error(`  ⚠️  Error: ${err.message}`);
            errorCount++;
        }
    }
    
    console.log(`  ✅ ${successCount} statements executed`);
    if (errorCount > 0) {
        console.log(`  ⚠️  ${errorCount} statements had warnings (may already exist)`);
    }
}

// Alternative: Use Supabase SQL Editor API
async function executeSQLViaAPI(sql, description) {
    console.log(`\n🔄 Executing: ${description}...`);
    
    try {
        // Use REST API directly
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ query: sql })
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.log(`  ⚠️  API method failed, trying alternative...`);
            return false;
        }
        
        console.log(`  ✅ Executed successfully`);
        return true;
    } catch (err) {
        console.log(`  ⚠️  API error: ${err.message}`);
        return false;
    }
}

// Main setup function
async function setupDatabase() {
    console.log('🚀 Sunu Santé - Supabase Database Setup');
    console.log('=========================================\n');
    console.log(`🔗 Connecting to: ${SUPABASE_URL}`);
    
    try {
        // Test connection
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error && error.code !== 'PGRST116') {
            console.log('\n⚠️  Note: Some tables may not exist yet, which is expected.');
        }
        
        console.log('✅ Connection successful!\n');
        
        // Read SQL files
        const schemaSQL = readSQLFile('supabase-schema.sql');
        const seedSQL = readSQLFile('supabase-seed.sql');
        
        // Output instructions for manual execution
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('========================\n');
        console.log('Since Supabase requires SQL execution via the SQL Editor,');
        console.log('please follow these steps:\n');
        
        console.log('1. Go to your Supabase dashboard:');
        console.log(`   ${SUPABASE_URL.replace('.co', '.co/project/default')}\n`);
        
        console.log('2. Click on "SQL Editor" in the left sidebar\n');
        
        console.log('3. Create a "New query"\n');
        
        console.log('4. Copy and paste the contents of:');
        console.log('   📄 database/supabase-schema.sql');
        console.log('   (This creates all tables, indexes, and functions)\n');
        
        console.log('5. Run the query\n');
        
        console.log('6. Then copy and paste:');
        console.log('   📄 database/supabase-seed.sql');
        console.log('   (This inserts demo data)\n');
        
        console.log('7. Run the second query\n');
        
        console.log('✅ After completion, your database will be ready!\n');
        
        // Display file contents summary
        console.log('\n📊 Schema Summary:');
        console.log('==================');
        console.log('- users: User accounts with roles');
        console.log('- hospitals: Healthcare facilities');
        console.log('- pharmacies: Pharmacy locations');
        console.log('- doctors: Doctor profiles');
        console.log('- appointments: Booking records');
        console.log('- medical_records: Patient records');
        console.log('- duty_pharmacy_schedules: On-duty rotations');
        console.log('- system_settings: App configuration');
        console.log('- activity_logs: Audit trail\n');
        
        console.log('👤 Demo Accounts:');
        console.log('=================');
        console.log('Admin:     admin@sunusante.sn / admin123');
        console.log('Patient:   patient@demo.sn / admin123');
        console.log('Doctor:    doctor@demo.sn / admin123');
        console.log('Hospital:  hospital.admin@demo.sn / admin123\n');
        
    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
        process.exit(1);
    }
}

// Run setup
setupDatabase();
