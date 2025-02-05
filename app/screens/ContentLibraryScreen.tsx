import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { MediaPicker } from '../components/MediaPicker';
import { useSupabase } from '../hooks/useSupabase';
import { MediaItem, MediaType } from '../types/content';
import { ContentViewer } from '../components/ContentViewer';
import { AddContentModal } from '../components/AddContentModal';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = width / COLUMN_COUNT - 16;

export function ContentLibraryScreen() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getMediaItems, saveMediaItem, deleteMediaItem } = useSupabase();

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
      const items = await getMediaItems();
      setMediaItems(items || []);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = async (url: string, type: MediaType) => {
    try {
      const newItem: Partial<MediaItem> = {
        title: '',
        type,
        url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setShowAddModal(true);
      const savedItem = await saveMediaItem(newItem);
      setMediaItems(prev => [savedItem, ...prev]);
    } catch (error) {
      console.error('Error saving media item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMediaItem(id);
      setMediaItems(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting media item:', error);
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedItem(item)}
    >
      {item.type === 'image' ? (
        <ExpoImage
          source={{ uri: item.url || '' }}
          style={styles.itemImage}
          contentFit="cover"
        />
      ) : item.type === 'video' ? (
        <Video
          source={{ uri: item.url || '' }}
          style={styles.itemImage}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          useNativeControls
        />
      ) : (
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      )}
      <Text style={styles.itemTitle} numberOfLines={1}>
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
      <MediaPicker
        onMediaSelect={handleMediaSelect}
        onError={(error) => console.error('Media picker error:', error)}
      />

      <FlatList
        data={mediaItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
      />

      <ContentViewer
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />

      <AddContentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={loadMediaItems}
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
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH,
  },
  noteContainer: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noteTitle: {
    fontSize: 16,
    color: '#1A237E',
    textAlign: 'center',
  },
  itemTitle: {
    fontSize: 14,
    color: '#263238',
    padding: 8,
    textAlign: 'right',
  },
});
