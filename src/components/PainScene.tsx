import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { PAIN_SCENES } from '../utils/characterBuilder';
import { CharacterData } from '../store/characterStore';
import Character from './Character';

const { width } = Dimensions.get('window');

interface PainSceneProps {
  level: number;
  character: CharacterData;
  onDone: () => void;
}

export default function PainScene({ level, character, onDone }: PainSceneProps) {
  const scene = PAIN_SCENES[level];

  const spin = useSharedValue(0);
  const bounce = useSharedValue(0);
  const charScale = useSharedValue(0.5);

  useEffect(() => {
    charScale.value = withSpring(1, { damping: 8, stiffness: 100 });

    if (level >= 3) {
      spin.value = withRepeat(
        withTiming(360, { duration: 800 }),
        level >= 4 ? -1 : 3,
        false
      );
    }
    bounce.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      level + 2,
      false
    );
  }, [level]);

  const charAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${spin.value}deg` },
      { translateY: bounce.value },
      { scale: charScale.value },
    ],
  }));

  const bubbleCount = Math.min(level + 4, 10);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.bubble}>
        {/* Floating bubbles background */}
        <View style={styles.floatingEmojis}>
          {Array.from({ length: bubbleCount }).map((_, i) => (
            <FloatingBubble key={i} index={i} />
          ))}
        </View>

        {/* Big character vector */}
        <Animated.View style={[styles.bigChar, charAnimStyle]}>
          <Character
            character={character}
            size={160}
            showName={false}
            animated={true}
            expression={`pain${level}` as any}
          />
        </Animated.View>

        {/* Scene text */}
        <Animated.View entering={SlideInDown.delay(300).duration(500)}>
          <Text style={styles.sceneTitle}>{scene.title}</Text>
          <Text style={styles.sceneDesc}>{scene.description}</Text>
        </Animated.View>

        {/* Done button */}
        <TouchableOpacity
          style={[
            styles.doneBtn,
            { backgroundColor: character.color, shadowColor: character.color },
          ]}
          onPress={onDone}
        >
          <Text style={styles.doneBtnText}>Got it! Thanks {character.name} 💙</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function FloatingBubble({ index }: { index: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const delay = index * 150;
    const duration = 1500 + index * 200;
    translateY.value = withRepeat(
      withSequence(
        withTiming(-40 - index * 10, { duration }),
        withTiming(0, { duration })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: duration / 2 }),
        withTiming(0.2, { duration: duration / 2 })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: 'absolute',
    left: (index % 5) * 60 + 20,
    top: Math.floor(index / 5) * 50 + 10,
  }));

  const colors = ['#FEE2E2', '#FFF5EA', '#FFEEDB', '#E0F2FE', '#CCFBF1', '#FCE7F3', '#DCFCE7'];
  const fill = colors[index % colors.length];
  const radius = 6 + (index % 3) * 3;

  return (
    <Animated.View style={[style]}>
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Circle cx={15} cy={15} r={radius} fill={fill} stroke="#1E1B4B" strokeWidth={2} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bubble: {
    width: width - 32,
    backgroundColor: '#FFF5EA',
    borderRadius: 32,
    borderWidth: 3.5,
    borderColor: '#1E1B4B',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    minHeight: 460,
    justifyContent: 'center',
  },
  floatingEmojis: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    overflow: 'hidden',
  },
  bigChar: {
    marginTop: 60,
    marginBottom: 20,
  },
  sceneTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 10,
  },
  sceneDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  doneBtn: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
});
