import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';

interface YouTubePlayerProps {
  videoId: string;
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function YouTubePlayer({ videoId, visible, onClose }: YouTubePlayerProps) {
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
          </View>

          <WebView
            style={styles.webview}
            source={{
              uri: `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`,
            }}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
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
    height: height * 0.4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#263238',
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});
