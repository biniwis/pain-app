import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Polygon } from 'react-native-svg';
import Character from '../components/Character';
import { useCharacterStore } from '../store/characterStore';
import { RootStackParamList } from '../../App';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterReveal'> };

function SparkleStar({ size = 30, color = '#FDE047' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
        fill={color}
        stroke="#1E1B4B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function CharacterRevealScreen({ navigation }: Props) {
  const character = useCharacterStore((s) => s.character);
  const titleScale = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withDelay(600, withSpring(1, { damping: 8 }));
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));

    const timer = setTimeout(() => {
      navigation.replace('Lobby');
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!character) return null;

  const titleStyle = { transform: [{ scale: titleScale.value }] };
  const subtitleStyle = { opacity: subtitleOpacity.value };

  const starColors = ['#FDE047', '#60A5FA', '#F472B6', '#34D399', '#FB923C'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#FDF9F2' }]}>
      <View style={styles.container}>
        {/* Sparkles */}
        <View style={styles.sparkles}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Animated.View
              key={i}
              entering={ZoomIn.delay(i * 200).springify()}
              style={[styles.sparkle, { top: `${10 + i * 15}%`, left: `${5 + i * 20}%` }]}
            >
              <SparkleStar size={24 + (i % 3) * 6} color={starColors[i]} />
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <Text style={styles.intro}>Meet...</Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(400).springify()}>
          <Character character={character} size={180} showName={false} animated />
        </Animated.View>

        <Animated.Text style={[styles.charName, { color: character.color }, titleStyle]}>
          {character.name}!
        </Animated.Text>

        <Animated.View style={subtitleStyle}>
          <Text style={styles.catchphrase}>"{character.catchphrase}"</Text>
          <Text style={styles.sub}>This character will guide you 💙</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
  },
  sparkles: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 28,
  },
  intro: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
  charName: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  catchphrase: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 26,
  },
  sub: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
});
