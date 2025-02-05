import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabase } from '../hooks/useSupabase';
import { Question, Tag } from '../types/qa';

export function QAScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    loadQuestions();
    loadTags();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          answers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchQuery
      ? question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTags = selectedTags.length
      ? selectedTags.every(tag => question.tags.includes(tag))
      : true;

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => {/* Navigate to question detail */}}
    >
      <Text style={styles.questionTitle}>{item.title}</Text>
      <Text style={styles.questionContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.tagsContainer}>
        {item.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.questionFooter}>
        <Text style={styles.answerCount}>
          {item.answers.length} תשובות
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleDateString('he-IL')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTag = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={[
        styles.filterTag,
        selectedTags.includes(item.name) && styles.filterTagSelected,
      ]}
      onPress={() => toggleTag(item.name)}
    >
      <Text
        style={[
          styles.filterTagText,
          selectedTags.includes(item.name) && styles.filterTagTextSelected,
        ]}
      >
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="חיפוש שאלות"
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {/* Navigate to add question */}}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={tags}
        renderItem={renderTag}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.tagsList}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={filteredQuestions}
        renderItem={renderQuestion}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.questionsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsList: {
    padding: 8,
  },
  filterTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTagSelected: {
    backgroundColor: '#3F51B5',
    borderColor: '#3F51B5',
  },
  filterTagText: {
    color: '#263238',
    fontSize: 14,
  },
  filterTagTextSelected: {
    color: '#FFFFFF',
  },
  questionsList: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 8,
    textAlign: 'right',
  },
  questionContent: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 12,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerCount: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  timestamp: {
    color: '#9E9E9E',
    fontSize: 14,
  },
});
