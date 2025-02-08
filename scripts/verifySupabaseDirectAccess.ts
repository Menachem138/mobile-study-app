import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAccess() {
  try {
    console.log('Verifying Supabase access...');
    
    // Try to create users table directly with SQL
    const { data: createData, error: createError } = await supabase
      .from('_exec_sql')
      .select('*')
      .eq('query', `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `);

    if (createError) {
      console.log('Trying alternative method...');
      
      // Try direct SQL query
      const { data, error } = await supabase
        .rpc('postgres_query', {
          query_text: `
            CREATE TABLE IF NOT EXISTS public.users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              email TEXT UNIQUE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
            );
          `
        });

      if (error) {
        console.error('Error creating users table:', error);
        
        // Try to list existing tables
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        if (tablesError) {
          console.error('Error listing tables:', tablesError);
        } else {
          console.log('Existing tables:', tables);
        }
        
        return;
      }
      
      console.log('Table created successfully using postgres_query');
      return;
    }
    
    console.log('Table created successfully using _exec_sql');
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAccess();
