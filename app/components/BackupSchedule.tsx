import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackupPlan {
  id: string;
  title: string;
  description: string;
  alternativeTime: string;
}

export function BackupSchedule() {
  const [backupPlans, setBackupPlans] = useState<BackupPlan[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const loadBackupPlans = async () => {
      try {
        const savedPlans = await AsyncStorage.getItem('backupPlans');
        if (savedPlans) {
          setBackupPlans(JSON.parse(savedPlans));
        }
      } catch (error) {
        console.error('Error loading backup plans:', error);
      }
    };
    loadBackupPlans();
  }, []);

  const addBackupPlan = async () => {
    if (!newTitle || !newDescription || !newTime) return;

    const newPlan: BackupPlan = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      alternativeTime: newTime,
    };

    const updatedPlans = [...backupPlans, newPlan];
    setBackupPlans(updatedPlans);
    await AsyncStorage.setItem('backupPlans', JSON.stringify(updatedPlans));

    setNewTitle('');
    setNewDescription('');
    setNewTime('');
    setShowAddForm(false);
  };

  const removePlan = async (id: string) => {
    const updatedPlans = backupPlans.filter(plan => plan.id !== id);
    setBackupPlans(updatedPlans);
    await AsyncStorage.setItem('backupPlans', JSON.stringify(updatedPlans));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {backupPlans.map(plan => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <TouchableOpacity
                onPress={() => removePlan(plan.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>
            <Text style={styles.planTime}>זמן חלופי: {plan.alternativeTime}</Text>
          </View>
        ))}

        {showAddForm ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="כותרת"
              value={newTitle}
              onChangeText={setNewTitle}
              textAlign="right"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="תיאור"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
            <TextInput
              style={styles.input}
              placeholder="זמן חלופי (לדוגמה: 18:00-20:00)"
              value={newTime}
              onChangeText={setNewTime}
              textAlign="right"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.buttonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={addBackupPlan}
              >
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.addButtonText}>+ הוסף תוכנית גיבוי</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'right',
  },
  planDescription: {
    fontSize: 14,
    color: '#263238',
    marginBottom: 8,
    textAlign: 'right',
  },
  planTime: {
    fontSize: 14,
    color: '#3F51B5',
    textAlign: 'right',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 16,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
