import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './app/navigation/AppNavigator';
import { RealtimeProvider } from './app/providers/RealtimeProvider';
import { RealtimeSyncProvider } from './app/providers/RealtimeSyncProvider';
import { RealtimeSyncTest } from './app/components/RealtimeSyncTest';
import { View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <RealtimeSyncProvider>
        <NavigationContainer>
          <RealtimeProvider>
            <View style={{ flex: 1 }}>
              <AppNavigator />
              {__DEV__ && <RealtimeSyncTest />}
            </View>
          </RealtimeProvider>
        </NavigationContainer>
      </RealtimeSyncProvider>
    </SafeAreaProvider>
  );
}
