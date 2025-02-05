import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { MediaItem } from '../types/content';

interface DocumentViewerProps {
  document: MediaItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const { width, height } = Dimensions.get('window');

export function DocumentViewer({ document, visible, onClose, onDelete }: DocumentViewerProps) {
  if (!document) return null;

  const renderContent = () => {
    switch (document.type) {
      case 'pdf':
        return (
          <Pdf
            source={{ uri: document.url || '' }}
            style={styles.pdfView}
            enablePaging={true}
            horizontal={false}
            onError={(error) => console.error('PDF Error:', error)}
          />
        );
      case 'markdown':
        return (
          <View style={styles.markdownContainer}>
            <Text style={styles.markdownText}>{document.content}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>
              תצוגה מקדימה אינה זמינה עבור סוג קובץ זה
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
              {document.title}
            </Text>
          </View>

          <View style={styles.contentContainer}>
            {renderContent()}
          </View>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(document.id)}
            >
              <Text style={styles.deleteButtonText}>מחק מסמך</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#263238',
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 18,
    color: '#263238',
    fontWeight: '600',
    textAlign: 'right',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pdfView: {
    flex: 1,
    width: '100%',
  },
  markdownContainer: {
    flex: 1,
    padding: 16,
  },
  markdownText: {
    fontSize: 16,
    color: '#263238',
    lineHeight: 24,
    textAlign: 'right',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
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
