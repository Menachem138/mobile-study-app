import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '../app/types/database.types';
import dotenv from 'dotenv';

dotenv.config();

// Use service role key for testing
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseKey);

interface TestUser {
  id: string;
  email: string;
  user_metadata?: {
    name: string;
  };
}

async function testRealtimeSync(): Promise<void> {
  let channel: RealtimeChannel | null = null;
  let userId: string | null = null;

  try {
    // Set up realtime subscription
    channel = supabase.channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public'
        },
        (payload) => {
          console.log('\nRealtime change received:', {
            table: payload.table,
            event: payload.eventType,
            data: payload.new || payload.old
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Create a test user with a temporary random password
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    const testPassword = `temp_${timestamp}_${Math.random().toString(36).slice(2)}`;
    
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: {
        name: 'Temporary Test User'
      },
      email_confirm: true
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('Failed to create test user');

    userId = user.id;

    // Test timer_sessions table
    const { data: timerSession, error: timerError } = await supabase
      .from('timer_sessions')
      .insert([{
        user_id: userId,
        duration: 1500,
        type: 'study',
        started_at: new Date().toISOString(),
        ended_at: new Date(Date.now() + 1500000).toISOString()
      }])
      .select()
      .single();

    if (timerError) throw timerError;
    console.log('Created timer session:', timerSession);

    // Test calendar_events table
    const { data: calendarEvent, error: calendarError } = await supabase
      .from('calendar_events')
      .insert([{
        user_id: userId,
        title: 'Test Event',
        description: 'Test event for realtime sync',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        is_all_day: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (calendarError) {
      console.error('Error creating calendar event:', calendarError);
    } else {
      console.log('Created calendar event:', calendarEvent);
    }

    // Test content_items table
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .insert([{
        user_id: userId,
        type: 'note',
        content: 'Test content for realtime sync',
        file_path: null,
        file_name: null,
        file_size: null,
        mime_type: null,
        starred: false,
        created_at: new Date().toISOString(),
        cloudinary_public_id: null,
        cloudinary_url: null,
        title: 'Test Content'
      }])
      .select()
      .single();

    if (contentError) {
      console.error('Error creating content item:', contentError);
    } else {
      console.log('Created content item:', contentItem);
    }

    // Test questions table
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert([{
        user_id: userId,
        content: 'Test question for realtime sync',
        type: 'general',
        is_answered: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (questionError) throw questionError;
    console.log('Created question:', question);

    // Test study_goals table
    const { data: studyGoal, error: studyGoalError } = await supabase
      .from('study_goals')
      .insert([{
        user_id: userId,
        title: 'Test Study Goal',
        description: 'Test goal for realtime sync',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        completed: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (studyGoalError) {
      console.error('Error creating study goal:', studyGoalError);
    } else {
      console.log('Created study goal:', studyGoal);
    }

    // Test user_profiles table update (since it's created automatically)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        username: `test_${Date.now()}`,
        learning_goals: {
          daily: { time: 120, unit: 'minutes' },
          monthly: { articles: 10 }
        },
        theme: 'light',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    } else {
      console.log('Updated user profile:', userProfile);
    }

    // Test timer_daily_summaries table
    const { data: timerSummary, error: summaryError } = await supabase
      .from('timer_daily_summaries')
      .insert([{
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        total_study_time: 3600,
        total_break_time: 600,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (summaryError) {
      console.error('Error creating timer summary:', summaryError);
    } else {
      console.log('Created timer summary:', timerSummary);
    }

    // Wait for 10 seconds to observe realtime updates
    console.log('\nWaiting for 10 seconds to observe realtime updates...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test updates
    if (studyGoal) {
      const { error: updateError } = await supabase
        .from('study_goals')
        .update({ completed: true })
        .eq('id', studyGoal.id);

      if (updateError) {
        console.error('Error updating study goal:', updateError);
      } else {
        console.log('Updated study goal completed status');
      }
    }

    // Wait for update to sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Cleanup test data
    const tables: Array<keyof Database['public']['Tables']> = [
      'timer_sessions',
      'calendar_events',
      'content_items',
      'questions',
      'study_goals',
      'timer_daily_summaries',
      'user_profiles'
    ];

    console.log('\nCleaning up test data...');
    for (const table of tables) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq(table === 'user_profiles' ? 'id' : 'user_id', userId);

      if (deleteError) {
        console.error(`Error cleaning up ${table}:`, deleteError);
      } else {
        console.log(`Cleaned up ${table}`);
      }
    }

    // Delete test user
    if (userId) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteUserError) {
        console.error('Error deleting test user:', deleteUserError);
      } else {
        console.log('Deleted test user');
      }
    }

    // Cleanup channel subscription
    if (channel) {
      channel.unsubscribe();
    }
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    // Cleanup on error
    if (userId) {
      await supabase.auth.admin.deleteUser(userId).catch(console.error);
    }
    if (channel) {
      channel.unsubscribe();
    }
  }
}

// Run the test
console.log('Starting realtime sync test...');
testRealtimeSync();
