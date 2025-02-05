import { useState, useEffect } from 'react';

type TimerMode = 'study' | 'break';

export function useTimer() {
  const [time, setTime] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('study');
  const [seconds, setSeconds] = useState(0);

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

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const stopTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };
  const toggleMode = () => setMode(prev => prev === 'study' ? 'break' : 'study');

  return {
    time,
    isRunning,
    mode,
    startTimer,
    pauseTimer,
    stopTimer,
    toggleMode,
  };
}
