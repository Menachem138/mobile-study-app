import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useCloudinary } from '../hooks/useCloudinary';
import { useSupabase } from '../hooks/useSupabase';
import { MediaType } from '../types/content';

interface MediaPickerProps {
  onMediaSelect: (url: string, type: MediaType) => void;
  onError?: (error: Error) => void;
}

export function MediaPicker({ onMediaSelect, onError }: MediaPickerProps) {
  const { pickImage, pickVideo, uploadToCloudinary } = useCloudinary();
  const { uploadMedia } = useSupabase();

  const handleMediaSelect = async (type: 'image' | 'video') => {
    try {
      const uri = type === 'image' 
        ? await pickImage()
        : await pickVideo();

      if (!uri) return;

      const { secure_url } = await uploadToCloudinary(uri, type);
      onMediaSelect(secure_url, type);
    } catch (error) {
      console.error('Error selecting media:', error);
      onError?.(error as Error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMediaSelect('image')}
      >
        <Text style={styles.buttonText}>העלה תמונה</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMediaSelect('video')}
      >
        <Text style={styles.buttonText}>העלה וידאו</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
