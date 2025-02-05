import React, { useState } from 'react';
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
import { Video } from 'expo-av';
import { MediaItem } from '../types/content';

interface AlbumViewerProps {
  items: MediaItem[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const { width, height } = Dimensions.get('window');

export function AlbumViewer({ items, initialIndex, visible, onClose, onDelete }: AlbumViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentItem = items[currentIndex];

  if (!currentItem) return null;

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

          <View style={styles.navigationContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                <Text style={styles.navButtonText}>❮</Text>
              </TouchableOpacity>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {currentItem.type === 'image' ? (
                <ExpoImage
                  source={{ uri: currentItem.url || '' }}
                  style={styles.mediaContent}
                  contentFit="contain"
                />
              ) : currentItem.type === 'video' ? (
                <Video
                  source={{ uri: currentItem.url || '' }}
                  style={styles.mediaContent}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={true}
                  isLooping={false}
                />
              ) : (
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{currentItem.content}</Text>
                </View>
              )}
            </ScrollView>

            {currentIndex < items.length - 1 && (
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>❯</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{currentItem.title}</Text>
            {currentItem.description && (
              <Text style={styles.description}>{currentItem.description}</Text>
            )}
            <Text style={styles.counter}>
              {currentIndex + 1} / {items.length}
            </Text>
          </View>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(currentItem.id)}
            >
              <Text style={styles.deleteButtonText}>מחק פריט</Text>
            </TouchableOpacity>
          )}
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  navButton: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  mediaContent: {
    width: width * 0.7,
    height: width * 0.7,
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
  counter: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
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
