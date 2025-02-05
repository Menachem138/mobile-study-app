import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabase } from '../hooks/useSupabase';
import { Question, Answer } from '../types/qa';

interface QuestionDetailScreenProps {
  route: {
    params: {
      question: Question;
    };
  };
  navigation: any;
}

export function QuestionDetailScreen({ route, navigation }: QuestionDetailScreenProps) {
  const { question } = route.params;
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { supabase } = useSupabase();

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('answers')
        .insert({
          content: newAnswer.trim(),
          question_id: question.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      question.answers.push(data);
      setNewAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswer = (answer: Answer) => (
    <View key={answer.id} style={styles.answerContainer}>
      <Text style={styles.answerContent}>{answer.content}</Text>
      <Text style={styles.answerTimestamp}>
        {new Date(answer.createdAt).toLocaleDateString('he-IL')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.timestamp}>
            {new Date(question.createdAt).toLocaleDateString('he-IL')}
          </Text>
        </View>

        <Text style={styles.questionContent}>{question.content}</Text>

        <View style={styles.tagsContainer}>
          {question.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.answersSection}>
          <Text style={styles.answersTitle}>תשובות ({question.answers.length})</Text>
          {question.answers.map(renderAnswer)}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newAnswer}
          onChangeText={setNewAnswer}
          placeholder="הוסף תשובה..."
          multiline
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAnswer}
          disabled={!newAnswer.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="send" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  questionHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 8,
    textAlign: 'right',
  },
  timestamp: {
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'right',
  },
  questionContent: {
    fontSize: 16,
    color: '#37474F',
    padding: 16,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 4,
  },
  tagText: {
    color: '#1976D2',
    fontSize: 12,
  },
  answersSection: {
    padding: 16,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 16,
    textAlign: 'right',
  },
  answerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  answerContent: {
    fontSize: 14,
    color: '#37474F',
    marginBottom: 8,
    textAlign: 'right',
  },
  answerTimestamp: {
    color: '#9E9E9E',
    fontSize: 12,
    textAlign: 'right',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
