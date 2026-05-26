import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg from 'react-native-svg';
import Character, { SilhouettePath } from '../components/Character';
import { SILHOUETTE_OPTIONS, SilhouetteId } from '../utils/characterBuilder';
import { RootStackParamList } from '../../App';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SilhouetteSelection'>;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.76;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

// Children's book theme colors for each silhouette card
const SILHOUETTE_COLORS: Record<SilhouetteId, {
  color: string;
  bgColor: string;
  accent: string;
}> = {
  blob: { color: '#F97316', bgColor: '#FFF7ED', accent: '#FFEDD5' },
  cloud: { color: '#3B82F6', bgColor: '#F0F9FF', accent: '#E0F2FE' },
  star: { color: '#EAB308', bgColor: '#FEFDF0', accent: '#FEF9C3' },
  drop: { color: '#06B6D4', bgColor: '#ECFEFF', accent: '#CFFAFE' },
  round: { color: '#EC4899', bgColor: '#FDF2F8', accent: '#FCE7F3' },
};

export default function SilhouetteSelectionScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex && index >= 0 && index < SILHOUETTE_OPTIONS.length) {
      setActiveIndex(index);
    }
  };

  const handleConfirm = () => {
    if (isConfirming) return;
    setIsConfirming(true);
    setTimeout(() => {
      const selectedOpt = SILHOUETTE_OPTIONS[activeIndex];
      navigation.navigate('Questionnaire', { silhouette: selectedOpt.id });
      // Wait a little before resetting so the user doesn't see it reset before transition
      setTimeout(() => setIsConfirming(false), 500);
    }, 900);
  };

  const renderItem = ({ item, index }: { item: typeof SILHOUETTE_OPTIONS[number]; index: number }) => {
    const isSelected = index === activeIndex;
    const colors = SILHOUETTE_COLORS[item.id];
    const isExcited = isSelected && isConfirming;

    return (
      <View style={styles.slideContainer}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.card,
            {
              backgroundColor: colors.bgColor,
              borderColor: isSelected ? colors.color : '#E5E7EB',
              borderWidth: isSelected ? 4 : 3,
            },
          ]}
        >
          <View style={[styles.svgWrapper, { backgroundColor: colors.accent }]}>
            <Animated.View 
              entering={ZoomIn.delay(200).springify()}
              style={isExcited ? { transform: [{ scale: 1.25 }] } : undefined}
            >
              <Character
                character={{
                  name: '',
                  silhouette: item.id,
                  color: isSelected ? colors.color : '#9CA3AF',
                  pattern: 'solid',
                  painType: 'stabbing',
                  painTiming: 'morning',
                  painEffect: 'tired',
                  emoji: '',
                  personality: '',
                  catchphrase: '',
                  medical: {} as any,
                }}
                size={140}
                showName={false}
                animated={isSelected && !isExcited}
                expression={isExcited ? 'excited' : 'default'}
                animateFaceMount={isSelected}
                showFace={isSelected}
              />
            </Animated.View>
          </View>

          <Text style={[styles.label, { color: '#1E1B4B' }]}>{item.label}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Friend!</Text>
          <Text style={styles.subtitle}>Swipe to scroll through shapes and choose a silhouette for your buddy</Text>
        </View>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={SILHOUETTE_OPTIONS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={width}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        {/* Silhouette-based Navigation Bar (instead of dots) */}
        <View style={styles.silhouetteNav}>
          {SILHOUETTE_OPTIONS.map((item, index) => {
            const isSelected = index === activeIndex;
            const colors = SILHOUETTE_COLORS[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => {
                  setActiveIndex(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                activeOpacity={0.8}
              >
                <Svg width={32} height={32} viewBox="0 0 160 160">
                  <SilhouettePath
                    silhouette={item.id}
                    size={160}
                    fill={isSelected ? colors.color : '#9CA3AF'}
                    stroke="#1E1B4B"
                    strokeWidth={8}
                  />
                </Svg>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: SILHOUETTE_COLORS[SILHOUETTE_OPTIONS[activeIndex].id].color,
                shadowColor: SILHOUETTE_COLORS[SILHOUETTE_OPTIONS[activeIndex].id].color,
              },
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Choose This Shape →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDF9F2',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  carouselContainer: {
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    alignItems: 'center',
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  svgWrapper: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },
  label: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  silhouetteNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  navItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
});
