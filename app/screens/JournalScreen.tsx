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
import { JournalEntry, JournalTag } from '../types/journal';

export function JournalScreen({ navigation }: { navigation: any }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    loadEntries();
    loadTags();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_tags')
        .select('*')
        .order('count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const toggleFavorite = async (entry: JournalEntry) => {
    try {
      const updatedEntry = {
        ...entry,
        isFavorite: !entry.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('journal_entries')
        .update(updatedEntry)
        .eq('id', entry.id);

      if (error) throw error;

      setEntries(prev =>
        prev.map(e => (e.id === entry.id ? updatedEntry : e))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery
      ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTags = selectedTags.length
      ? selectedTags.every(tag => entry.tags.includes(tag))
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

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const [expanded, setExpanded] = useState(false);
    const contentPreview = expanded ? item.content : item.content.slice(0, 100) + (item.content.length > 100 ? '...' : '');

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => navigation.navigate('JournalEntry', { entry: item })}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            <MaterialIcons
              name={item.isFavorite ? 'star' : 'star-border'}
              size={24}
              color={item.isFavorite ? '#FFC107' : '#9E9E9E'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.entryPreview}>{contentPreview}</Text>
        
        {item.content.length > 100 && (
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.readMoreText}>
              {expanded ? 'הצג פחות' : 'קרא עוד'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleDateString('he-IL')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTag = ({ item }: { item: JournalTag }) => (
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
          placeholder="חיפוש ברשומות"
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddJournalEntry')}
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
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.entriesList}
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
  entriesList: {
    padding: 16,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    textAlign: 'right',
  },
  favoriteButton: {
    padding: 4,
  },
  entryPreview: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 12,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
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
  timestamp: {
    color: '#9E9E9E',
    fontSize: 12,
    textAlign: 'right',
  },
  readMoreButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
  },
  readMoreText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
});
