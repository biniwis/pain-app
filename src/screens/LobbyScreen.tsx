import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Line, Rect, Ellipse, Polygon, Text as SvgText } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Character from '../components/Character';
import DoodleIcon from '../components/DoodleIcon';
import PainScale from '../components/PainScale';
import { useCharacterStore, PainEntry } from '../store/characterStore';
import { PAIN_SCENES } from '../utils/characterBuilder';
import { RootStackParamList } from '../../App';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Lobby'> };

const { width } = Dimensions.get('window');

const CHILD_PHRASES = [
  "Help! I am trapped inside this cream-colored app. The developer only gave me a navy outline!",
  "Why did the banana go to the doctor? It wasn't peeling well. Get it? 🍌 (Please laugh, my salary depends on it).",
  "I'm not lazy, I'm just in energy-saving mode. Please insert chocolate cookies immediately. 🍪",
  "I wanted to be a doctor, but I didn't have the patience... literally. 🩺",
  "Are we there yet? No seriously, I have no legs or feet, so I am completely stranded here.",
  "If you think I look weird, you should see my brother. He is literally just a flat grey square.",
  "My favorite exercise is a cross between a lunge and a crunch. I call it LUNCH. 🍔",
  "If you poke me again, I will consult my lawyer. (He's a very grumpy teddy bear). 🧸",
  "Why did the tomato blush? Because it saw the salad dressing! 🍅 (Ah, classic terrible dad jokes).",
  "Why don't scientists trust atoms? Because they make up everything! ⚛️",
  "I'm having a mid-tummy crisis. My stomach is growling in ancient Greek and demanding pizza.",
  "I'm not saying I'm a superhero, but have you ever seen me and a potato in the same room? Exactly. 🥔",
  "Is this what screen time looks like from the inside? You look... very high resolution.",
  "If you click that big red alarm button one more time, I'm calling the police. (Wait, I don't know the phone number).",
  "I got a degree in being a cartoon shape, and all I do is wobble. Living the dream.",
  "Can you check my settings? I think my 'being cool' toggle is turned off.",
  "Congratulations, you tapped me! Your reward is... nothing. I am just a digital blob.",
  "If life gives you lemons, throw them at someone who deserves it. (Please don't tell your parents I said that).",
  "I'm not crying, my eyes are just sweating. Pain levels are a scam anyway.",
  "My doctor said I need more iron. So I started chewing on the kitchen fridge. 🎛️",
  "I'm not sleeping, I'm just doing a 10-hour study on the inside of my eyelids.",
  "Why do we tell actors to 'break a leg'? Because every play has a cast! Get it? Okay, I'll show myself out.",
  "You think my jokes are bad? You should see the developer's source code.",
  "If I wobble any faster, I might clip out of the phone's screen. Don't shake me!"
];

// ─── Subcomponents for Active Pain Level Scene Animations ────────────────────

function FlutteringButterfly({ delay, startX, startY }: { delay: number; startX: number; startY: number }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scaleX = useSharedValue(1);

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 1200 }),
        withTiming(-20, { duration: 1200 })
      ),
      -1,
      true
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 900 }),
        withTiming(10, { duration: 900 })
      ),
      -1,
      true
    );
    scaleX.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: startY,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scaleX: scaleX.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={32} height={32} viewBox="0 0 30 30">
        <Path d="M15 15 C8 8, 3 10, 6 18 C8 20, 12 18, 15 16 Z" fill="#FCE7F3" stroke="#1E1B4B" strokeWidth={2.2} />
        <Path d="M15 15 C22 8, 27 10, 24 18 C22 20, 18 18, 15 16 Z" fill="#FCE7F3" stroke="#1E1B4B" strokeWidth={2.2} />
        <Line x1={15} y1={10} x2={15} y2={22} stroke="#1E1B4B" strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

function VibratingInstrument({ type, startX, startY }: { type: 'note' | 'drum' | 'trumpet'; startX: number; startY: number }) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 200 }),
        withTiming(0.85, { duration: 200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: startY,
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {type === 'note' && (
        <Svg width={36} height={36} viewBox="0 0 30 30">
          <Path d="M10 22 A 4 4 0 1 1 6 18 L 10 18 L 10 6 L 22 10 L 22 20 A 4 4 0 1 1 18 16 L 22 16 L 22 12 L 12 9 L 12 22 Z" fill="#FDE68A" stroke="#1E1B4B" strokeWidth={2.2} strokeLinejoin="round" />
        </Svg>
      )}
      {type === 'drum' && (
        <Svg width={38} height={38} viewBox="0 0 30 30">
          <Rect x={5} y={10} width={20} height={12} rx={2} fill="#FECACA" stroke="#1E1B4B" strokeWidth={2.2} />
          <Ellipse cx={15} cy={10} rx={10} ry={3} fill="#FFF" stroke="#1E1B4B" strokeWidth={2.2} />
          <Ellipse cx={15} cy={22} rx={10} ry={3} fill="#FECACA" stroke="#1E1B4B" strokeWidth={2.2} />
          <Path d="M5 10 L15 22 M25 10 L15 22" stroke="#1E1B4B" strokeWidth={1.5} />
        </Svg>
      )}
      {type === 'trumpet' && (
        <Svg width={38} height={38} viewBox="0 0 30 30">
          <Path d="M6 16 L18 16 L24 22 L24 10 L18 16 Z" fill="#FFEEDB" stroke="#1E1B4B" strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M24 10 C25 10, 26 12, 26 16 C26 20, 25 22, 24 22 Z" fill="#FFD0A6" stroke="#1E1B4B" strokeWidth={2.2} />
          <Line x1={4} y1={16} x2={6} y2={16} stroke="#1E1B4B" strokeWidth={2.2} />
          <Line x1={12} y1={16} x2={12} y2={12} stroke="#1E1B4B" strokeWidth={2.2} />
          <Line x1={15} y1={16} x2={15} y2={12} stroke="#1E1B4B" strokeWidth={2.2} />
        </Svg>
      )}
    </Animated.View>
  );
}

function RockPartyDecoration({ type, startX, startY }: { type: 'guitar' | 'speaker' | 'star'; startX: number; startY: number }) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 80 }),
        withTiming(20, { duration: 80 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 120 }),
        withTiming(0.8, { duration: 120 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: startY,
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {type === 'guitar' && (
        <Svg width={46} height={46} viewBox="0 0 30 30" style={{ transform: [{ rotate: '-30deg' }] }}>
          <Path d="M12 18 C8 16, 6 22, 10 24 C14 26, 18 22, 16 18 Z" fill="#F43F5E" stroke="#1E1B4B" strokeWidth={2.2} />
          <Line x1={15} y1={19} x2={24} y2={10} stroke="#1E1B4B" strokeWidth={3.5} strokeLinecap="round" />
          <Line x1={15} y1={19} x2={24} y2={10} stroke="#FFF" strokeWidth={1.5} />
          <Rect x={23} y={8} width={4} height={4} fill="#FFD0A6" stroke="#1E1B4B" strokeWidth={1.5} />
        </Svg>
      )}
      {type === 'speaker' && (
        <Svg width={42} height={42} viewBox="0 0 30 30">
          <Rect x={5} y={5} width={20} height={20} rx={2} fill="#E2E8F0" stroke="#1E1B4B" strokeWidth={2.2} />
          <Circle cx={15} cy={16} r={6} fill="#94A3B8" stroke="#1E1B4B" strokeWidth={1.5} />
          <Circle cx={15} cy={16} r={2} fill="#1E1B4B" />
          <Circle cx={15} cy={9} r={2.5} fill="#FFF" stroke="#1E1B4B" strokeWidth={1.5} />
          <Path d="M2 12 Q4 15 2 18" fill="none" stroke="#1E1B4B" strokeWidth={2} strokeLinecap="round" />
          <Path d="M28 12 Q26 15 28 18" fill="none" stroke="#1E1B4B" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      )}
      {type === 'star' && (
        <Svg width={32} height={32} viewBox="0 0 30 30">
          <Path d="M15 3 L18 11 L26 11 L20 16 L22 24 L15 19 L8 24 L10 16 L4 11 L12 11 Z" fill="#FBBF24" stroke="#1E1B4B" strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      )}
    </Animated.View>
  );
}

// ─── Main LobbyScreen Component ───────────────────────────────────────────────

export default function LobbyScreen({ navigation }: Props) {
  const { character, addPainEntry } = useCharacterStore();
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const bubbleTimeout = useRef<NodeJS.Timeout | null>(null);

  // Pain selection state
  const [isReportingPain, setIsReportingPain] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [activeActionLevel, setActiveActionLevel] = useState<number | null>(null);

  const painBtnScale = useSharedValue(1);
  const charScale = useSharedValue(1);
  const charRotate = useSharedValue(0);
  const bounce = useSharedValue(0);

  const painBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: painBtnScale.value }],
  }));

  const animatedCharStyle = useAnimatedStyle(() => {
    // Offset level 3 character slightly down to align with washing machine center
    const targetYOffset = activeActionLevel === 3 ? 18 : 0;
    return {
      transform: [
        { scale: charScale.value },
        { rotate: `${charRotate.value}deg` },
        { translateY: bounce.value + targetYOffset }
      ],
    };
  });

  const handlePainPress = () => {
    painBtnScale.value = withSequence(
      withSpring(0.92, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );
    setIsReportingPain(true);
    setSelectedLevel(1); // default selection
  };

  const handleCancelPain = () => {
    setIsReportingPain(false);
    setSelectedLevel(null);
  };

  const handleConfirmPain = () => {
    if (selectedLevel === null) return;

    // Reset shared values
    charRotate.value = 0;
    bounce.value = 0;
    charScale.value = 1;

    setActiveActionLevel(selectedLevel);
    setIsReportingPain(false);

    // Apply loop animations
    if (selectedLevel === 1) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else if (selectedLevel === 2) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-16, { duration: 250 }),
          withTiming(0, { duration: 250 })
        ),
        -1,
        true
      );
      charRotate.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 150 }),
          withTiming(5, { duration: 150 })
        ),
        -1,
        true
      );
    } else if (selectedLevel === 3) {
      charRotate.value = withRepeat(
        withTiming(360, { duration: 900 }),
        -1,
        false
      );
      bounce.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 60 }),
          withTiming(4, { duration: 60 })
        ),
        -1,
        true
      );
    } else if (selectedLevel === 4) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 120 }),
          withTiming(5, { duration: 120 })
        ),
        -1,
        true
      );
      charRotate.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 120 }),
          withTiming(3, { duration: 120 })
        ),
        -1,
        true
      );
    } else if (selectedLevel === 5) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-30, { duration: 200 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        true
      );
      charRotate.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 100 }),
          withTiming(12, { duration: 100 })
        ),
        -1,
        true
      );
    }
  };

  const handleActionDone = async () => {
    if (activeActionLevel === null) return;

    const entry: PainEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level: activeActionLevel,
      characterReaction: PAIN_SCENES[activeActionLevel].title,
      medicalNote: PAIN_SCENES[activeActionLevel].medicalNote,
    };

    await addPainEntry(entry);

    // Stop animations and return to normal
    charRotate.value = 0;
    bounce.value = 0;
    charScale.value = 1;

    setActiveActionLevel(null);
    setSelectedLevel(null);
  };

  const handleCharacterPress = () => {
    if (activeActionLevel !== null || isReportingPain) return;

    charScale.value = withSequence(
      withSpring(1.12, { damping: 4 }),
      withSpring(1, { damping: 8 })
    );
    charRotate.value = withSequence(
      withTiming(-8, { duration: 120 }),
      withTiming(8, { duration: 120 }),
      withTiming(0, { duration: 120 })
    );

    const filtered = CHILD_PHRASES.filter((p) => p !== bubbleText);
    const randomPhrase = filtered[Math.floor(Math.random() * filtered.length)];
    setBubbleText(randomPhrase);

    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
    bubbleTimeout.current = setTimeout(() => {
      setBubbleText(null);
    }, 4000);
  };

  if (!character) return null;

  // Determine current speech bubble message
  let currentBubbleText: string | null = null;
  if (activeActionLevel !== null) {
    currentBubbleText = `${PAIN_SCENES[activeActionLevel].title}\n${PAIN_SCENES[activeActionLevel].description}`;
  } else if (isReportingPain) {
    currentBubbleText = selectedLevel
      ? `Pain Level ${selectedLevel}: ${PAIN_SCENES[selectedLevel].title}`
      : 'Mark a pain level to show me how you feel...';
  } else {
    currentBubbleText = bubbleText;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.parentBtn}
          onPress={() => navigation.navigate('ParentDashboard')}
          activeOpacity={0.8}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E1B4B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.greeting}>Hi Dor</Text>
      </View>

      {/* Main interactive area */}
      <View style={styles.centerArea}>
        {/* Speech Bubble */}
        {currentBubbleText && (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={styles.bubbleContainer}
            key={activeActionLevel !== null || isReportingPain ? 'active' : 'idle'}
          >
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{currentBubbleText}</Text>
            </View>
            <View style={styles.bubbleArrow} />
          </Animated.View>
        )}

        {/* Character/Action Layer Stack */}
        <View style={styles.charStackContainer}>
          {/* Back Layer Overlay */}
          {activeActionLevel === 3 && (
            <View style={StyleSheet.absoluteFill}>
              <Svg width={260} height={260} viewBox="0 0 100 100">
                <Rect x={2} y={2} width={96} height={96} rx={8} fill="#E0F2FE" stroke="#1E1B4B" strokeWidth={3} />
                <Line x1={2} y1={22} x2={98} y2={22} stroke="#1E1B4B" strokeWidth={3} />
                <Rect x={10} y={6} width={24} height={10} rx={1} fill="none" stroke="#1E1B4B" strokeWidth={2} />
                <Line x1={18} y1={11} x2={26} y2={11} stroke="#1E1B4B" strokeWidth={2} />
                <Circle cx={80} cy={11} r={5} fill="#FFF" stroke="#1E1B4B" strokeWidth={2.5} />
                <Line x1={80} y1={11} x2={80} y2={7} stroke="#1E1B4B" strokeWidth={2} />
                <Circle cx={50} cy={60} r={32} fill="#7DD3FC" stroke="#1E1B4B" strokeWidth={2} />
              </Svg>
            </View>
          )}

          {activeActionLevel === 4 && (
            <View style={StyleSheet.absoluteFill}>
              <Svg width={260} height={260} viewBox="0 0 100 100">
                <Polygon points="50,15 15,85 85,85" fill="#FEF08A" stroke="#1E1B4B" strokeWidth={3} />
              </Svg>
            </View>
          )}

          {/* Character View (Middle) */}
          <Animated.View style={animatedCharStyle}>
            <Character
              character={character}
              size={activeActionLevel !== null ? 150 : 240}
              showName={activeActionLevel === null && !isReportingPain}
              animated={true}
              onPress={handleCharacterPress}
              expression={
                activeActionLevel !== null
                  ? (`pain${activeActionLevel}` as any)
                  : selectedLevel !== null
                  ? (`pain${selectedLevel}` as any)
                  : 'default'
              }
            />
          </Animated.View>

          {/* Front Layer Overlay */}
          {activeActionLevel === 3 && (
            <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
              <Svg width={260} height={260} viewBox="0 0 100 100">
                <Circle cx={50} cy={60} r={32} fill="transparent" stroke="#1E1B4B" strokeWidth={4} />
                <Path d="M28 42 C38 32, 62 32, 72 42" fill="none" stroke="white" strokeWidth={2.5} opacity={0.6} strokeLinecap="round" />
                <Rect x={80} y={55} width={4} height={10} rx={1} fill="#FFF" stroke="#1E1B4B" strokeWidth={2} />
                <Circle cx={35} cy={78} r={4} fill="#FFF" fillOpacity={0.8} stroke="#1E1B4B" strokeWidth={1.5} />
                <Circle cx={65} cy={76} r={3} fill="#FFF" fillOpacity={0.8} stroke="#1E1B4B" strokeWidth={1.5} />
                <Circle cx={48} cy={82} r={5} fill="#FFF" fillOpacity={0.8} stroke="#1E1B4B" strokeWidth={1.5} />
              </Svg>
            </View>
          )}

          {activeActionLevel === 4 && (
            <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
              <Svg width={260} height={260} viewBox="0 0 100 100">
                <Path d="M50 15 L15 85 L44 85 L50 45 Z" fill="#FDE68A" stroke="#1E1B4B" strokeWidth={2.5} strokeLinejoin="round" />
                <Path d="M50 15 L85 85 L56 85 L50 45 Z" fill="#FDE68A" stroke="#1E1B4B" strokeWidth={2.5} strokeLinejoin="round" />
                <Line x1={15} y1={85} x2={50} y2={15} stroke="#1E1B4B" strokeWidth={3} strokeLinecap="round" />
                <Line x1={85} y1={85} x2={50} y2={15} stroke="#1E1B4B" strokeWidth={3} strokeLinecap="round" />
                <Line x1={12} y1={85} x2={88} y2={85} stroke="#1E1B4B" strokeWidth={3} strokeLinecap="round" />
                <Rect x={35} y={74} width={30} height={8} rx={1} fill="#FFF" stroke="#1E1B4B" strokeWidth={1.5} />
                <SvgText x={50} y={80} fontSize={5} fontWeight="bold" fill="#1E1B4B" textAnchor="middle">CAMP TUMMY</SvgText>
              </Svg>
            </View>
          )}

          {/* Floating effects */}
          {activeActionLevel === 1 && (
            <>
              <FlutteringButterfly delay={0} startX={-30} startY={20} />
              <FlutteringButterfly delay={300} startX={160} startY={40} />
              <FlutteringButterfly delay={600} startX={20} startY={180} />
              <FlutteringButterfly delay={900} startX={180} startY={160} />
            </>
          )}

          {activeActionLevel === 2 && (
            <>
              <VibratingInstrument type="note" startX={-20} startY={30} />
              <VibratingInstrument type="drum" startX={180} startY={20} />
              <VibratingInstrument type="trumpet" startX={-10} startY={160} />
              <VibratingInstrument type="note" startX={190} startY={150} />
            </>
          )}

          {activeActionLevel === 5 && (
            <>
              <RockPartyDecoration type="guitar" startX={-20} startY={30} />
              <RockPartyDecoration type="speaker" startX={180} startY={20} />
              <RockPartyDecoration type="star" startX={-10} startY={160} />
              <RockPartyDecoration type="guitar" startX={190} startY={150} />
            </>
          )}
        </View>
      </View>

      {/* Bottom Interface (Slider, Got it button, or Alarm Button) */}
      {isReportingPain ? (
        <Animated.View entering={SlideInDown.duration(300)} style={styles.painPanel}>
          <PainScale selected={selectedLevel} onSelect={setSelectedLevel} />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelPain}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !selectedLevel && styles.disabledBtn]}
              disabled={!selectedLevel}
              onPress={handleConfirmPain}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Let's see! →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : activeActionLevel !== null ? (
        <View style={styles.painBtnWrapper}>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: character.color }]}
            onPress={handleActionDone}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Got it! Thanks {character.name} 💙</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.painBtnWrapper}>
          <Animated.View style={painBtnStyle}>
            <TouchableOpacity
              style={styles.alarmBtn}
              onPress={handlePainPress}
              activeOpacity={0.85}
            >
              <DoodleIcon name="alarm" size={64} isSelected={true} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF9F2' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  parentBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFEEDB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E1B4B',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  bubbleContainer: {
    position: 'absolute',
    top: '5%',
    alignItems: 'center',
    zIndex: 10,
    width: width * 0.85,
  },
  bubble: {
    backgroundColor: '#FFF5EA',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#1E1B4B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  bubbleText: {
    color: '#1E1B4B',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E1B4B',
    marginTop: -1,
  },
  charStackContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  painBtnWrapper: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  alarmBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF5EA',
    borderWidth: 4.5,
    borderColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 10,
  },
  painPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF5EA',
    borderTopWidth: 3.5,
    borderColor: '#1E1B4B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 24,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#FF9F1C',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1E1B4B',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFEEDB',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1E1B4B',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#1E1B4B',
    fontSize: 16,
    fontWeight: '800',
  },
  doneBtn: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#1E1B4B',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
