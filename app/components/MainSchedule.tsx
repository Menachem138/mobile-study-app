import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { AndroidNativeProps } from '@react-native-community/datetimepicker';

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'study' | 'break';
  lessonId?: string;
}

export function MainSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedType, setSelectedType] = useState<'study' | 'break'>('study');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const savedSchedule = await AsyncStorage.getItem('mainSchedule');
        if (savedSchedule) {
          setSchedule(JSON.parse(savedSchedule));
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };
    loadSchedule();
  }, []);

  const addScheduleItem = async () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      day: selectedDay,
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      type: selectedType,
    };

    const updatedSchedule = [...schedule, newItem];
    setSchedule(updatedSchedule);
    await AsyncStorage.setItem('mainSchedule', JSON.stringify(updatedSchedule));
    setShowModal(false);
  };

  const removeScheduleItem = async (id: string) => {
    const updatedSchedule = schedule.filter(item => item.id !== id);
    setSchedule(updatedSchedule);
    await AsyncStorage.setItem('mainSchedule', JSON.stringify(updatedSchedule));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {days.map(day => (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            {schedule
              .filter(item => item.day === day)
              .map(item => (
                <View key={item.id} style={styles.scheduleItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      {item.startTime} - {item.endTime}
                    </Text>
                    <Text style={[styles.typeText, { color: item.type === 'study' ? '#3F51B5' : '#4CAF50' }]}>
                      {item.type === 'study' ? 'לימוד' : 'הפסקה'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeScheduleItem(item.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+ הוסף זמן חדש</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>הוסף זמן חדש</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, selectedDay === day && styles.selectedDay]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayText]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'study' && styles.selectedType]}
                onPress={() => setSelectedType('study')}
              >
                <Text style={styles.typeButtonText}>לימוד</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'break' && styles.selectedType]}
                onPress={() => setSelectedType('break')}
              >
                <Text style={styles.typeButtonText}>הפסקה</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timeLabel}>שעת התחלה:</Text>
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                if (selectedTime) setStartTime(selectedTime);
              }}
            />

            <Text style={styles.timeLabel}>שעת סיום:</Text>
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                if (selectedTime) setEndTime(selectedTime);
              }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addScheduleItem}
              >
                <Text style={styles.modalButtonText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  dayContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'right',
    marginBottom: 8,
  },
  scheduleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'right',
  },
  typeText: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
  },
  daysScroll: {
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E8EAF6',
  },
  selectedDay: {
    backgroundColor: '#3F51B5',
  },
  dayButtonText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#3F51B5',
  },
  typeButtonText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '500',
  },
  timeLabel: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'right',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#3F51B5',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
