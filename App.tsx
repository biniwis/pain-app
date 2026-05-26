import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SilhouetteSelectionScreen from './src/screens/SilhouetteSelectionScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import CharacterRevealScreen from './src/screens/CharacterRevealScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import ParentDashboardScreen from './src/screens/ParentDashboardScreen';
import { useCharacterStore } from './src/store/characterStore';
import { SilhouetteId } from './src/utils/characterBuilder';

export type RootStackParamList = {
  SilhouetteSelection: undefined;
  Questionnaire: { silhouette: SilhouetteId };
  CharacterReveal: undefined;
  Lobby: undefined;
  ParentDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { loadFromStorage, character } = useCharacterStore();

  useEffect(() => {
    // Disable RTL for English layout
    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);
    // Load persisted data
    loadFromStorage();
  }, []);

  const initialRoute = character ? 'Lobby' : 'SilhouetteSelection';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="SilhouetteSelection" component={SilhouetteSelectionScreen} />
          <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
          <Stack.Screen name="CharacterReveal" component={CharacterRevealScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
