import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MediaType } from '../types/content';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export function useCloudinary() {
  const uploadToCloudinary = async (uri: string, type: MediaType): Promise<CloudinaryUploadResponse> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'file';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match?.[1];
      
      formData.append('file', {
        uri,
        name: `${filename}`,
        type: Platform.select({
          ios: type === 'video' ? 'video/quicktime' : `image/${ext}`,
          android: type === 'video' ? 'video/mp4' : `image/${ext}`,
        }),
      } as any);

      formData.append('upload_preset', 'study_app');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload to Cloudinary');
      }

      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const pickImage = async (options: ImagePicker.ImagePickerOptions = {}): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        ...options,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  };

  const pickVideo = async (options: ImagePicker.ImagePickerOptions = {}): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        ...options,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      throw error;
    }
  };

  return {
    uploadToCloudinary,
    pickImage,
    pickVideo,
  };
}
