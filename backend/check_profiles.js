const sql = require('./src/config/database');

async function checkProfiles() {
    try {
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `;
        console.log('Columns in profiles:', columns);

        // Check triggers
        const triggers = await sql`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'users' OR event_object_table = 'profiles';
    `;
        console.log('Triggers:', triggers);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProfiles();
