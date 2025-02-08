import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../app/types/database.types';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseServiceKey);

async function testNotifications() {
  try {
    // Create a test user
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
      email: `test_${Date.now()}@example.com`,
      password: `Test${Date.now()}!`,
      email_confirm: true
    });

    if (userError) throw userError;

    // Test calendar event notification
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: 'Test Study Session',
        description: 'Testing push notifications',
        start_time: new Date(Date.now() + 60000).toISOString(),
        end_time: new Date(Date.now() + 3660000).toISOString(),
        is_all_day: false
      })
      .select()
      .single();

    if (eventError) throw eventError;
    console.log('Created test calendar event:', event);

    // Test timer session notification
    const { data: timer, error: timerError } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: user.id,
        type: 'study',
        duration: 300,
        started_at: new Date().toISOString(),
        ended_at: new Date(Date.now() + 300000).toISOString()
      })
      .select()
      .single();

    if (timerError) throw timerError;
    console.log('Created test timer session:', timer);

    // Test study goal notification
    const { data: goal, error: goalError } = await supabase
      .from('study_goals')
      .insert({
        user_id: user.id,
        title: 'Test Goal',
        description: 'Testing goal notifications',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        completed: false
      })
      .select()
      .single();

    if (goalError) throw goalError;
    console.log('Created test study goal:', goal);

    // Wait for 10 seconds to observe notifications
    console.log('\nWaiting for 10 seconds to observe notifications...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Cleanup test data
    console.log('\nCleaning up test data...');
    const tables = ['calendar_events', 'timer_sessions', 'study_goals'] as const;
    
    for (const table of tables) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error(`Error cleaning up ${table}:`, deleteError);
      } else {
        console.log(`Cleaned up ${table}`);
      }
    }

    // Delete test user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error('Error deleting test user:', deleteUserError);
    } else {
      console.log('Deleted test user');
    }

    console.log('\nNotification test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('Starting notification test...');
testNotifications();
