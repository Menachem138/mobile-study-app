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
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSupabase } from '../hooks/useSupabase';
import { MediaItem } from '../types/content';

const { width } = Dimensions.get('window');

interface Tweet extends MediaItem {
  tweetId: string;
  isFavorite?: boolean;
}

export function TweetsLibraryScreen() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTweetUrl, setNewTweetUrl] = useState('');
  const [addingTweet, setAddingTweet] = useState(false);
  const { getMediaItems, saveMediaItem, deleteMediaItem, updateMediaItem } = useSupabase();

  useEffect(() => {
    loadTweets();
  }, []);

  const loadTweets = async () => {
    try {
      const items = await getMediaItems();
      const tweetItems = items?.filter(item => item.type === 'tweet') || [];
      setTweets(tweetItems as Tweet[]);
    } catch (error) {
      console.error('Error loading tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractTweetId = (url: string) => {
    const regex = /twitter\.com\/\w+\/status\/(\d+)/;
    const match = url.match(regex);
    return match?.[1];
  };

  const handleAddTweet = async () => {
    try {
      setAddingTweet(true);
      const tweetId = extractTweetId(newTweetUrl);
      
      if (!tweetId) {
        console.error('Invalid tweet URL');
        return;
      }

      const newTweet: Partial<Tweet> = {
        title: 'Tweet',
        type: 'tweet',
        url: newTweetUrl,
        tweetId,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedTweet = await saveMediaItem(newTweet);
      setTweets(prev => [savedTweet as Tweet, ...prev]);
      setNewTweetUrl('');
    } catch (error) {
      console.error('Error adding tweet:', error);
    } finally {
      setAddingTweet(false);
    }
  };

  const handleDeleteTweet = async (id: string) => {
    try {
      await deleteMediaItem(id);
      setTweets(prev => prev.filter(tweet => tweet.id !== id));
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  const toggleFavorite = async (tweet: Tweet) => {
    try {
      const updatedTweet = {
        ...tweet,
        isFavorite: !tweet.isFavorite,
        updatedAt: new Date().toISOString(),
      };
      await updateMediaItem(tweet.id, updatedTweet);
      setTweets(prev =>
        prev.map(t => (t.id === tweet.id ? updatedTweet : t))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderTweet = ({ item }: { item: Tweet }) => (
    <View style={styles.tweetContainer}>
      <WebView
        style={styles.tweetEmbed}
        source={{
          html: `
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <blockquote class="twitter-tweet" data-lang="he">
              <a href="${item.url}"></a>
            </blockquote>
            <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
          `,
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
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
          onPress={() => handleDeleteTweet(item.id)}
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
          value={newTweetUrl}
          onChangeText={setNewTweetUrl}
          placeholder="הכנס קישור לציוץ"
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTweet}
          disabled={!newTweetUrl.trim() || addingTweet}
        >
          {addingTweet ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>הוסף</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={tweets}
        renderItem={renderTweet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
    padding: 16,
  },
  tweetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tweetEmbed: {
    width: '100%',
    height: 400,
    backgroundColor: '#FFFFFF',
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
