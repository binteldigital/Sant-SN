const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://evxejazaxwuiqfdzruli.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGVqYXpheHd1aXFmZHpydWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5OTgwMTksImV4cCI6MjA1NDU3NDAxOX0.0n0pP3f8x6e0r9w0y2z4A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a7b8c9d0e1f2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHospitals() {
    const { data, error } = await supabase
        .from('hospitals')
        .select('id, name')
        .limit(5);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Hospitals:');
    data.forEach(h => {
        console.log(`  ID: ${h.id} (${typeof h.id}) - Name: ${h.name}`);
    });
}

checkHospitals();
