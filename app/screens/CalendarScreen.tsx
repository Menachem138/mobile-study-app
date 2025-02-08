import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from '../components/Calendar';
import { AddTaskModal } from '../components/AddTaskModal';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type ViewMode = 'day' | 'week' | 'month';
type UrgencyLevel = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  estimatedTime: number; // in minutes
  urgencyLevel: UrgencyLevel;
  completed: boolean;
}

export function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const urgencyColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#F44336'
  };

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const scheduleTaskNotification = async (taskId: string, title: string, dueDate: string) => {
    const notificationDate = new Date(dueDate);
    notificationDate.setHours(notificationDate.getHours() - 1); // Notify 1 hour before

    if (notificationDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'תזכורת למשימה',
          body: `המשימה "${title}" מתחילה בעוד שעה`,
          data: { taskId },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: notificationDate
        },
      });
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    await saveTasks([...tasks, newTask]);
    await scheduleTaskNotification(newTask.id, newTask.title, newTask.dueDate);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#E8EAF6', '#C5CAE9']}
        style={styles.header}
      >
        <Text style={styles.title}>לוח שנה ומשימות</Text>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
            onPress={() => setViewMode('month')}>
            <Text style={styles.viewModeText}>חודש</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
            onPress={() => setViewMode('week')}>
            <Text style={styles.viewModeText}>שבוע</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
            onPress={() => setViewMode('day')}>
            <Text style={styles.viewModeText}>יום</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.calendarContainer}>
        <Calendar
          tasks={tasks}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          viewMode={viewMode}
        />
      </View>

      <View style={styles.tasksContainer}>
        <View style={styles.tasksHeader}>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={() => setIsAddTaskModalVisible(true)}
          >
            <Text style={styles.addTaskButtonText}>+ משימה חדשה</Text>
          </TouchableOpacity>
          <Text style={styles.tasksTitle}>משימות</Text>
        </View>

        {tasks.map(task => (
          <View key={task.id} style={styles.taskItem}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(task.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.taskContent, task.completed && styles.completedTask]}
              onPress={() => toggleTaskCompletion(task.id)}
            >
              <View style={[styles.urgencyIndicator, { backgroundColor: urgencyColors[task.urgencyLevel] }]} />
              <View style={styles.taskDetails}>
                <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
                  {task.title}
                </Text>
                <Text style={styles.taskInfo}>
                  {new Date(task.dueDate).toLocaleDateString('he-IL')} | {task.estimatedTime} דקות
                </Text>
              </View>
              <Text style={styles.checkbox}>{task.completed ? '✓' : '☐'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <AddTaskModal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        onSubmit={addTask}
      />
    </ScrollView>
  );

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'right',
    color: '#1A237E',
    marginBottom: 16,
  },
  viewModeContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeViewMode: {
    backgroundColor: '#FFFFFF',
  },
  viewModeText: {
    fontSize: 16,
    color: '#1A237E',
    fontWeight: '500',
  },
  calendarContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
  },
  tasksContainer: {
    margin: 16,
    marginTop: 0,
  },
  tasksHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
  },
  addTaskButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
  },
  completedTask: {
    backgroundColor: '#F5F5F5',
  },
  urgencyIndicator: {
    width: 8,
    height: '100%',
    borderRadius: 4,
    marginLeft: 12,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
    textAlign: 'right',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#78909C',
  },
  taskInfo: {
    fontSize: 14,
    color: '#78909C',
    textAlign: 'right',
  },
  checkbox: {
    fontSize: 20,
    color: '#3F51B5',
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
});
