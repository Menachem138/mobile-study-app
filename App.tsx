import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './app/navigation/AppNavigator';
import { RealtimeProvider } from './app/providers/RealtimeProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RealtimeProvider>
          <AppNavigator />
        </RealtimeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
