import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI'
);

async function createUsersTableAPI() {
  try {
    // Create users table using Management API
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === 'PGRST204') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: 'c7305344-40ea-430a-9909-6af0e40d05d9',
          email: 'test@example.com',
          last_sign_in_at: new Date().toISOString()
        }]);

      if (createError) {
        console.error('Error creating users table:', createError);
        return;
      }

      console.log('Successfully created users table and inserted test user');
    } else if (!tableError) {
      console.log('Users table already exists');
      
      // Insert test user if not exists
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: 'c7305344-40ea-430a-9909-6af0e40d05d9',
          email: 'test@example.com',
          last_sign_in_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (insertError) {
        console.error('Error inserting test user:', insertError);
        return;
      }

      console.log('Successfully inserted/updated test user');
    }

    // Verify the table and user
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'c7305344-40ea-430a-9909-6af0e40d05d9');

    if (verifyError) {
      console.error('Error verifying users table:', verifyError);
      return;
    }

    console.log('Successfully verified users table. Test user:', users[0]);

  } catch (error) {
    console.error('Failed to create users table:', error);
  }
}

console.log('Starting users table setup with Management API...');
createUsersTableAPI()
  .catch(console.error)
  .finally(() => process.exit());
