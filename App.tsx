import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AppNavigator } from './app/navigation/AppNavigator';
import { RealtimeProvider } from './app/providers/RealtimeProvider';
import { RealtimeSyncProvider } from './app/providers/RealtimeSyncProvider';
import { NotificationProvider } from './app/providers/NotificationProvider';
import { RealtimeSyncTest } from './app/components/RealtimeSyncTest';
import { NotificationTest } from './app/components/NotificationTest';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <RealtimeSyncProvider>
        <NotificationProvider>
          <NavigationContainer>
            <RealtimeProvider>
              <View style={{ flex: 1 }}>
                <AppNavigator />
                {__DEV__ && (
                  <>
                    <RealtimeSyncTest />
                    <NotificationTest />
                  </>
                )}
              </View>
            </RealtimeProvider>
          </NavigationContainer>
        </NotificationProvider>
      </RealtimeSyncProvider>
    </SafeAreaProvider>
  );
}
