import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shjwvwhijgehquuteekv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSPolicies() {
  try {
    // Test read access with service role key
    const { data: testData, error: testError } = await supabase
      .from('calendar_events')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Error testing calendar_events access:', testError);
      return;
    }

    // Test write access with service role key
    const { data: insertData, error: insertError } = await supabase
      .from('calendar_events')
      .insert({
        user_id: 'c7305344-40ea-430a-9909-6af0e40d05d9',
        title: 'Test Event',
        description: 'Testing service role access',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString()
      })
      .select();

    if (insertError) {
      console.error('Error testing calendar_events insert:', insertError);
      return;
    }

    console.log('Successfully verified service role access');

    // Now test with anon key
    const anonClient = createClient(supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '');

    const { data: anonData, error: anonError } = await anonClient
      .from('calendar_events')
      .select('*')
      .eq('user_id', 'c7305344-40ea-430a-9909-6af0e40d05d9')
      .limit(1);

    if (anonError) {
      console.error('Error testing anon key access:', anonError);
    } else {
      console.log('Successfully tested anon key access');
    }

    console.log('Database access verification complete');
    process.exit(0);
  } catch (error) {
    console.error('Failed to verify database access:', error);
    process.exit(1);
  }
}

console.log('Starting database access verification...');
setupRLSPolicies();
