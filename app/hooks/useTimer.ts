import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TimerMode = 'study' | 'break';

interface TimerHistory {
  date: string;
  mode: TimerMode;
  duration: number;
}

export function useTimer() {
  const [time, setTime] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('study');
  const [seconds, setSeconds] = useState(0);
  const [history, setHistory] = useState<TimerHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    setTime(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    );
  }, [seconds]);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('timerHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading timer history:', error);
    }
  };

  const saveHistory = async (newHistory: TimerHistory[]) => {
    try {
      await AsyncStorage.setItem('timerHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving timer history:', error);
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  
  const stopTimer = async () => {
    if (seconds > 0) {
      const newEntry: TimerHistory = {
        date: new Date().toISOString(),
        mode,
        duration: seconds,
      };
      const updatedHistory = [...history, newEntry];
      await saveHistory(updatedHistory);
    }
    setIsRunning(false);
    setSeconds(0);
  };

  const toggleMode = () => {
    if (isRunning) {
      stopTimer();
    }
    setMode(prev => prev === 'study' ? 'break' : 'study');
  };

  const getDailyStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return history.filter(entry => entry.date.startsWith(today));
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return history.filter(entry => new Date(entry.date) >= oneWeekAgo);
  };

  const getMonthlyStats = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return history.filter(entry => new Date(entry.date) >= oneMonthAgo);
  };

  return {
    time,
    isRunning,
    mode,
    startTimer,
    pauseTimer,
    stopTimer,
    toggleMode,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    history,
  };
}
