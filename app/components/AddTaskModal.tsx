import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Task {
  title: string;
  dueDate: string;
  estimatedTime: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
}

export function AddTaskModal({ visible, onClose, onSubmit }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [estimatedTime, setEstimatedTime] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<Task['urgencyLevel']>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !estimatedTime) {
      return;
    }

    onSubmit({
      title: title.trim(),
      dueDate: dueDate.toISOString(),
      estimatedTime: parseInt(estimatedTime, 10),
      urgencyLevel,
      completed: false,
    });

    // Reset form
    setTitle('');
    setDueDate(new Date());
    setEstimatedTime('');
    setUrgencyLevel('medium');
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>משימה חדשה</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>כותרת</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="הכנס כותרת"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>תאריך יעד</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  style={styles.datePickerIOS}
                  locale="he"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {dueDate.toLocaleDateString('he-IL')}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      locale="he"
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>זמן משוער (דקות)</Text>
              <TextInput
                style={styles.input}
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                keyboardType="numeric"
                placeholder="הכנס זמן משוער"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>דחיפות</Text>
              <View style={styles.urgencyContainer}>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    urgencyLevel === 'high' && styles.urgencyButtonActive,
                    { backgroundColor: urgencyLevel === 'high' ? '#F44336' : '#FFE0E0' }
                  ]}
                  onPress={() => setUrgencyLevel('high')}
                >
                  <Text style={styles.urgencyButtonText}>גבוהה</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    urgencyLevel === 'medium' && styles.urgencyButtonActive,
                    { backgroundColor: urgencyLevel === 'medium' ? '#FFC107' : '#FFF8E1' }
                  ]}
                  onPress={() => setUrgencyLevel('medium')}
                >
                  <Text style={styles.urgencyButtonText}>בינונית</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    urgencyLevel === 'low' && styles.urgencyButtonActive,
                    { backgroundColor: urgencyLevel === 'low' ? '#4CAF50' : '#E8F5E9' }
                  ]}
                  onPress={() => setUrgencyLevel('low')}
                >
                  <Text style={styles.urgencyButtonText}>נמוכה</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'right',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#263238',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  datePickerIOS: {
    alignSelf: 'flex-end',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'right',
  },
  urgencyContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    borderWidth: 2,
    borderColor: '#263238',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3F51B5',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#263238',
  },
});
