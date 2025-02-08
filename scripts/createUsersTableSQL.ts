import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI'
);

async function createUsersTableSQL() {
  try {
    // Create users table using direct SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          last_sign_in_at TIMESTAMPTZ,
          settings JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (createError) {
      console.error('Error creating users table:', createError);
      return;
    }

    console.log('Successfully created users table');

    // Insert test user if not exists
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.users (id, email, last_sign_in_at)
        VALUES (
          'c7305344-40ea-430a-9909-6af0e40d05d9',
          'test@example.com',
          now()
        )
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (insertError) {
      console.error('Error inserting test user:', insertError);
      return;
    }

    console.log('Successfully inserted/updated test user');

  } catch (error) {
    console.error('Failed to create users table:', error);
  }
}

console.log('Starting users table setup with SQL...');
createUsersTableSQL()
  .catch(console.error)
  .finally(() => process.exit());
