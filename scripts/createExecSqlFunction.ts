import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI'
);

async function createExecSqlFunction() {
  try {
    // Create the exec_sql function
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
      `
    });

    if (createError) {
      console.error('Error creating exec_sql function:', createError);
      return;
    }

    console.log('Successfully created exec_sql function');

    // Test the function by creating users table
    const { error: testError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          last_sign_in_at TIMESTAMPTZ,
          settings JSONB DEFAULT '{}'::jsonb
        );

        INSERT INTO public.users (id, email, last_sign_in_at)
        VALUES (
          'c7305344-40ea-430a-9909-6af0e40d05d9',
          'test@example.com',
          now()
        )
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (testError) {
      console.error('Error testing exec_sql function:', testError);
      return;
    }

    console.log('Successfully tested exec_sql function');

  } catch (error) {
    console.error('Failed to create exec_sql function:', error);
  }
}

console.log('Starting exec_sql function setup...');
createExecSqlFunction()
  .catch(console.error)
  .finally(() => process.exit());
