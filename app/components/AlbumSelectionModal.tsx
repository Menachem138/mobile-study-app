import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSupabase } from '../hooks/useSupabase';
import { Album } from '../types/content';

interface AlbumSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (albumId: string) => void;
}

const AlbumSelectionModal = ({ visible, onClose, onSelect }: AlbumSelectionModalProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAlbums } = useSupabase();

  useEffect(() => {
    if (visible) {
      loadAlbums();
    }
  }, [visible]);

  const loadAlbums = async () => {
    try {
      const fetchedAlbums = await getAlbums();
      setAlbums(fetchedAlbums || []);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => {
        onSelect(item.id);
        onClose();
      }}
    >
      <Text style={styles.albumTitle}>{item.title}</Text>
      <Text style={styles.albumDescription}>{item.description}</Text>
      <Text style={styles.itemCount}>{item.items.length} פריטים</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>בחר אלבום</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3F51B5" />
          ) : (
            <FlatList
              data={albums}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>אין אלבומים זמינים</Text>
              }
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default AlbumSelectionModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  albumItem: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A237E',
    marginBottom: 4,
    textAlign: 'right',
  },
  albumDescription: {
    fontSize: 14,
    color: '#263238',
    marginBottom: 8,
    textAlign: 'right',
  },
  itemCount: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1A237E',
    fontSize: 16,
    fontWeight: '500',
  },
});
