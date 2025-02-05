import React from 'react';
import { View, Text } from 'react-native';
import { Timer } from '../components/Timer';
import { MotivationBox } from '../components/MotivationBox';

export function HomeScreen() {
  return (
    <View>
      <Text>מעקב זמן למידה</Text>
      <Timer />
      <MotivationBox />
    </View>
  );
}
