import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types/content';

interface ContentViewerProps {
  item: MediaItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<MediaItem>) => void;
}

const { width, height } = Dimensions.get('window');

const ContentViewer = ({ item, visible, onClose, onDelete, onUpdate }: ContentViewerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    if (item) {
      setEditedTitle(item.title || '');
      setEditedDescription(item.description || '');
    }
  }, [item]);

  const handleSave = () => {
    if (item && onUpdate) {
      onUpdate(item.id, {
        title: editedTitle,
        description: editedDescription,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    }
  };

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
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    placeholder="כותרת"
                    textAlign="right"
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    placeholder="תיאור"
                    multiline
                    numberOfLines={4}
                    textAlign="right"
                  />
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.editButton, styles.saveButton]}
                      onPress={handleSave}
                    >
                      <Text style={styles.editButtonText}>שמור</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editButton, styles.cancelButton]}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.editButtonText}>ביטול</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editButtonText}>ערוך</Text>
                  </TouchableOpacity>
                </>
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#263238',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
