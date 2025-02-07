import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI'
);

async function createUsersTable() {
  try {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'users',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        last_sign_in_at TIMESTAMPTZ,
        settings JSONB DEFAULT '{}'::jsonb
      `
    });

    if (error) {
      console.error('Error creating users table:', error);
      return;
    }

    console.log('Successfully created users table');

    // Insert test user if not exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select()
      .eq('id', 'c7305344-40ea-430a-9909-6af0e40d05d9')
      .single();

    if (!existingUser && !selectError) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: 'c7305344-40ea-430a-9909-6af0e40d05d9',
          email: 'test@example.com',
          last_sign_in_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting test user:', insertError);
        return;
      }

      console.log('Successfully inserted test user');
    }

  } catch (error) {
    console.error('Failed to create users table:', error);
  }
}

console.log('Starting users table setup...');
createUsersTable()
  .catch(console.error)
  .finally(() => process.exit());
