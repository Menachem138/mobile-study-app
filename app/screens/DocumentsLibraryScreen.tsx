import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useSupabase } from '../hooks/useSupabase';
import { MediaPicker } from '../components/MediaPicker';
import { MediaItem, MediaType } from '../types/content';
import { DocumentViewer } from '../components/DocumentViewer';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = width / COLUMN_COUNT - 16;

export function DocumentsLibraryScreen() {
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<MediaItem | null>(null);
  const { getMediaItems, saveMediaItem, deleteMediaItem } = useSupabase();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const items = await getMediaItems();
      const docs = items?.filter(item => 
        item.type === 'pdf' || 
        item.type === 'doc' || 
        item.type === 'markdown'
      ) || [];
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = async (url: string, type: MediaType) => {
    try {
      const newItem: Partial<MediaItem> = {
        title: '',
        type,
        url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedItem = await saveMediaItem(newItem);
      setDocuments(prev => [savedItem, ...prev]);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteMediaItem(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedDocument(item)}
    >
      <View style={styles.documentPreview}>
        <Text style={styles.documentType}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.itemTitle} numberOfLines={2}>
        {item.title}
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
        <MediaPicker
          onMediaSelect={handleDocumentSelect}
          onError={(error) => console.error('Document picker error:', error)}
          allowedTypes={['pdf', 'doc', 'markdown']}
        />
      </View>

      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
      />

      <DocumentViewer
        document={selectedDocument}
        visible={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onDelete={handleDeleteDocument}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentPreview: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentType: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3F51B5',
  },
  itemTitle: {
    fontSize: 14,
    color: '#263238',
    padding: 8,
    textAlign: 'right',
  },
});
