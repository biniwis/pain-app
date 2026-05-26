import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface PainScaleProps {
  selected: number | null;
  onSelect: (level: number) => void;
}

const LEVELS = [
  { level: 1, label: 'Barely any', color: '#10B981', inactiveColor: '#A7F3D0', textColor: '#065F46' },
  { level: 2, label: 'Bothersome', color: '#F59E0B', inactiveColor: '#FDE68A', textColor: '#92400E' },
  { level: 3, label: 'Uncomfortable', color: '#D97706', inactiveColor: '#FCD34D', textColor: '#78350F' },
  { level: 4, label: 'Hurts a lot', color: '#EF4444', inactiveColor: '#FCA5A5', textColor: '#7F1D1D' },
  { level: 5, label: 'Hurts so bad!', color: '#DC2626', inactiveColor: '#F87171', textColor: '#450A0A' },
];

function PainIllustration({ level, isSelected }: { level: number; isSelected: boolean }) {
  const strokeColor = '#1E1B4B';
  const strokeWidth = 2.5;

  // Background color based on selection
  const fill = isSelected ? LEVELS[level - 1].color : LEVELS[level - 1].inactiveColor;

  return (
    <Svg width={42} height={42} viewBox="0 0 60 60">
      {/* Face Base */}
      <Circle cx="30" cy="30" r="26" fill={fill} stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Level-specific facial features */}
      {level === 1 && (
        <>
          {/* Smiling eyes */}
          <Path d="M 17 25 Q 21 21 25 25" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M 35 25 Q 39 21 43 25" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* Happy smile */}
          <Path d="M 22 34 Q 30 42 38 34" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}

      {level === 2 && (
        <>
          {/* Calm eyes */}
          <Circle cx="21" cy="24" r="3.5" fill={strokeColor} />
          <Circle cx="39" cy="24" r="3.5" fill={strokeColor} />
          {/* Straight line mouth */}
          <Path d="M 23 36 H 37" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
        </>
      )}

      {level === 3 && (
        <>
          {/* Concerned eyebrows */}
          <Path d="M 17 19 L 24 21" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M 43 19 L 36 21" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
          {/* Concerned eyes */}
          <Circle cx="21" cy="25" r="3.5" fill={strokeColor} />
          <Circle cx="39" cy="25" r="3.5" fill={strokeColor} />
          {/* Wavy mouth */}
          <Path d="M 24 36 Q 27 33 30 36 Q 33 39 36 36" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}

      {level === 4 && (
        <>
          {/* Closed wincing eyes */}
          <Path d="M 17 22 L 23 25 L 17 28" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 43 22 L 37 25 L 43 28" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sad downward mouth */}
          <Path d="M 24 38 Q 30 32 36 38" stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* Cute teardrop */}
          <Path d="M 18 33 Q 19 33 19 35 Q 19 37 18 37 Q 17 37 17 35 Q 17 33 18 33 Z" fill="#60A5FA" />
        </>
      )}

      {level === 5 && (
        <>
          {/* Tight wincing eyes */}
          <Path d="M 16 21 L 22 25 L 16 29" stroke={strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 44 21 L 38 25 L 44 29" stroke={strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Yelling open mouth */}
          <Path d="M 22 36 C 22 45, 38 45, 38 36 Z" stroke={strokeColor} strokeWidth={3} fill={strokeColor} strokeLinecap="round" />
          {/* Double teardrops */}
          <Path d="M 15 32 Q 16 32 16 34 Q 16 36 15 36 Q 14 36 14 34 Q 14 32 15 32 Z" fill="#60A5FA" />
          <Path d="M 45 32 Q 46 32 46 34 Q 46 36 45 36 Q 44 36 44 34 Q 44 32 45 32 Z" fill="#60A5FA" />
        </>
      )}
    </Svg>
  );
}

export default function PainScale({ selected, onSelect }: PainScaleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How strong is the pain now?</Text>
      <View style={styles.scaleRow}>
        {LEVELS.map(({ level, label, color, inactiveColor, textColor }) => {
          const isSelected = selected === level;
          return (
            <PainButton
              key={level}
              level={level}
              label={label}
              color={color}
              inactiveColor={inactiveColor}
              textColor={textColor}
              isSelected={isSelected}
              onPress={() => onSelect(level)}
            />
          );
        })}
      </View>
    </View>
  );
}

function PainButton({
  level,
  label,
  color,
  inactiveColor,
  textColor,
  isSelected,
  onPress,
}: {
  level: number;
  label: string;
  color: string;
  inactiveColor: string;
  textColor: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.25, { damping: 6 }),
      withSpring(1.0, { damping: 10 })
    );
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles.levelBtn,
          {
            backgroundColor: isSelected ? color : '#FFF9F2',
            borderColor: isSelected ? '#1E1B4B' : '#E5E7EB',
          },
          isSelected && { shadowColor: color, shadowOpacity: 0.25 },
          animStyle,
        ]}
      >
        <PainIllustration level={level} isSelected={isSelected} />
        <Text style={[styles.levelLabel, { color: isSelected ? 'white' : '#6B7280', marginTop: 8 }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const BUTTON_SIZE = (width - 60) / 5;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 24,
    textAlign: 'center',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  levelBtn: {
    width: BUTTON_SIZE,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
});
