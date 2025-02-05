import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types/content';

interface ContentViewerProps {
  item: MediaItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const { width, height } = Dimensions.get('window');

export function ContentViewer({ item, visible, onClose, onDelete }: ContentViewerProps) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {item.type === 'image' ? (
              <ExpoImage
                source={{ uri: item.url || '' }}
                style={styles.mediaContent}
                contentFit="contain"
              />
            ) : item.type === 'video' ? (
              <Video
                source={{ uri: item.url || '' }}
                style={styles.mediaContent}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                isLooping={false}
              />
            ) : (
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{item.content}</Text>
              </View>
            )}

            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{item.title}</Text>
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>מחק פריט</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  mediaContent: {
    width: '100%',
    height: width * 0.9,
  },
  noteContent: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  noteText: {
    fontSize: 16,
    color: '#263238',
    lineHeight: 24,
    textAlign: 'right',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: '#263238',
    lineHeight: 24,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
