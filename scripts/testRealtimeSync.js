const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key for testing
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtimeSync() {
  try {
    // Set up realtime subscription
    const channel = supabase.channel('db-changes')
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

    // Test timer_sessions table
    const { data: timerSession, error: timerError } = await supabase
      .from('timer_sessions')
      .insert([{
        user_id: user.id,
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
        user_id: user.id,
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
        user_id: user.id,
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
        user_id: user.id,
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
        user_id: user.id,
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
      .eq('id', user.id)
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
        user_id: user.id,
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
    const tables = [
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
        .eq(table === 'user_profiles' ? 'id' : 'user_id', user.id);

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

    // Cleanup channel subscription
    channel.unsubscribe();
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Starting realtime sync test...');
testRealtimeSync();
