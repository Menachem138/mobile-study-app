import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useTimer } from '../hooks/useTimer';

type StatsView = 'daily' | 'weekly' | 'monthly';

export function Timer() {
  const { 
    time, 
    isRunning, 
    mode, 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    toggleMode,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats 
  } = useTimer();
  const [statsView, setStatsView] = useState<StatsView>('daily');

  const getStats = () => {
    switch (statsView) {
      case 'daily':
        return getDailyStats();
      case 'weekly':
        return getWeeklyStats();
      case 'monthly':
        return getMonthlyStats();
    }
  };

  const calculateTotalTime = (entries: ReturnType<typeof getDailyStats>) => {
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ש ${minutes}ד`;
  };

  const stats = getStats();
  const studyTime = calculateTotalTime(stats.filter(entry => entry.mode === 'study'));
  const breakTime = calculateTotalTime(stats.filter(entry => entry.mode === 'break'));

  return (
    <ScrollView style={styles.scrollContainer}>
      <LinearGradient
        colors={mode === 'study' ? ['#E3F2FD', '#BBDEFB'] : ['#FCE4EC', '#F8BBD0']}
        style={styles.container}
      >
        <Text style={styles.title}>מעקב זמן {mode === 'study' ? 'למידה' : 'הפסקה'}</Text>
        <Text style={[styles.timerText, { color: mode === 'study' ? '#1976D2' : '#C2185B' }]}>
          {time}
        </Text>
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]}
            onPress={stopTimer}>
            <Text style={styles.buttonText}>עצור</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, mode === 'break' ? styles.activeBreakButton : styles.breakButton]}
            onPress={toggleMode}>
            <Text style={styles.buttonText}>הפסקה</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, mode === 'study' ? styles.activeStudyButton : styles.studyButton]}
            onPress={isRunning ? pauseTimer : startTimer}>
            <Text style={styles.buttonText}>{isRunning ? 'השהה' : 'התחל'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <TouchableOpacity 
              style={[styles.statsButton, statsView === 'monthly' && styles.activeStatsButton]}
              onPress={() => setStatsView('monthly')}>
              <Text style={styles.statsButtonText}>חודשי</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statsButton, statsView === 'weekly' && styles.activeStatsButton]}
              onPress={() => setStatsView('weekly')}>
              <Text style={styles.statsButtonText}>שבועי</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statsButton, statsView === 'daily' && styles.activeStatsButton]}
              onPress={() => setStatsView('daily')}>
              <Text style={styles.statsButtonText}>יומי</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>זמן למידה</Text>
              <Text style={[styles.statValue, { color: '#1976D2' }]}>{formatTotalTime(studyTime)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>זמן הפסקה</Text>
              <Text style={[styles.statValue, { color: '#C2185B' }]}>{formatTotalTime(breakTime)}</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: '#1976D2',
                      width: `${(studyTime / (studyTime + breakTime || 1)) * 100}%`
                    }
                  ]} 
                />
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: '#C2185B',
                      width: `${(breakTime / (studyTime + breakTime || 1)) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    minHeight: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'right',
    color: '#263238',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 24,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    backgroundColor: '#F8BBD0',
  },
  activeBreakButton: {
    backgroundColor: '#C2185B',
  },
  studyButton: {
    backgroundColor: '#BBDEFB',
  },
  activeStudyButton: {
    backgroundColor: '#1976D2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeStatsButton: {
    backgroundColor: '#263238',
  },
  statsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  statsContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#263238',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartBars: {
    gap: 12,
  },
  barContainer: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
});
