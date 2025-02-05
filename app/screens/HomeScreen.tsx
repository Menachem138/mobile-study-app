import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Timer } from '../components/Timer';
import { MotivationBox } from '../components/MotivationBox';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabase } from '../hooks/useSupabase';

export function HomeScreen({ navigation }) {
  const { signOut } = useSupabase();

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={signOut}
          style={{ marginRight: 16 }}
        >
          <MaterialIcons name="logout" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, signOut]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Timer />
        <MotivationBox />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
