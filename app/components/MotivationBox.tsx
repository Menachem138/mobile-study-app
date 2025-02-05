import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quote {
  id: number;
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    id: 1,
    text: "ההצלחה היא סך כל המאמצים הקטנים שחוזרים על עצמם יום אחר יום.",
    author: "רוברט קולייר"
  },
  {
    id: 2,
    text: "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו.",
    author: "פיטר דרוקר"
  },
  {
    id: 3,
    text: "כל הישג מתחיל בהחלטה לנסות.",
    author: "גייל דיוורס"
  },
  {
    id: 4,
    text: "המטרה של החינוך היא להפוך מראות חדות למראות יפות.",
    author: "ג'ון גרדנר"
  },
  {
    id: 5,
    text: "הלמידה היא כמו חתירה נגד הזרם: ברגע שאתה מפסיק, אתה נסחף אחורה.",
    author: "פתגם סיני"
  }
];

export function MotivationBox() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteQuotes');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem('favoriteQuotes', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const changeQuote = () => {
    fadeOut();
    setTimeout(() => {
      const currentIndex = quotes.findIndex(q => q.id === currentQuote.id);
      const nextIndex = (currentIndex + 1) % quotes.length;
      setCurrentQuote(quotes[nextIndex]);
      fadeIn();
    }, 500);
  };

  const toggleFavorite = () => {
    const newFavorites = favorites.includes(currentQuote.id)
      ? favorites.filter(id => id !== currentQuote.id)
      : [...favorites, currentQuote.id];
    saveFavorites(newFavorites);
  };

  return (
    <LinearGradient
      colors={['#FFF9C4', '#FFF59D']}
      style={styles.container}
    >
      <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
        <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
        <Text style={styles.authorText}>- {currentQuote.author}</Text>
      </Animated.View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleFavorite}
        >
          <Text style={styles.buttonText}>
            {favorites.includes(currentQuote.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={changeQuote}
        >
          <Text style={styles.buttonText}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  quoteContainer: {
    alignItems: 'center',
    padding: 16,
  },
  quoteText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#263238',
    marginBottom: 8,
    lineHeight: 24,
  },
  authorText: {
    fontSize: 16,
    color: '#455A64',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonText: {
    fontSize: 20,
  },
});
