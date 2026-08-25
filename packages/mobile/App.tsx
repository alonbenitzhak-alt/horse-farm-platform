import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🐴 StableOS - Mobile App</Text>
      <Text>Coming soon...</Text>
      <StatusBar style="auto" />
    </View>
  );
}
