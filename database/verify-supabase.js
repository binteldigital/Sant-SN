#!/usr/bin/env node
/**
 * Verify Supabase Database Setup
 */

const SUPABASE_URL = 'https://evxejazaxwuiqfdzruli.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGVqYXpheHd1aXFmZHpydWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMjMzOSwiZXhwIjoyMDg3Njk4MzM5fQ.3I7a30Us7UhbMaUPG6SzIYBB1Gmc2_PwpikRL6U8Pbs';

async function verifySetup() {
    console.log('🔍 Verifying Supabase Database Setup\n');
    console.log('=====================================\n');
    
    const tables = ['users', 'hospitals', 'pharmacies', 'doctors', 'appointments', 'medical_records', 'duty_pharmacy_schedules', 'system_settings', 'activity_logs'];
    
    for (const table of tables) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'apikey': SUPABASE_SERVICE_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const count = data.length;
                console.log(`✅ ${table}: ${count} rows`);
            } else if (response.status === 404) {
                console.log(`❌ ${table}: Table not found`);
            } else {
                console.log(`⚠️  ${table}: Error ${response.status}`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
    
    // Check users
    console.log('\n👤 Users:');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=email,role,full_name`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            users.forEach(user => {
                console.log(`   - ${user.email} (${user.role}) - ${user.full_name}`);
            });
        }
    } catch (err) {
        console.log('   Error fetching users');
    }
    
    // Check hospitals
    console.log('\n🏥 Hospitals:');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/hospitals?select=name,type`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            }
        });
        
        if (response.ok) {
            const hospitals = await response.json();
            hospitals.forEach(h => {
                console.log(`   - ${h.name} (${h.type})`);
            });
        }
    } catch (err) {
        console.log('   Error fetching hospitals');
    }
    
    // Check pharmacies
    console.log('\n💊 Pharmacies:');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/pharmacies?select=name,on_duty_status`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            }
        });
        
        if (response.ok) {
            const pharmacies = await response.json();
            pharmacies.forEach(p => {
                console.log(`   - ${p.name} ${p.on_duty_status ? '(🌙 ON DUTY)' : ''}`);
            });
        }
    } catch (err) {
        console.log('   Error fetching pharmacies');
    }
    
    console.log('\n✨ Verification complete!');
}

verifySetup().catch(console.error);
