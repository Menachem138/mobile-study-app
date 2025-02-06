import { createClient } from '@supabase/supabase-js';
import { Database } from '../app/types/database.types';

const supabase = createClient<Database>(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc3NTAxNSwiZXhwIjoyMDQ5MzUxMDE1fQ.KTTyuF4MarEm0YCCvsTca5geQLc6RfeSb1pVfz-92QI'
);

const tables = [
  'achievements',
  'calendar_events',
  'chat_messages',
  'content_items',
  'course_progress',
  'documents',
  'learning_journal',
  'library_items',
  'notifications',
  'progress_tracking',
  'questions',
  'schedules',
  'study_goals',
  'timer_daily_summaries',
  'timer_sessions',
  'tweets',
  'user_profiles',
  'user_stats',
  'youtube_videos'
];

async function verifyDatabaseAccess() {
  try {
    console.log('Starting database verification...\n');

    // Create a test user
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: `test_${Date.now()}@example.com`,
      password: `Test${Date.now()}!`,
      email_confirm: true
    });

    if (createError) throw createError;
    if (!user) throw new Error('Failed to create test user');

    console.log('Successfully created test user:', user.email);

    // Test each table
    for (const table of tables) {
      try {
        console.log(`\nTesting table: ${table}`);
        
        // Try to insert a test record
        const { data: insertData, error: insertError } = await supabase
          .from(table)
          .insert({
            user_id: user.id,
            // Add required fields based on table
            ...(table === 'timer_sessions' && {
              type: 'study',
              duration: 1500,
              started_at: new Date().toISOString(),
              ended_at: new Date(Date.now() + 1500000).toISOString()
            }),
            ...(table === 'user_profiles' && {
              username: `test_${Date.now()}`,
              preferences: {},
              theme: 'light'
            }),
            ...(table === 'questions' && {
              content: 'Test question',
              is_answered: false,
              type: 'general'
            })
          })
          .select()
          .single();

        if (insertError) {
          console.log(`  ✗ Insert failed:`, insertError.message);
        } else {
          console.log(`  ✓ Insert successful`);
          console.log(`  Sample record:`, insertData);
        }

        // Test realtime subscription
        const channel = supabase.channel(`${table}_test`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log(`  ✓ Realtime update received for ${table}:`, payload);
            }
          );

        await channel.subscribe((status) => {
          console.log(`  ${status === 'SUBSCRIBED' ? '✓' : '✗'} Realtime subscription status:`, status);
        });

        // Wait briefly for subscription to establish
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Cleanup subscription
        channel.unsubscribe();

      } catch (error) {
        console.error(`  ✗ Error testing ${table}:`, error);
      }
    }

    console.log('\nDatabase verification completed');
    
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyDatabaseAccess();
