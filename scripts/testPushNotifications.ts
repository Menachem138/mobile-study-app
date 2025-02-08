import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Constants from 'expo-constants';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPushNotifications() {
  try {
    console.log('Testing push notification setup...');
    
    // Check environment
    console.log('Environment:', {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PROJECT_ID: process.env.EXPO_PROJECT_ID,
      projectId: 'study-time-manager'
    });

    // Verify notifications table exists
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%notification%';
      `
    });

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    console.log('Notification-related tables:', tables);

    // Test creating a notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: 'test-user',
        title: 'Test Notification',
        body: 'Testing push notification system',
        type: 'test',
        status: 'pending'
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating test notification:', notificationError);
      return;
    }

    console.log('Test notification created:', notification);

    // Verify endpoint
    try {
      const response = await fetch('https://01rzkeg-menachems-8081.exp.direct');
      console.log('Endpoint status:', response.status);
    } catch (error) {
      console.error('Error checking endpoint:', error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPushNotifications();
