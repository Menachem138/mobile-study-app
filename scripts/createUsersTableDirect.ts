import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI@db.shjwvwhijgehquuteekv.supabase.co:5432/postgres'
});

async function createUsersTableDirect() {
  try {
    await client.connect();

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        last_sign_in_at TIMESTAMPTZ,
        settings JSONB DEFAULT '{}'::jsonb
      );
    `);

    console.log('Successfully created users table');

    // Insert test user if not exists
    await client.query(`
      INSERT INTO public.users (id, email, last_sign_in_at)
      VALUES (
        'c7305344-40ea-430a-9909-6af0e40d05d9',
        'test@example.com',
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Successfully inserted/updated test user');

    // Verify the table was created
    const { rows } = await client.query('SELECT * FROM public.users LIMIT 1');
    console.log('Successfully verified users table. Sample user:', rows[0]);

  } catch (error) {
    console.error('Failed to create users table:', error);
  } finally {
    await client.end();
  }
}

console.log('Starting users table setup with direct PostgreSQL connection...');
createUsersTableDirect()
  .catch(console.error)
  .finally(() => process.exit());
