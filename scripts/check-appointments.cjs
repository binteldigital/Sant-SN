const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://evxejazaxwuiqfdzruli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGVqYXpheHd1aXFmZHpydWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5OTgwMTksImV4cCI6MjA1NDU3NDAxOX0.0n0pP3f8x6e0r9w0y2z4A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a7b8c9d0e1f2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .limit(3);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Appointments:');
    data.forEach((apt, i) => {
        console.log(`\n--- Appointment ${i + 1} ---`);
        console.log(`  ID: ${apt.id}`);
        console.log(`  user_id: ${apt.user_id}`);
        console.log(`  user_name: ${apt.user_name || 'NULL'}`);
        console.log(`  hospital_id: ${apt.hospital_id}`);
        console.log(`  hospital_name: ${apt.hospital_name || 'NULL'}`);
        console.log(`  specialty: ${apt.specialty}`);
        console.log(`  appointment_date: ${apt.appointment_date}`);
        console.log(`  status: ${apt.status}`);
    });
}

checkAppointments();
