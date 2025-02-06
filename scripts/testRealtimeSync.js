const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key for testing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRealtimeSync() {
  try {
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

    // Wait for 5 seconds to observe realtime updates
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Cleanup test data
    const tables = ['timer_sessions', 'calendar_events', 'content_items', 'questions'];
    for (const table of tables) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id)
        .gt('created_at', new Date(Date.now() - 60000).toISOString());

      if (deleteError) {
        console.error(`Error cleaning up ${table}:`, deleteError);
      }
    }

    // Delete test user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error('Error deleting test user:', deleteUserError);
    }

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Starting realtime sync test...');
testRealtimeSync();
