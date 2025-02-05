import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTimer } from '../hooks/useTimer';

export function Timer() {
  const { time, isRunning, mode, startTimer, pauseTimer, stopTimer, toggleMode } = useTimer();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>מעקב זמן למידה</Text>
      <Text style={styles.timerText}>{time}</Text>
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.stopButton]}
          onPress={stopTimer}>
          <Text style={styles.buttonText}>עצור</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.breakButton]}
          onPress={toggleMode}>
          <Text style={styles.buttonText}>הפסקה</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.studyButton]}
          onPress={isRunning ? pauseTimer : startTimer}>
          <Text style={styles.buttonText}>למידה</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.secondaryControlsContainer}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>יומן</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>סיכום</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'right',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 24,
  },
  controlsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FFB5B5',
  },
  breakButton: {
    backgroundColor: '#D3D3D3',
  },
  studyButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryControlsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
