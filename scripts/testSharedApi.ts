import { supabase, tables } from '../app/api/supabaseClient';
import { Database } from '../app/types/database.types';

async function testSharedApi() {
  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'menmen138145@gmail.com',
      password: 'Tohmen4545@'
    });

    if (authError) throw authError;
    if (!user) throw new Error('No user returned after authentication');

    console.log('Authentication successful');
    const userId = user.id;

    // Test querying each table
    const tableTests = Object.entries(tables).map(async ([tableName, tableFunction]) => {
      try {
        const { data, error } = await tableFunction()
          .select('*')
          .eq('user_id', userId)
          .limit(1);

        if (error) throw error;

        console.log(`✓ ${tableName}: Successfully queried`);
        if (data && data.length > 0) {
          console.log(`  Sample data:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`  No data found`);
        }

        return true;
      } catch (error) {
        console.error(`✗ ${tableName}: Query failed:`, error);
        return false;
      }
    });

    // Test realtime subscriptions
    const channel = supabase.channel('test_realtime')
      .on('presence', { event: 'sync' }, () => {
        console.log('Realtime presence sync successful');
      })
      .on('presence', { event: 'join' }, ({ key, currentPresences }) => {
        console.log('Join event:', key, currentPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, currentPresences }) => {
        console.log('Leave event:', key, currentPresences);
      });

    // Subscribe to all tables for the current user
    Object.keys(tables).forEach(tableName => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log(`Realtime update for ${tableName}:`, payload);
        }
      );
    });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to all tables');
        
        // Test insert
        const { error: insertError } = await tables.timerSessions()
          .insert({
            user_id: userId,
            type: 'study',
            duration: 1500,
            started_at: new Date().toISOString(),
            ended_at: new Date(Date.now() + 1500000).toISOString()
          });

        if (insertError) {
          console.error('Test insert failed:', insertError);
        } else {
          console.log('Test insert successful');
        }
      }
    });

    // Wait for realtime events
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Cleanup
    channel.unsubscribe();
    await supabase.auth.signOut();

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testSharedApi();
