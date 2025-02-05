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

interface Rule {
  id: string;
  text: string;
  important: boolean;
}

export function RulesBoard() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const savedRules = await AsyncStorage.getItem('studyRules');
      if (savedRules) {
        setRules(JSON.parse(savedRules));
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const addRule = async () => {
    if (!newRule.trim()) return;

    const rule: Rule = {
      id: Date.now().toString(),
      text: newRule.trim(),
      important: isImportant,
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    await AsyncStorage.setItem('studyRules', JSON.stringify(updatedRules));
    setNewRule('');
    setIsImportant(false);
  };

  const removeRule = async (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    await AsyncStorage.setItem('studyRules', JSON.stringify(updatedRules));
  };

  const toggleImportance = async (id: string) => {
    const updatedRules = rules.map(rule =>
      rule.id === id ? { ...rule, important: !rule.important } : rule
    );
    setRules(updatedRules);
    await AsyncStorage.setItem('studyRules', JSON.stringify(updatedRules));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.rulesList}>
        {rules.map(rule => (
          <View key={rule.id} style={[styles.ruleItem, rule.important && styles.importantRule]}>
            <View style={styles.ruleContent}>
              <Text style={[styles.ruleText, rule.important && styles.importantText]}>
                {rule.text}
              </Text>
            </View>
            <View style={styles.ruleActions}>
              <TouchableOpacity
                onPress={() => toggleImportance(rule.id)}
                style={styles.importantButton}
              >
                <Text style={styles.importantButtonText}>
                  {rule.important ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeRule(rule.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.addRuleSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="הוסף כלל חדש..."
            value={newRule}
            onChangeText={setNewRule}
            multiline
            textAlign="right"
          />
          <TouchableOpacity
            style={[styles.importantToggle, isImportant && styles.importantToggleActive]}
            onPress={() => setIsImportant(!isImportant)}
          >
            <Text style={styles.importantToggleText}>
              {isImportant ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addRule}
        >
          <Text style={styles.addButtonText}>הוסף</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  rulesList: {
    flex: 1,
  },
  ruleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  importantRule: {
    backgroundColor: '#E8EAF6',
  },
  ruleContent: {
    flex: 1,
  },
  ruleText: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'right',
  },
  importantText: {
    color: '#1A237E',
    fontWeight: '500',
  },
  ruleActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  importantButton: {
    padding: 8,
  },
  importantButtonText: {
    fontSize: 20,
    color: '#FFC107',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#F44336',
  },
  addRuleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
  },
  importantToggle: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  importantToggleActive: {
    backgroundColor: '#FFF8E1',
  },
  importantToggleText: {
    fontSize: 20,
    color: '#FFC107',
  },
  addButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
