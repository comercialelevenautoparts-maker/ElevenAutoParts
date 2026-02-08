require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkProfiles() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            console.log('Profiles data (first row):', data);
            if (data && data.length > 0) {
                console.log('Keys:', Object.keys(data[0]));
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkProfiles();
