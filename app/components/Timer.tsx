import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTimer } from '../hooks/useTimer';

export function Timer() {
  const { time, isRunning, mode, startTimer, pauseTimer, stopTimer, toggleMode } = useTimer();

  return (
    <View>
      <Text>{time}</Text>
      <View>
        <TouchableOpacity onPress={toggleMode}>
          <Text>{mode === 'study' ? 'למידה' : 'הפסקה'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={isRunning ? pauseTimer : startTimer}>
          <Text>{isRunning ? 'הפסקה' : mode === 'study' ? 'למידה' : 'הפסקה'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={stopTimer}>
          <Text>עצור</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
