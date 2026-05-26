import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, {
  Ellipse, Circle, Path, Polygon, Defs, Pattern as SvgPattern,
  Line, Rect, ClipPath, G, RadialGradient, Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { CharacterData } from '../store/characterStore';
import { SilhouetteId, PatternId } from '../utils/characterBuilder';

interface CharacterProps {
  character: CharacterData;
  size?: number;
  showName?: boolean;
  animated?: boolean;
  onPress?: () => void;
  expression?: 'default' | 'excited' | 'pain1' | 'pain2' | 'pain3' | 'pain4' | 'pain5' | 'scream' | 'dizzy' | 'silly' | 'flat';
  animateFaceMount?: boolean;
  showFace?: boolean;
  tapToJiggle?: boolean;
}

export default function Character({
  character, size = 160, showName = true, animated = true, onPress, expression = 'default',
  animateFaceMount = false, showFace = true, tapToJiggle = true,
}: CharacterProps) {
  const [tapExpression, setTapExpression] = useState<'scream' | 'dizzy' | 'silly' | 'flat' | null>(null);

  const bounce = useSharedValue(0);
  const wiggle = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const faceOffsetX = useSharedValue(0);
  const faceOffsetY = useSharedValue(0);
  const faceScale = useSharedValue(animateFaceMount ? 0 : 1);

  const currentExpression = tapExpression || expression;

  useEffect(() => {
    if (animateFaceMount) {
      faceScale.value = 0;
      faceScale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 85 }));
    } else {
      faceScale.value = 1;
    }
  }, [animateFaceMount]);

  const faceStyle = useAnimatedStyle(() => {
    // Rotation lag: if body rotates clockwise (positive wiggle), slide face left (negative X) to look 3D rounded
    const rotLagX = -wiggle.value * 0.45;
    // Bounce lag: if body is moving up (negative bounce), face stays slightly lower (positive Y)
    const bounceLagY = -bounce.value * 0.12;

    return {
      transform: [
        { scale: faceScale.value },
        { translateX: faceOffsetX.value + rotLagX },
        { translateY: faceOffsetY.value + bounceLagY },
      ],
    };
  });

  useEffect(() => {
    if (!animated) {
      bounce.value = 0;
      wiggle.value = 0;
      scaleX.value = 1;
      scaleY.value = 1;
      faceOffsetX.value = 0;
      faceOffsetY.value = 0;
      return;
    }

    if (currentExpression === 'excited') {
      // Super happy high jump and rapid wiggle dance!
      bounce.value = withRepeat(
        withSequence(
          withSpring(-32, { damping: 5, stiffness: 120 }), // Jump up high
          withSpring(0, { damping: 6, stiffness: 100 })    // Landing bounce
        ),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 90 }), // Rapid wiggle left
          withTiming(12, { duration: 90 })   // Rapid wiggle right
        ),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 120 }),
          withTiming(1.2, { duration: 120 })
        ),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 120 }),
          withTiming(0.85, { duration: 120 })
        ),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 90 }),
          withTiming(5, { duration: 90 })
        ),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 120 }),
          withTiming(4, { duration: 120 })
        ),
        -1, true
      );
    } else if (currentExpression === 'scream') {
      // Screaming wobbly leap!
      bounce.value = withRepeat(
        withSequence(
          withSpring(-25, { damping: 4, stiffness: 130 }),
          withSpring(0, { damping: 5, stiffness: 100 })
        ),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 80 }),
          withTiming(15, { duration: 80 })
        ),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(1.2, { duration: 100 })
        ),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(0.8, { duration: 100 })
        ),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 80 }),
          withTiming(4, { duration: 80 })
        ),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 100 }),
          withTiming(4, { duration: 100 })
        ),
        -1, true
      );
    } else if (currentExpression === 'dizzy') {
      // Dizzy rotating/rocking wobble!
      bounce.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 220 }),
          withTiming(5, { duration: 220 })
        ),
        -1, true
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-16, { duration: 260 }),
          withTiming(16, { duration: 260 })
        ),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 220 }),
          withTiming(0.88, { duration: 220 })
        ),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(0.88, { duration: 220 }),
          withTiming(1.12, { duration: 220 })
        ),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 260 }),
          withTiming(6, { duration: 260 })
        ),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 220 }),
          withTiming(3, { duration: 220 })
        ),
        -1, true
      );
    } else if (currentExpression === 'silly') {
      // Goofy hopping wobble!
      bounce.value = withRepeat(
        withSequence(
          withSpring(-18, { damping: 4, stiffness: 85 }),
          withSpring(0, { damping: 4, stiffness: 85 })
        ),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-9, { duration: 140 }),
          withTiming(9, { duration: 140 })
        ),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(
          withTiming(0.88, { duration: 140 }),
          withTiming(1.12, { duration: 140 })
        ),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 140 }),
          withTiming(0.88, { duration: 140 })
        ),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(
          withSpring(-5, { damping: 3 }),
          withSpring(5, { damping: 3 })
        ),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(
          withSpring(-4, { damping: 3 }),
          withSpring(2, { damping: 3 })
        ),
        -1, true
      );
    } else if (currentExpression === 'flat') {
      // Slow, bored unimpressed sighing
      bounce.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1300 }),
          withTiming(0, { duration: 1300 })
        ),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 1100 }),
          withTiming(1, { duration: 1100 })
        ),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1300 }),
          withTiming(0.96, { duration: 1300 })
        ),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(0.96, { duration: 1300 }),
          withTiming(1.04, { duration: 1300 })
        ),
        -1, true
      );
      faceOffsetX.value = 0;
      faceOffsetY.value = 0;
    } else if (currentExpression === 'pain5') {
      // Trembling / shaking heavily
      bounce.value = withRepeat(
        withSequence(withTiming(-3, { duration: 60 }), withTiming(3, { duration: 60 })),
        -1, true
      );
      wiggle.value = withRepeat(
        withSequence(withTiming(-5, { duration: 50 }), withTiming(5, { duration: 50 })),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 70 }), withTiming(0.92, { duration: 70 })),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(withTiming(0.92, { duration: 70 }), withTiming(1.08, { duration: 70 })),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(withTiming(-2.5, { duration: 40 }), withTiming(2.5, { duration: 40 })),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(withTiming(-2.5, { duration: 50 }), withTiming(2.5, { duration: 50 })),
        -1, true
      );
    } else if (currentExpression === 'pain4') {
      // Shaking / crying gently
      bounce.value = withRepeat(
        withSequence(withTiming(-4, { duration: 100 }), withTiming(0, { duration: 100 })),
        -1, true
      );
      wiggle.value = withRepeat(
        withSequence(withTiming(-3, { duration: 90 }), withTiming(3, { duration: 90 })),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 110 }), withTiming(0.95, { duration: 110 })),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(withTiming(0.95, { duration: 110 }), withTiming(1.05, { duration: 110 })),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(withTiming(-2, { duration: 90 }), withTiming(2, { duration: 90 })),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(withTiming(-2, { duration: 110 }), withTiming(2, { duration: 110 })),
        -1, true
      );
    } else if (currentExpression === 'pain3') {
      // Slow, heavy worried breathing
      bounce.value = withRepeat(
        withSequence(withTiming(-5, { duration: 1000 }), withTiming(0, { duration: 1000 })),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(withTiming(-2, { duration: 800 }), withTiming(2, { duration: 800 })),
        -1, false
      );
      scaleX.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 1000 }), withTiming(0.96, { duration: 1000 })),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(withTiming(0.96, { duration: 1000 }), withTiming(1.04, { duration: 1000 })),
        -1, true
      );
      faceOffsetX.value = withRepeat(
        withSequence(withTiming(-1.5, { duration: 800 }), withTiming(1.5, { duration: 800 })),
        -1, true
      );
      faceOffsetY.value = withRepeat(
        withSequence(withTiming(-2, { duration: 1000 }), withTiming(2, { duration: 1000 })),
        -1, true
      );
    } else if (currentExpression === 'pain2') {
      // Sluggish wobble
      bounce.value = withRepeat(
        withSequence(withTiming(-3, { duration: 1200 }), withTiming(0, { duration: 1200 })),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(withTiming(-3, { duration: 1000 }), withTiming(3, { duration: 1000 })),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 1200 }), withTiming(0.97, { duration: 1200 })),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(withTiming(0.97, { duration: 1200 }), withTiming(1.03, { duration: 1200 })),
        -1, true
      );
      faceOffsetX.value = 0;
      faceOffsetY.value = 0;
    } else if (currentExpression === 'pain1') {
      // Tiny subtle tickle wobble
      bounce.value = withRepeat(
        withSequence(withTiming(-2, { duration: 1400 }), withTiming(0, { duration: 1400 })),
        -1, false
      );
      wiggle.value = withRepeat(
        withSequence(withTiming(-1.5, { duration: 1200 }), withTiming(1.5, { duration: 1200 })),
        -1, true
      );
      scaleX.value = withRepeat(
        withSequence(withTiming(1.02, { duration: 1400 }), withTiming(0.98, { duration: 1400 })),
        -1, true
      );
      scaleY.value = withRepeat(
        withSequence(withTiming(0.98, { duration: 1400 }), withTiming(1.02, { duration: 1400 })),
        -1, true
      );
      faceOffsetX.value = 0;
      faceOffsetY.value = 0;
    } else {
      // Wobbly jelly breathing / wiggling (Gumball style)
      bounce.value = withRepeat(
        withSequence(
          withSpring(-12, { damping: 6, stiffness: 45 }),
          withSpring(0, { damping: 6, stiffness: 45 })
        ),
        -1,
        false
      );
      wiggle.value = withRepeat(
        withSequence(
          withSpring(-7, { damping: 3.5, stiffness: 55 }),
          withSpring(7, { damping: 3.5, stiffness: 55 })
        ),
        -1,
        true
      );
      scaleX.value = withRepeat(
        withSequence(
          withSpring(1.06, { damping: 4.5, stiffness: 65 }),
          withSpring(0.94, { damping: 4.5, stiffness: 65 })
        ),
        -1,
        true
      );
      scaleY.value = withRepeat(
        withSequence(
          withSpring(0.94, { damping: 4.5, stiffness: 65 }),
          withSpring(1.06, { damping: 4.5, stiffness: 65 })
        ),
        -1,
        true
      );
      faceOffsetX.value = withRepeat(
        withSequence(
          withSpring(-3, { damping: 3.5, stiffness: 45 }),
          withSpring(3, { damping: 3.5, stiffness: 45 })
        ),
        -1,
        true
      );
      faceOffsetY.value = withRepeat(
        withSequence(
          withSpring(-3, { damping: 4, stiffness: 40 }),
          withSpring(3, { damping: 4, stiffness: 40 })
        ),
        -1,
        true
      );
    }
  }, [animated, currentExpression]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${wiggle.value}deg` },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => {
    // bounce.value goes negative when character jumps
    const heightFactor = Math.max(0, -bounce.value); // distance from ground
    const shadowScale = Math.max(0.2, 1 - heightFactor * 0.015);
    const shadowOpacity = Math.max(0.1, 1 - heightFactor * 0.02);

    return {
      transform: [
        { scaleX: scaleX.value * shadowScale },
        { scaleY: shadowScale },
      ],
      opacity: shadowOpacity,
    };
  });

  const handlePress = () => {
    if (!tapToJiggle) {
      if (onPress) onPress();
      return;
    }

    // Play high-velocity wobbly spring jump & squash/stretch
    bounce.value = withSequence(
      withSpring(-45, { damping: 3.5, stiffness: 160 }), // leap high
      withSpring(18, { damping: 4, stiffness: 110 }),   // landing flat squash
      withSpring(0, { damping: 6, stiffness: 80 })      // settle
    );
    wiggle.value = withSequence(
      withSpring(-28, { damping: 3, stiffness: 180 }),
      withSpring(28, { damping: 3, stiffness: 180 }),
      withSpring(0, { damping: 5, stiffness: 100 })
    );
    scaleX.value = withSequence(
      withSpring(0.75, { damping: 3, stiffness: 160 }),
      withSpring(1.4, { damping: 3, stiffness: 120 }),
      withSpring(1.0, { damping: 5, stiffness: 80 })
    );
    scaleY.value = withSequence(
      withSpring(1.45, { damping: 3, stiffness: 160 }),
      withSpring(0.72, { damping: 3, stiffness: 120 }),
      withSpring(1.0, { damping: 5, stiffness: 80 })
    );
    faceOffsetX.value = withSequence(
      withSpring(-10, { damping: 4 }),
      withSpring(10, { damping: 4 }),
      withSpring(0, { damping: 5 })
    );
    faceOffsetY.value = withSequence(
      withSpring(-14, { damping: 4 }),
      withSpring(8, { damping: 4 }),
      withSpring(0, { damping: 5 })
    );

    // Pick a random funny tap expression
    const sillyExpressions = ['scream', 'dizzy', 'silly', 'flat'] as const;
    const randomExpr = sillyExpressions[Math.floor(Math.random() * sillyExpressions.length)];
    setTapExpression(randomExpr);
    setTimeout(() => {
      setTapExpression(null);
    }, 850);

    if (onPress) {
      onPress();
    }
  };

  const Wrapper = (onPress || tapToJiggle) ? TouchableOpacity : View;

  return (
    <View style={styles.wrapper}>
      <Wrapper onPress={handlePress} activeOpacity={0.9}>
        <View style={{ width: size, height: size }}>
          {/* Ground shadow layer */}
          <Animated.View style={[StyleSheet.absoluteFill, shadowStyle]} pointerEvents="none">
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Ellipse cx={size / 2} cy={size - 10} rx={size * 0.3} ry={8} fill="#00000018" />
            </Svg>
          </Animated.View>

          {/* Animating wobbly body + face layer */}
          <Animated.View style={[StyleSheet.absoluteFill, bodyStyle]}>
            <CharacterBodySVG
              silhouette={character.silhouette}
              color={character.color}
              pattern={character.pattern}
              size={size}
            />
            {showFace && (
              <Animated.View style={[StyleSheet.absoluteFill, faceStyle]} pointerEvents="none">
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  <Face size={size} silhouette={character.silhouette} expression={currentExpression} />
                </Svg>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Wrapper>
      {showName && (
        <Text style={[styles.name, { color: character.color }]}>{character.name}</Text>
      )}
    </View>
  );
}

// ─── SVG Character Body ───────────────────────────────────────────────────────
interface SVGProps {
  silhouette: SilhouetteId;
  color: string;
  pattern: PatternId;
  size: number;
}

function CharacterBodySVG({ silhouette, color, pattern, size }: SVGProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const patternId = 'char-pattern';
  const clipId = 'char-clip';
  const lightColor = lighten(color, 0.35);
  const darkColor = darken(color, 0.15);

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        {/* Pattern overlay */}
        {pattern === 'stripes' && (
          <SvgPattern id={patternId} patternUnits="userSpaceOnUse" width="16" height="16">
            <Rect width="16" height="16" fill="transparent" />
            <Line x1="0" y1="8" x2="16" y2="8" stroke="white" strokeWidth="3.5" strokeOpacity="0.35" />
          </SvgPattern>
        )}
        {pattern === 'dots' && (
          <SvgPattern id={patternId} patternUnits="userSpaceOnUse" width="16" height="16">
            <Rect width="16" height="16" fill="transparent" />
            <Circle cx="8" cy="8" r="3" fill="white" fillOpacity="0.38" />
          </SvgPattern>
        )}
        {pattern === 'swirls' && (
          <SvgPattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
            <Rect width="20" height="20" fill="transparent" />
            <Path
              d="M4 10 Q10 4 16 10 Q10 16 4 10"
              stroke="white" strokeWidth="2" fill="none" strokeOpacity="0.4"
            />
          </SvgPattern>
        )}
        {pattern === 'solid' && (
          <SvgPattern id={patternId} patternUnits="userSpaceOnUse" width="1" height="1">
            <Rect width="1" height="1" fill="transparent" />
          </SvgPattern>
        )}

        {/* Clip path for pattern */}
        <ClipPath id={clipId}>
          <SilhouettePath silhouette={silhouette} size={s} />
        </ClipPath>

        {/* Radial gradient for body */}
        <RadialGradient id="bodyGrad" cx="40%" cy="35%" r="65%">
          <Stop offset="0%" stopColor={lightColor} />
          <Stop offset="100%" stopColor={darkColor} />
        </RadialGradient>
      </Defs>



      {/* Body fill */}
      <G>
        <SilhouettePath silhouette={silhouette} size={s} fill="url(#bodyGrad)" />
      </G>

      {/* Pattern overlay */}
      <G clipPath={`url(#${clipId})`}>
        <Rect x="0" y="0" width={s} height={s} fill={`url(#${patternId})`} />
      </G>

      {/* Silhouette Outline */}
      <SilhouettePath
        silhouette={silhouette}
        size={s}
        fill="none"
        stroke="#1E1B4B"
        strokeWidth={s * 0.022}
      />
    </Svg>
  );
}

// ─── Silhouette paths ────────────────────────────────────────────────────────
export function SilhouettePath({
  silhouette, size, fill = '#000', stroke, strokeWidth,
}: { silhouette: SilhouetteId; size: number; fill?: string; stroke?: string; strokeWidth?: number }) {
  const s = size;
  const pad = s * 0.08;

  switch (silhouette) {
    case 'blob':
      return (
        <Path
          d={`M${s*0.5},${pad} C${s*0.85},${pad} ${s-pad},${s*0.3} ${s-pad},${s*0.55} C${s-pad},${s*0.82} ${s*0.75},${s-pad} ${s*0.5},${s-pad} C${s*0.25},${s-pad} ${pad},${s*0.8} ${pad},${s*0.55} C${pad},${s*0.28} ${s*0.15},${pad} ${s*0.5},${pad} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'cloud':
      return (
        <Path
          d={`M${s*0.25},${s*0.65} C${s*0.1},${s*0.65} ${s*0.05},${s*0.45} ${s*0.2},${s*0.38} C${s*0.15},${s*0.15} ${s*0.45},${s*0.1} ${s*0.5},${s*0.28} C${s*0.55},${s*0.1} ${s*0.85},${s*0.15} ${s*0.8},${s*0.38} C${s*0.95},${s*0.45} ${s*0.9},${s*0.65} ${s*0.75},${s*0.65} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'star':
      // 5-point star
      return (
        <Polygon
          points={starPoints(s / 2, s / 2, s * 0.44, s * 0.2, 5)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'drop':
      return (
        <Path
          d={`M${s*0.5},${pad} C${s*0.85},${s*0.35} ${s*0.85},${s*0.6} ${s*0.5},${s-pad} C${s*0.15},${s*0.6} ${s*0.15},${s*0.35} ${s*0.5},${pad} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'round':
    default:
      return (
        <Circle
          cx={s / 2}
          cy={s / 2}
          r={s * 0.44}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
}

function starPoints(
  cx: number, cy: number, outerR: number, innerR: number, numPoints: number
): string {
  const points: string[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / numPoints) * i - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
}

// ─── Face ─────────────────────────────────────────────────────────────────────
function Face({
  size,
  silhouette,
  expression = 'default',
}: {
  size: number;
  silhouette: SilhouetteId;
  expression?: 'default' | 'excited' | 'pain1' | 'pain2' | 'pain3' | 'pain4' | 'pain5' | 'scream' | 'dizzy' | 'silly' | 'flat';
}) {
  const s = size;
  const faceY = silhouette === 'cloud' ? s * 0.38 : s * 0.45;
  const eyeY = faceY - s * 0.05;
  const eyeSpacing = s * 0.065;
  const cx = s / 2;

  const lx = cx - eyeSpacing;
  const rx = cx + eyeSpacing;
  const strokeColor = '#1E1B4B';
  const strokeWidth = s * 0.025;

  // Generate unique IDs for ClipPath to prevent collision when multiple characters are rendered
  const idRef = React.useRef(Math.random().toString(36).substring(2, 9));
  const lClipId = `left-eye-clip-${idRef.current}`;
  const rClipId = `right-eye-clip-${idRef.current}`;

  return (
    <G>
      {/* Eyebrows */}
      {/* Worried Eyebrows for pain3, pain5, and scream */}
      {(expression === 'pain3' || expression === 'pain5' || expression === 'scream') && (
        <G>
          <Path
            d={`M${lx - s * 0.06},${eyeY - s * 0.03} Q${lx},${eyeY - s * 0.08} ${lx + s * 0.04},${eyeY - s * 0.09}`}
            stroke={strokeColor}
            strokeWidth={s * 0.02}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M${rx + s * 0.06},${eyeY - s * 0.03} Q${rx},${eyeY - s * 0.08} ${rx - s * 0.04},${eyeY - s * 0.09}`}
            stroke={strokeColor}
            strokeWidth={s * 0.02}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      )}

      {/* Angry Eyebrows for pain4 */}
      {expression === 'pain4' && (
        <G>
          <Path
            d={`M${lx - s * 0.06},${eyeY - s * 0.1} L${lx + s * 0.04},${eyeY - s * 0.05}`}
            stroke={strokeColor}
            strokeWidth={s * 0.022}
            strokeLinecap="round"
          />
          <Path
            d={`M${rx + s * 0.06},${eyeY - s * 0.1} L${rx - s * 0.04},${eyeY - s * 0.05}`}
            stroke={strokeColor}
            strokeWidth={s * 0.022}
            strokeLinecap="round"
          />
        </G>
      )}

      {/* Eyes */}
      {expression === 'excited' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Ellipse cx={lx} cy={eyeY} rx={s * 0.11} ry={s * 0.12} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Ellipse cx={rx} cy={eyeY} rx={s * 0.11} ry={s * 0.12} />
            </ClipPath>
          </Defs>
          {/* Left eye */}
          <Ellipse cx={lx} cy={eyeY} rx={s * 0.11} ry={s * 0.12} fill="white" />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx} cy={eyeY} r={s * 0.065} fill={strokeColor} />
            <Circle cx={lx - s * 0.03} cy={eyeY - s * 0.03} r={s * 0.02} fill="white" />
          </G>

          {/* Right eye */}
          <Ellipse cx={rx} cy={eyeY} rx={s * 0.11} ry={s * 0.12} fill="white" />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx} cy={eyeY} r={s * 0.065} fill={strokeColor} />
            <Circle cx={rx - s * 0.03} cy={eyeY - s * 0.03} r={s * 0.02} fill="white" />
          </G>
        </>
      )}

      {expression === 'scream' && (
        <>
          {/* Surprised popping circular eyes! */}
          <Circle cx={lx} cy={eyeY} r={s * 0.11} fill="white" stroke={strokeColor} strokeWidth={s * 0.022} />
          <Circle cx={lx} cy={eyeY} r={s * 0.035} fill={strokeColor} />
          <Circle cx={rx} cy={eyeY} r={s * 0.11} fill="white" stroke={strokeColor} strokeWidth={s * 0.022} />
          <Circle cx={rx} cy={eyeY} r={s * 0.035} fill={strokeColor} />
        </>
      )}

      {expression === 'dizzy' && (
        <G>
          {/* Crossed X X eyes */}
          <Line x1={lx - s * 0.05} y1={eyeY - s * 0.05} x2={lx + s * 0.05} y2={eyeY + s * 0.05} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
          <Line x1={lx + s * 0.05} y1={eyeY - s * 0.05} x2={lx - s * 0.05} y2={eyeY + s * 0.05} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
          
          <Line x1={rx - s * 0.05} y1={eyeY - s * 0.05} x2={rx + s * 0.05} y2={eyeY + s * 0.05} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
          <Line x1={rx + s * 0.05} y1={eyeY - s * 0.05} x2={rx - s * 0.05} y2={eyeY + s * 0.05} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
        </G>
      )}

      {expression === 'silly' && (
        <>
          {/* Goofy derp eyes: left is huge, right is tiny */}
          <Circle cx={lx} cy={eyeY} r={s * 0.105} fill="white" stroke={strokeColor} strokeWidth={s * 0.018} />
          <Circle cx={lx - s * 0.03} cy={eyeY + s * 0.025} r={s * 0.035} fill={strokeColor} />
          
          <Circle cx={rx} cy={eyeY} r={s * 0.06} fill="white" stroke={strokeColor} strokeWidth={s * 0.018} />
          <Circle cx={rx + s * 0.018} cy={eyeY - s * 0.018} r={s * 0.022} fill={strokeColor} />
        </>
      )}

      {expression === 'flat' && (
        <G>
          {/* Flat line eyes - - */}
          <Line x1={lx - s * 0.065} y1={eyeY} x2={lx + s * 0.065} y2={eyeY} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
          <Line x1={rx - s * 0.065} y1={eyeY} x2={rx + s * 0.065} y2={eyeY} stroke={strokeColor} strokeWidth={s * 0.028} strokeLinecap="round" />
        </G>
      )}

      {expression === 'default' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Ellipse cx={lx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Ellipse cx={rx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} />
            </ClipPath>
          </Defs>
          {/* Left eye */}
          <Ellipse cx={lx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} fill="white" />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx + s * 0.015} cy={eyeY} r={s * 0.045} fill={strokeColor} />
          </G>

          {/* Right eye */}
          <Ellipse cx={rx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} fill="white" />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx + s * 0.015} cy={eyeY} r={s * 0.045} fill={strokeColor} />
          </G>
        </>
      )}

      {expression === 'pain1' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Ellipse cx={lx} cy={eyeY} rx={s * 0.075} ry={s * 0.09} transform={`rotate(-12, ${lx}, ${eyeY})`} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Ellipse cx={rx} cy={eyeY} rx={s * 0.075} ry={s * 0.09} transform={`rotate(12, ${rx}, ${eyeY})`} />
            </ClipPath>
          </Defs>
          {/* Left eye */}
          <Ellipse cx={lx} cy={eyeY} rx={s * 0.075} ry={s * 0.09} fill="white" transform={`rotate(-12, ${lx}, ${eyeY})`} />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx + s * 0.012} cy={eyeY - s * 0.02} r={s * 0.042} fill={strokeColor} />
          </G>

          {/* Right eye */}
          <Ellipse cx={rx} cy={eyeY} rx={s * 0.075} ry={s * 0.09} fill="white" transform={`rotate(12, ${rx}, ${eyeY})`} />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx + s * 0.012} cy={eyeY - s * 0.02} r={s * 0.042} fill={strokeColor} />
          </G>
        </>
      )}

      {expression === 'pain2' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Ellipse cx={lx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Path d={`M${rx - s * 0.08},${eyeY} Q${rx},${eyeY - s * 0.015} ${rx + s * 0.08},${eyeY} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY} Z`} />
            </ClipPath>
          </Defs>
          {/* Left eye (normal) */}
          <Ellipse cx={lx} cy={eyeY} rx={s * 0.08} ry={s * 0.09} fill="white" />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx - s * 0.01} cy={eyeY + s * 0.01} r={s * 0.042} fill={strokeColor} />
          </G>

          {/* Right eye (half-lidded) */}
          <Path d={`M${rx - s * 0.08},${eyeY} Q${rx},${eyeY - s * 0.015} ${rx + s * 0.08},${eyeY} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY} Z`} fill="white" />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx - s * 0.01} cy={eyeY + s * 0.02} r={s * 0.042} fill={strokeColor} />
          </G>
          {/* Eyelid line */}
          <Path d={`M${rx - s * 0.082},${eyeY} L${rx + s * 0.082},${eyeY}`} stroke={strokeColor} strokeWidth={s * 0.02} strokeLinecap="round" />
        </>
      )}

      {expression === 'pain3' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Path d={`M${lx - s * 0.08},${eyeY + s * 0.01} Q${lx},${eyeY - s * 0.01} ${lx + s * 0.08},${eyeY + s * 0.01} Q${lx},${eyeY + s * 0.09} ${lx - s * 0.08},${eyeY + s * 0.01} Z`} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Path d={`M${rx - s * 0.08},${eyeY + s * 0.01} Q${rx},${eyeY - s * 0.01} ${rx + s * 0.08},${eyeY + s * 0.01} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY + s * 0.01} Z`} />
            </ClipPath>
          </Defs>
          {/* Left eye */}
          <Path d={`M${lx - s * 0.08},${eyeY + s * 0.01} Q${lx},${eyeY - s * 0.01} ${lx + s * 0.08},${eyeY + s * 0.01} Q${lx},${eyeY + s * 0.09} ${lx - s * 0.08},${eyeY + s * 0.01} Z`} fill="white" />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx} cy={eyeY + s * 0.025} r={s * 0.042} fill={strokeColor} />
          </G>
          <Path d={`M${lx - s * 0.085},${eyeY + s * 0.01} L${lx + s * 0.085},${eyeY + s * 0.01}`} stroke={strokeColor} strokeWidth={s * 0.02} strokeLinecap="round" />

          {/* Right eye */}
          <Path d={`M${rx - s * 0.08},${eyeY + s * 0.01} Q${rx},${eyeY - s * 0.01} ${rx + s * 0.08},${eyeY + s * 0.01} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY + s * 0.01} Z`} fill="white" />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx} cy={eyeY + s * 0.025} r={s * 0.042} fill={strokeColor} />
          </G>
          <Path d={`M${rx - s * 0.085},${eyeY + s * 0.01} L${rx + s * 0.085},${eyeY + s * 0.01}`} stroke={strokeColor} strokeWidth={s * 0.02} strokeLinecap="round" />
        </>
      )}

      {expression === 'pain4' && (
        <>
          <Defs>
            <ClipPath id={lClipId}>
              <Path d={`M${lx - s * 0.08},${eyeY - s * 0.02} L${lx + s * 0.08},${eyeY + s * 0.02} Q${lx},${eyeY + s * 0.09} ${lx - s * 0.08},${eyeY - s * 0.02} Z`} />
            </ClipPath>
            <ClipPath id={rClipId}>
              <Path d={`M${rx - s * 0.08},${eyeY + s * 0.02} L${rx + s * 0.08},${eyeY - s * 0.02} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY + s * 0.02} Z`} />
            </ClipPath>
          </Defs>
          {/* Left eye */}
          <Path d={`M${lx - s * 0.08},${eyeY - s * 0.02} L${lx + s * 0.08},${eyeY + s * 0.02} Q${lx},${eyeY + s * 0.09} ${lx - s * 0.08},${eyeY - s * 0.02} Z`} fill="white" />
          <G clipPath={`url(#${lClipId})`}>
            <Circle cx={lx - s * 0.015} cy={eyeY + s * 0.015} r={s * 0.042} fill={strokeColor} />
          </G>
          <Path d={`M${lx - s * 0.085},${eyeY - s * 0.02} L${lx + s * 0.085},${eyeY + s * 0.02}`} stroke={strokeColor} strokeWidth={s * 0.02} strokeLinecap="round" />

          {/* Right eye */}
          <Path d={`M${rx - s * 0.08},${eyeY + s * 0.02} L${rx + s * 0.08},${eyeY - s * 0.02} Q${rx},${eyeY + s * 0.09} ${rx - s * 0.08},${eyeY + s * 0.02} Z`} fill="white" />
          <G clipPath={`url(#${rClipId})`}>
            <Circle cx={rx + s * 0.015} cy={eyeY + s * 0.015} r={s * 0.042} fill={strokeColor} />
          </G>
          <Path d={`M${rx - s * 0.085},${eyeY + s * 0.02} L${rx + s * 0.085},${eyeY - s * 0.02}`} stroke={strokeColor} strokeWidth={s * 0.02} strokeLinecap="round" />
        </>
      )}

      {expression === 'pain5' && (
        <>
          {/* Left eye wince (>) */}
          <Path
            d={`M${lx - s * 0.045},${eyeY - s * 0.045} L${lx + s * 0.045},${eyeY} L${lx - s * 0.045},${eyeY + s * 0.045}`}
            stroke={strokeColor}
            strokeWidth={s * 0.032}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right eye wince (<) */}
          <Path
            d={`M${rx + s * 0.045},${eyeY - s * 0.045} L${rx - s * 0.045},${eyeY} L${rx + s * 0.045},${eyeY + s * 0.045}`}
            stroke={strokeColor}
            strokeWidth={s * 0.032}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Mouths */}
      {expression === 'excited' && (
        <Path
          d={`M${cx - s * 0.09},${faceY + s * 0.05} C${cx - s * 0.09},${faceY + s * 0.17} ${cx + s * 0.09},${faceY + s * 0.17} ${cx + s * 0.09},${faceY + s * 0.05} Z`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="#FFA4B4"
          strokeLinecap="round"
        />
      )}

      {expression === 'scream' && (
        <G>
          {/* Big screaming mouth hole */}
          <Path
            d={`M${cx - s * 0.075},${faceY + s * 0.04} C${cx - s * 0.075},${faceY + s * 0.22} ${cx + s * 0.075},${faceY + s * 0.22} ${cx + s * 0.075},${faceY + s * 0.04} Z`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill={strokeColor}
            strokeLinecap="round"
          />
          {/* Screaming pink tongue */}
          <Path
            d={`M${cx - s * 0.045},${faceY + s * 0.16} C${cx - s * 0.045},${faceY + s * 0.21} ${cx + s * 0.045},${faceY + s * 0.21} ${cx + s * 0.045},${faceY + s * 0.16} Z`}
            fill="#FFA4B4"
          />
        </G>
      )}

      {expression === 'dizzy' && (
        <Path
          d={`M${cx - s * 0.09},${faceY + s * 0.07} Q${cx - s * 0.045},${faceY + s * 0.02} ${cx},${faceY + s * 0.07} T${cx + s * 0.09},${faceY + s * 0.07}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'silly' && (
        <G>
          {/* Tongue sticking out mouth */}
          <Path
            d={`M${cx - s * 0.08},${faceY + s * 0.06} Q${cx},${faceY + s * 0.09} ${cx + s * 0.08},${faceY + s * 0.06}`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M${cx - s * 0.02},${faceY + s * 0.08} C${cx - s * 0.02},${faceY + s * 0.17} ${cx + s * 0.05},${faceY + s * 0.17} ${cx + s * 0.05},${faceY + s * 0.08} Z`}
            fill="#FFA4B4"
            stroke={strokeColor}
            strokeWidth={s * 0.015}
          />
          <Line
            x1={cx + s * 0.015}
            y1={faceY + s * 0.08}
            x2={cx + s * 0.015}
            y2={faceY + s * 0.14}
            stroke={strokeColor}
            strokeWidth={s * 0.015}
          />
        </G>
      )}

      {expression === 'flat' && (
        <Line
          x1={cx - s * 0.045}
          y1={faceY + s * 0.08}
          x2={cx + s * 0.045}
          y2={faceY + s * 0.08}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {expression === 'default' && (
        <Path
          d={`M${cx - s * 0.1},${faceY + s * 0.07} Q${cx},${faceY + s * 0.14} ${cx + s * 0.1},${faceY + s * 0.07}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'pain1' && (
        <Path
          d={`M${cx - s * 0.1},${faceY + s * 0.07} Q${cx},${faceY + s * 0.15} ${cx + s * 0.1},${faceY + s * 0.07}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'pain2' && (
        <Path
          d={`M${cx - s * 0.08},${faceY + s * 0.08} H${cx + s * 0.08}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {expression === 'pain3' && (
        <Path
          d={`M${cx - s * 0.08},${faceY + s * 0.09} Q${cx - s * 0.04},${faceY + s * 0.06} ${cx},${faceY + s * 0.09} Q${cx + s * 0.04},${faceY + s * 0.12} ${cx + s * 0.08},${faceY + s * 0.09}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'pain4' && (
        <Path
          d={`M${cx - s * 0.08},${faceY + s * 0.11} Q${cx},${faceY + s * 0.06} ${cx + s * 0.08},${faceY + s * 0.11}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'pain5' && (
        <Path
          d={`M${cx - s * 0.07},${faceY + s * 0.09} C${cx - s * 0.07},${faceY + s * 0.17} ${cx + s * 0.07},${faceY + s * 0.17} ${cx + s * 0.07},${faceY + s * 0.09} Z`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={strokeColor}
          strokeLinecap="round"
        />
      )}

      {/* Teardrops */}
      {expression === 'pain4' && (
        <Path
          d={`M${lx},${eyeY + s * 0.05} Q${lx - s * 0.02},${eyeY + s * 0.08} ${lx},${eyeY + s * 0.1} Q${lx + s * 0.02},${eyeY + s * 0.08} ${lx},${eyeY + s * 0.05}`}
          fill="#60A5FA"
        />
      )}

      {expression === 'pain5' && (
        <G>
          <Path
            d={`M${lx - s * 0.02},${eyeY + s * 0.05} Q${lx - s * 0.04},${eyeY + s * 0.08} ${lx - s * 0.02},${eyeY + s * 0.1} Q${lx},${eyeY + s * 0.08} ${lx - s * 0.02},${eyeY + s * 0.05}`}
            fill="#60A5FA"
          />
          <Path
            d={`M${rx + s * 0.02},${eyeY + s * 0.05} Q${rx + s * 0.04},${eyeY + s * 0.08} ${rx + s * 0.02},${eyeY + s * 0.1} Q${rx},${eyeY + s * 0.08} ${rx + s * 0.02},${eyeY + s * 0.05}`}
            fill="#60A5FA"
          />
        </G>
      )}

      {/* Blush cheeks */}
      {expression !== 'pain4' && expression !== 'pain5' && expression !== 'flat' && (
        <>
          <Ellipse
            cx={lx - s * 0.05}
            cy={eyeY + s * 0.06}
            rx={s * 0.065}
            ry={s * 0.038}
            fill="#FFA4B4"
            fillOpacity={0.6}
          />
          <Ellipse
            cx={rx + s * 0.05}
            cy={eyeY + s * 0.06}
            rx={s * 0.065}
            ry={s * 0.038}
            fill="#FFA4B4"
            fillOpacity={0.6}
          />
        </>
      )}
    </G>
  );
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${nr},${ng},${nb})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));
  return `rgb(${nr},${ng},${nb})`;
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
});
