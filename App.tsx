import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FinanceProvider, useFinance } from './src/context/FinanceContext';

import { useFonts, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { View, Text } from 'react-native';

const RootContent = () => {
  const { isLoading } = useFinance();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#CCFF00' }}>LOADING DATA /// DATABASE...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
    SpaceMono_400Regular,
    Anton_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#CCFF00' }}>LOADING SYSTEM /// FONTS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <RootContent />
      </FinanceProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
