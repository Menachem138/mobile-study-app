import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabase } from '../hooks/useSupabase';
import { MediaItem } from '../types/content';
import { YouTubePlayer } from '../components/YouTubePlayer';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = width / COLUMN_COUNT - 16;

interface YouTubeVideo extends MediaItem {
  videoId: string;
  thumbnail: string;
  isFavorite?: boolean;
}

export function YouTubeLibraryScreen() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const { getMediaItems, saveMediaItem, deleteMediaItem, updateMediaItem } = useSupabase();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const items = await getMediaItems();
      const youtubeVideos = items?.filter(item => item.type === 'youtube') || [];
      setVideos(youtubeVideos as YouTubeVideo[]);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match?.[2];
  };

  const handleAddVideo = async () => {
    try {
      setAddingVideo(true);
      const videoId = extractVideoId(newVideoUrl);
      
      if (!videoId) {
        console.error('Invalid YouTube URL');
        return;
      }

      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`);
      const data = await response.json();
      
      if (!data.items?.[0]) {
        console.error('Video not found');
        return;
      }

      const { title, thumbnails } = data.items[0].snippet;
      const thumbnail = thumbnails.medium.url;

      const newVideo: Partial<YouTubeVideo> = {
        title,
        type: 'youtube',
        url: newVideoUrl,
        videoId,
        thumbnail,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedVideo = await saveMediaItem(newVideo);
      setVideos(prev => [savedVideo as YouTubeVideo, ...prev]);
      setNewVideoUrl('');
    } catch (error) {
      console.error('Error adding video:', error);
    } finally {
      setAddingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteMediaItem(id);
      setVideos(prev => prev.filter(video => video.id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const toggleFavorite = async (video: YouTubeVideo) => {
    try {
      const updatedVideo = {
        ...video,
        isFavorite: !video.isFavorite,
        updatedAt: new Date().toISOString(),
      };
      await updateMediaItem(video.id, updatedVideo);
      setVideos(prev =>
        prev.map(v => (v.id === video.id ? updatedVideo : v))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderItem = ({ item }: { item: YouTubeVideo }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => setSelectedVideo(item)}>
        <ExpoImage
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleFavorite(item)}
        >
          <MaterialIcons
            name={item.isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={item.isFavorite ? '#F44336' : '#9E9E9E'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDeleteVideo(item.id)}
        >
          <MaterialIcons name="delete" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </View>
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
        <TextInput
          style={styles.input}
          value={newVideoUrl}
          onChangeText={setNewVideoUrl}
          placeholder="הכנס קישור ליוטיוב"
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddVideo}
          disabled={!newVideoUrl.trim() || addingVideo}
        >
          {addingVideo ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>הוסף</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
      />

      <YouTubePlayer
        videoId={selectedVideo?.videoId || ''}
        visible={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
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
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  thumbnail: {
    width: '100%',
    height: (ITEM_WIDTH * 9) / 16,
  },
  videoTitle: {
    fontSize: 14,
    color: '#263238',
    padding: 8,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
});
