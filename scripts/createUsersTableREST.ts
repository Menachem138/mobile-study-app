import fetch from 'node-fetch';

const SUPABASE_URL = 'https://shjwvwhijgehquuteekv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI';

async function createUsersTableREST() {
  try {
    // Create users table using direct SQL through REST API
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=headers-only'
      },
      body: JSON.stringify({
        query: `
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
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Error creating users table:', error);
      return;
    }

    console.log('Successfully created users table and inserted test user');

    // Verify the table was created by attempting to select from it
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    });

    if (!verifyResponse.ok) {
      console.error('Error verifying users table:', await verifyResponse.text());
      return;
    }

    const users = await verifyResponse.json();
    console.log('Successfully verified users table. Sample user:', users[0]);

  } catch (error) {
    console.error('Failed to create users table:', error);
  }
}

console.log('Starting users table setup with REST API...');
createUsersTableREST()
  .catch(console.error)
  .finally(() => process.exit());
